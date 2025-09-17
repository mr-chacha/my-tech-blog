const API_BASE_URL = process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5001/api";
import {GithubAuthProvider, signInWithPopup, signOut} from "firebase/auth";
import {auth} from "@/server/firebase";

export const useBlogApis = () => {
  // 깃헙 로그인
  const gutHubLogin = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const adminEmail = process.env.REACT_APP_GITHUB_EMAIL;
    // 어드민 계정외에 로그인시 로그아웃
    if (adminEmail === result.user.email) {
      return result;
    } else {
      alert("관리자 계정이 아닙니다");
      await signOut(auth);
    }
  };

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

  // 이미지 업로드
  const postImage = async (file) => {
    // file만 받음
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "이미지 업로드 실패");
    }

    return result.data.url;
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

  return {fetchPosts, fetchDetailPost, createPost, updatePost, deletePost, gutHubLogin, postImage};
};
