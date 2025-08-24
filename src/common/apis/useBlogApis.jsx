import {auth, db, storage} from "@/server/firebase";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";
import {doc, getDoc, collection, addDoc} from "firebase/firestore";
import {GithubAuthProvider, signInWithPopup, signOut} from "firebase/auth";

export const useBlogApis = () => {
  // 깃헙 로그인
  const gutHubLogin = async () => {
    const provider = new GithubAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const adminEmail = process.env.REACT_APP_GITHUB_EMAIL;
    // 어드민 계정외에 로그인시 로그아웃
    if (adminEmail !== result.email) {
      alert("관리자 계정이 아닙니다");
      await signOut(auth);
      return;
    } else {
      return result;
    }
  };
  // 상세 포스트 조회
  const fetchDetailPost = async (detailId) => {
    const postRef = doc(db, "posts", detailId);
    const postSnap = await getDoc(postRef);

    const postData = {
      id: postSnap.id,
      ...postSnap.data(),
    };

    return postData;
  };
  // 포스트 등록
  const postPost = async (collectionName, postData) => {
    const docRef = await addDoc(collection(db, collectionName), postData);
    return docRef;
  };

  const postImage = async (fileName, tempFile) => {
    const storageRef = ref(storage, fileName);
    const snapshot = await uploadBytes(storageRef, tempFile.file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  };

  return {fetchDetailPost, postImage, postPost, gutHubLogin};
};
