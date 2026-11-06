"use client";
import { validateMediaFile } from "@/common/util/media.mjs";
import { auth } from "@/lib/firebase-client";
import { GithubAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { apiClient } from "./apiClient";

export const useBlogApis = () => {
  const gutHubLogin = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);

    try {
      const response = await apiClient.post("/github/verify", {});
      if (!response.isAdmin) throw new Error("관리자 계정이 아닙니다.");
      await apiClient.post("/auth/session", {});
    } catch (error) {
      await signOut(auth);
      throw error;
    }

    return result;
  };

  const fetchPosts = async (options = {}) => {
    return await apiClient.get(`/firebase/posts?${new URLSearchParams(options)}`);
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

  const fetchPortfolio = async () => {
    return await apiClient.get("/firebase/portfolio");
  };

  const fetchPortfolioItem = async (id) => {
    return await apiClient.get(`/firebase/portfolio/${id}`);
  };

  const createPortfolio = async (data) => {
    return await apiClient.post("/firebase/portfolio", data);
  };

  const updatePortfolio = async (id, data) => {
    return await apiClient.put(`/firebase/portfolio/${id}`, data);
  };

  const deletePortfolio = async (id) => {
    return await apiClient.delete(`/firebase/portfolio/${id}`);
  };

  const postImage = async (file) => {
    try {
      validateMediaFile(file);
      const reader = new FileReader();
      const base64 = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await apiClient.post("/aws/upload", {
        fileType: file.type,
        fileData: base64,
      });

      return response;
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
    fetchPortfolio,
    fetchPortfolioItem,
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
  };
};
