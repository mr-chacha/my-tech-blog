import {doc, getDoc, collection, addDoc} from "firebase/firestore";
import {db, storage} from "@/server/firebase";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";

export const useBlogApis = () => {
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

  return {fetchDetailPost, postImage, postPost};
};
