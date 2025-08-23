import {doc, getDoc} from "firebase/firestore";
import {db} from "@/server/firebase";
export const useBlogApis = () => {
  const fetchDetailPost = async (detailId) => {
    const postRef = doc(db, "posts", detailId);
    const postSnap = await getDoc(postRef);

    const postData = {
      id: postSnap.id,
      ...postSnap.data(),
    };

    return postData;
  };

  return {fetchDetailPost};
};
