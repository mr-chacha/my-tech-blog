// import {auth, db} from "@/server/firebase";
// import {uploadToS3} from "@/server/aws-s3";
// import {doc, getDoc, collection, addDoc, deleteDoc, updateDoc} from "firebase/firestore";
// import {GithubAuthProvider, signInWithPopup, signOut} from "firebase/auth";

// export const useBlogApis = () => {
//   // 깃헙 로그인
//   const gutHubLogin = async () => {
//     const provider = new GithubAuthProvider();
//     const result = await signInWithPopup(auth, provider);
//     const adminEmail = process.env.REACT_APP_GITHUB_EMAIL;
//     // 어드민 계정외에 로그인시 로그아웃
//     if (adminEmail === result.user.email) {
//       return result;
//     } else {
//       alert("관리자 계정이 아닙니다");
//       await signOut(auth);
//     }
//   };
//   // 상세 포스트 조회
//   const fetchDetailPost = async (detailId) => {
//     const postRef = doc(db, "posts", detailId);
//     const postSnap = await getDoc(postRef);

//     const postData = {
//       id: postSnap.id,
//       ...postSnap.data(),
//     };

//     return postData;
//   };
//   // 포스트 등록
//   const postPost = async (collectionName, postData) => {
//     const docRef = await addDoc(collection(db, collectionName), postData);
//     return docRef;
//   };

//   const postImage = async (fileName, tempFile) => {
//     try {
//       const downloadURL = await uploadToS3(fileName, tempFile.file);
//       return downloadURL;
//     } catch (error) {
//       console.error("이미지 업로드 실패:", error);
//       throw error;
//     }
//   };

//   // 포스트 삭제
//   const deletePost = async (postId) => {
//     const postRef = doc(db, "posts", postId);
//     await deleteDoc(postRef);
//   };

//   // 포스트 수정
//   const updatePost = async (postId, updateData) => {
//     const postRef = doc(db, "posts", postId);
//     await updateDoc(postRef, updateData);
//   };

//   return {fetchDetailPost, postImage, postPost, gutHubLogin, deletePost, updatePost};
// };

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
