const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Firebase Admin 설정 추가
const {db, collection, query, orderBy, getDocs, doc, getDoc} = require("./src/server/firebaseAdmin");
const app = express();
const PORT = process.env.PORT || 5001;

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
const postsRouter = require("./src/server/routes/posts");

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

// 목록조회 API
app.get("/api/posts", async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const postData = await getDocs(q);
    const postList = postData.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
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
    res.status(500).json({
      success: false,
      message: "포스트 데이터를 가져오는데 실패했습니다.",
      error: error.message,
    });
  }
});

// 상세조회 API 추가
app.get("/api/posts/:id", async (req, res) => {
  try {
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    const {id} = req.params;
    const postRef = doc(db, "posts", id);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      return res.status(404).json({
        success: false,
        message: "포스트를 찾을 수 없습니다.",
      });
    }

    const data = postSnap.data();
    const postData = {
      id: postSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    };

    res.json({
      success: true,
      data: postData,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "포스트 상세 정보를 가져오는데 실패했습니다.",
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
