"use client";
import { useEffect, useRef, useState } from "react";
import { validateMediaFile } from "@/common/util/media.mjs";
import { apiClient } from "@/common/apis/apiClient";

export function usePostMedia(content, insertText, postImage) {
  const [tempFiles, setTempFiles] = useState([]);
  const uploaded = useRef(new Map());
  const prepared = useRef(new Set());
  const discard = () => {
    const pending = [...uploaded.current.values()];
    uploaded.current.clear();
    return Promise.allSettled(pending.map((item) => apiClient.delete("/aws/delete", { id: item.id })));
  };
  useEffect(() => () => { void discard(); }, []);
  const resetMedia = () => { void discard(); setTempFiles([]); };
  const handleFileUpload = async (files) => {
    const list = Array.from(files);
    list.forEach(validateMediaFile);
    for (const file of list) {
      const base64Url = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error("파일을 읽지 못했습니다.")); reader.readAsDataURL(file);
      });
      const tempName = `temp_${crypto.randomUUID()}`;
      const item = { id: tempName, tempName, name: file.name, file, type: file.type, size: file.size, isVideo: file.type.startsWith("video/"), base64Url };
      setTempFiles((previous) => [...previous, item]);
      if (item.isVideo) insertText(`<video controls><source src="${tempName}" type="${file.type}"></video>`);
      else insertText("![", `](${tempName})`, file.name.replace(/[\[\]<>]/g, ""));
    }
  };
  const convertTempImagesToPreview = (value) => tempFiles.reduce((result, file) => result.split(file.tempName).join(file.base64Url), value);
  const uploadImage = async (selectedImage = "") => {
    let result = content, image = selectedImage;
    prepared.current = new Set();
    const files = [];
    for (const file of tempFiles.filter((item) => content.includes(item.tempName))) {
      let saved = uploaded.current.get(file.tempName);
      if (!saved) { saved = await postImage(file.file); uploaded.current.set(file.tempName, saved); }
      prepared.current.add(file.tempName);
      result = result.split(file.tempName).join(saved.url);
      if (image === file.tempName || image === file.base64Url) image = saved.url;
      files.push({ name: file.name, url: saved.url, path: saved.key, size: file.size, type: file.type, isVideo: file.isVideo });
    }
    if (image.startsWith("temp_") || image.startsWith("data:")) image = "";
    return { content: result, files, image };
  };
  return { tempFiles, resetMedia, handleFileUpload, convertTempImagesToPreview, uploadImage, markSaved: () => { for (const key of prepared.current) uploaded.current.delete(key); void discard(); } };
}
