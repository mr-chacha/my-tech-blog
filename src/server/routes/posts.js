const express = require("express");
const router = express.Router();
const {db, collection, query, orderBy, getDocs, where} = require("../firebaseAdmin");

// 유틸리티 함수들
const formatTimestamp = (timestamp) => {
  return timestamp?.toDate?.()?.toISOString() || timestamp;
};

const formatPostData = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
};

// GET /api/v1/posts - 포스트 목록 조회
router.get("/", async (req, res) => {
  try {
    const {page = 1, limit = 10, category, featured, sort = "createdAt", order = "desc"} = req.query;

    let q = collection(db, "posts");

    // 카테고리 필터
    if (category) {
      q = query(q, where("category", "==", category));
    }

    // 추천 포스트 필터
    if (featured === "true") {
      q = query(q, where("isRecommended", "==", true));
    }

    // 정렬
    q = query(q, orderBy(sort, order));

    const postData = await getDocs(q);
    const allPosts = postData.docs.map(formatPostData);

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const posts = allPosts.slice(startIndex, endIndex);

    // 메타데이터
    const totalCount = allPosts.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = endIndex < totalCount;
    const hasPrev = startIndex > 0;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNext,
          hasPrev,
        },
      },
    });
  } catch (error) {
    console.error("포스트 목록 조회 실패:", error);
    res.status(500).json({
      success: false,
      message: "포스트 목록을 가져오는데 실패했습니다.",
      error: error.message,
    });
  }
});

module.exports = router;
