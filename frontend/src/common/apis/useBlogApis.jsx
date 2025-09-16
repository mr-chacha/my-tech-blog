const API_BASE_URL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001/api";

export const useBlogApis = () => {
  // 포스트 리스트 조회
  const fetchPosts = async () => {
    const response = await fetch(`${API_BASE_URL}/posts`);
    return response.json();
  };

  // 포스트 상세 조회
  const fetchDetailPost = async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`);
    return response.json();
  };

  // 포스트 생성
  const createPost = async (postData) => {
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  };

  // 포스트 수정
  const updatePost = async (id, postData) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
    return response.json();
  };

  // 포스트 삭제
  const deletePost = async (id) => {
    const response = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: "DELETE",
    });
    return response.json();
  };

  return {fetchPosts, fetchDetailPost, createPost, updatePost, deletePost};
};
