"use client";
import { auth } from "@/lib/firebase-client";
import { GithubAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { apiClient } from "./apiClient";

export const useBlogApis = () => {
  const gutHubLogin = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);

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

  const fetchPosts = async () => {
    return await apiClient.get("/firebase/posts");
  };

  const fetchDetailPost = async (detailId) => {
    return await apiClient.get(`/firebase/posts/${detailId}`);
  };

  const postPost = async (postData) => {
    return await apiClient.post("/firebase/posts", postData);
  };

  const updatePost = async (postId, updateData) => {
    return await apiClient.put(`/firebase/posts/${postId}`, updateData);
  };

  const deletePost = async (postId) => {
    return await apiClient.delete(`/firebase/posts/${postId}`);
  };

  const postImage = async (fileName, file) => {
    try {
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
