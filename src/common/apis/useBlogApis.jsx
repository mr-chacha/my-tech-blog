import {auth} from "@/server/firebase";
import {GithubAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import {apiClient} from "./apiClient";

export const useBlogApis = () => {
  // GitHub 로그인 (Firebase는 클라이언트에서 처리)
  const gutHubLogin = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);

    // 서버에 관리자 확인 요청
    const response = await apiClient.post("/github/verify", {
      email: result.user.email,
    });

    if (!response.isAdmin) {
      alert("관리자 계정이 아닙니다");
      await signOut(auth);
      return null;
    }

    return result;
  };

  // 포스트 목록 조회
  const fetchPosts = async () => {
    return await apiClient.get("/firebase/posts");
  };

  // 상세 포스트 조회
  const fetchDetailPost = async (detailId) => {
    return await apiClient.get(`/firebase/posts/${detailId}`);
  };

  // 포스트 등록
  const postPost = async (postData) => {
    return await apiClient.post("/firebase/posts", postData);
  };

  // 포스트 수정
  const updatePost = async (postId, updateData) => {
    return await apiClient.put(`/firebase/posts/${postId}`, updateData);
  };

  // 포스트 삭제
  const deletePost = async (postId) => {
    return await apiClient.delete(`/firebase/posts/${postId}`);
  };

  // 이미지 업로드
  const postImage = async (fileName, file) => {
    try {
      // 파일을 Base64로 변환
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await apiClient.post("/aws/upload", {
        fileName,
        fileType: file.type,
        fileData: base64,
      });

      return response.url;
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      throw error;
    }
  };

  return {
    fetchPosts,
    fetchDetailPost,
    postImage,
    postPost,
    gutHubLogin,
    deletePost,
    updatePost,
  };
};
