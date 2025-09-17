const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Firebase Admin 설정 추가
const {db} = require("./src/config/firebaseAdmin");
const app = express();
const PORT = process.env.PORT || 5001;

// backend/server.js 또는 backend/src/routes/uploads.js
const {uploadToS3} = require("./src/utils/aws-s3");
const multer = require("multer");
const upload = multer({storage: multer.memoryStorage()});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 정적 파일 제공 (프로덕션 빌드용)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
}

// API 라우터들
const postsRouter = require("./src/routes/posts");

// API 라우트 연결
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// RESTful API 엔드포인트
app.use("/api/v1/posts", postsRouter);

// 목록조회 API - Firebase Admin SDK 방식으로 수정
app.get("/api/posts", async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    // Admin SDK 방식으로 수정
    const postsCollection = db.collection("posts");
    const snapshot = await postsCollection.orderBy("createdAt", "desc").get();

    const postList = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      postList.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      });
    });

    // 클라이언트에서 자르던 방식 그대로
    const recentPosts = postList.length > 5 ? postList.slice(0, 5) : postList;
    const olderPosts = postList.length > 5 ? postList.slice(5) : [];

    res.json({
      success: true,
      data: {
        recentPosts,
        olderPosts,
        totalCount: postList.length,
      },
    });
  } catch (error) {
    console.error("포스트 조회 에러:", error);
    res.status(500).json({
      success: false,
      message: "포스트 데이터를 가져오는데 실패했습니다.",
      error: error.message,
    });
  }
});

// 상세조회 API - Firebase Admin SDK 방식으로 수정
app.get("/api/posts/:id", async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    const {id} = req.params;
    // Admin SDK 방식으로 수정
    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "포스트를 찾을 수 없습니다.",
      });
    }

    const data = docSnap.data();
    const postData = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    };

    res.json({
      success: true,
      data: postData,
    });
  } catch (error) {
    console.error("포스트 상세 조회 에러:", error);
    res.status(500).json({
      success: false,
      message: "포스트 상세 정보를 가져오는데 실패했습니다.",
      error: error.message,
    });
  }
});

// 포스트 등록 - Firebase Admin SDK 방식으로 수정
app.post("/api/posts", async (req, res) => {
  try {
    const postData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Admin SDK 방식으로 수정
    const docRef = await db.collection("posts").add(postData);

    res.json({
      success: true,
      data: {
        id: docRef.id,
        ...postData,
      },
      message: "포스트가 성공적으로 생성되었습니다.",
    });
  } catch (error) {
    console.error("포스트 생성 에러:", error);
    res.status(500).json({
      success: false,
      message: "포스트 생성에 실패했습니다.",
      error: error.message,
    });
  }
});

// 이미지 s3에 업로드
app.post("/api/upload", upload.single("image"), async (req, res) => {
  try {

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "파일이 업로드되지 않았습니다.",
        error: "No file uploaded",
      });
    }

    const fileName = `images/${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${file.originalname
      .split(".")
      .pop()}`;

    const downloadURL = await uploadToS3(fileName, file);

    res.json({
      success: true,
      data: {
        url: downloadURL,
        fileName: fileName,
      },
    });
  } catch (error) {
    console.error("업로드 에러:", error); // 디버깅용
    res.status(500).json({
      success: false,
      message: "이미지 업로드 실패",
      error: error.message,
    });
  }
});

// 포스트 수정 - Firebase Admin SDK 방식으로 추가
app.put("/api/posts/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const updateData = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Admin SDK 방식으로 수정
    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "수정할 포스트를 찾을 수 없습니다.",
      });
    }

    // 포스트 수정
    await docRef.update(updateData);

    console.log(`포스트 수정 완료: ${id}`);

    // 수정된 데이터 조회해서 반환
    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data();

    res.json({
      success: true,
      data: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || updatedData.createdAt,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || updatedData.updatedAt,
      },
      message: "포스트가 성공적으로 수정되었습니다.",
    });
  } catch (error) {
    console.error("포스트 수정 에러:", error);
    res.status(500).json({
      success: false,
      message: "포스트 수정에 실패했습니다.",
      error: error.message,
    });
  }
});

// 포스트 삭제 - Firebase Admin SDK 방식으로 수정
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const {id} = req.params;

    // Admin SDK 방식으로 수정
    const docRef = db.collection("posts").doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "삭제할 포스트를 찾을 수 없습니다.",
      });
    }

    // 포스트 삭제
    await docRef.delete();

    console.log(`포스트 삭제 완료: ${id}`);

    res.json({
      success: true,
      message: "포스트가 성공적으로 삭제되었습니다.",
      deletedId: id,
    });
  } catch (error) {
    console.error("포스트 삭제 에러:", error);
    res.status(500).json({
      success: false,
      message: "포스트 삭제에 실패했습니다.",
      error: error.message,
    });
  }
});

// API 문서 엔드포인트
app.get("/api/docs", (req, res) => {
  res.json({
    success: true,
    message: "API Documentation",
    endpoints: {
      posts: {
        "GET /api/v1/posts": "Get posts list with pagination and filters",
        "GET /api/v1/posts/featured": "Get featured posts",
        "GET /api/v1/posts/categories": "Get categories count",
        "GET /api/v1/posts/:id": "Get post by ID",
        "POST /api/v1/posts": "Create new post",
        "PUT /api/v1/posts/:id": "Update entire post",
        "PATCH /api/v1/posts/:id": "Partially update post",
        "DELETE /api/v1/posts/:id": "Delete post",
      },
      legacy: {
        "GET /api/posts": "Legacy posts endpoint (compatibility)",
      },
    },
    queryParameters: {
      posts: {
        page: "Page number (default: 1)",
        limit: "Items per page (default: 10)",
        category: "Filter by category",
        featured: "Filter featured posts (true/false)",
        sort: "Sort field (default: createdAt)",
        order: "Sort order (asc/desc, default: desc)",
      },
    },
  });
});

// 404 핸들러
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.path,
  });
});

// 프로덕션에서 모든 요청을 React 앱으로 전달
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/docs`);
});
