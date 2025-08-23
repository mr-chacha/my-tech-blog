import React, {useRef, useEffect, useState} from "react";
import styled from "styled-components";
import {EditorView, basicSetup} from "codemirror";
import {EditorState} from "@codemirror/state";
import {markdown} from "@codemirror/lang-markdown";
import {marked} from "marked";
import {db, storage} from "../server/firebase";
import {collection, addDoc, serverTimestamp} from "firebase/firestore";
import {ref, uploadBytes, getDownloadURL} from "firebase/storage";

export const FormPage = () => {
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [category, setCategory] = useState("");
  const [tempFiles, setTempFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const tagInputRef = useRef(null);
  const editorRef = useRef(null);
  const isProcessingRef = useRef(false);
  const editorViewRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // 파일을 base64로 변환하는 함수
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 이미지 추가 함수 (base64로 변환)
  const handleFileUpload = async (files) => {
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsLoading(true);

      for (const file of imageFiles) {
        // 파일을 base64로 변환
        const base64Url = await fileToBase64(file);

        // 임시 ID 생성 (파일명 기반)
        const timestamp = Date.now();
        const tempId = `temp_${timestamp}_${file.name.replace(/\s+/g, "_")}`;

        // 임시 파일 정보 저장
        const tempFileInfo = {
          id: tempId,
          name: file.name,
          tempName: tempId, // 에디터에서 사용할 임시 이름
          file: file, // 원본 파일 객체 (나중에 업로드용)
          base64Url: base64Url,
          size: file.size,
          type: file.type,
          addedAt: new Date(),
        };

        setTempFiles((prev) => [...prev, tempFileInfo]);

        // 마크다운 에디터에 파일명으로 삽입 (base64 URL 대신)
        insertText("![", `](${tempId})`, file.name.split(".")[0]);
      }

      console.log("이미지를 임시로 추가했습니다. 포스트 저장 시 Firebase에 업로드됩니다.");
    } catch (error) {
      console.error("이미지 처리 실패:", error);
      alert("이미지 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 임시 파일명을 실제 URL로 변환하는 함수 (미리보기용)
  const convertTempImagesToPreview = (markdownContent) => {
    let convertedContent = markdownContent;

    tempFiles.forEach((tempFile) => {
      // 임시 파일명을 base64 URL로 교체 (미리보기용)
      const tempImageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${tempFile.tempName}\\)`, "g");
      convertedContent = convertedContent.replace(tempImageRegex, `![$1](${tempFile.base64Url})`);
    });

    return convertedContent;
  };

  // base64를 Firebase Storage에 업로드하고 URL 교체하는 함수
  const uploadBase64ImagesToStorage = async () => {
    if (tempFiles.length === 0) return {content: editorContent, files: []};

    let updatedContent = editorContent;
    const uploadedFileInfos = [];

    for (const tempFile of tempFiles) {
      try {
        // 안전한 파일명 생성
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = tempFile.name.split(".").pop();
        const fileName = `images/${timestamp}_${randomId}.${fileExtension}`;

        const storageRef = ref(storage, fileName);

        // 원본 파일을 Firebase Storage에 업로드
        const snapshot = await uploadBytes(storageRef, tempFile.file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 에디터 내용에서 임시 파일명을 Storage URL로 교체
        const tempImageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${tempFile.tempName}\\)`, "g");
        updatedContent = updatedContent.replace(tempImageRegex, `![$1](${downloadURL})`);

        // 업로드된 파일 정보 저장
        const fileInfo = {
          name: tempFile.name,
          url: downloadURL,
          path: fileName,
          size: tempFile.size,
          type: tempFile.type,
          uploadedAt: new Date(),
        };

        uploadedFileInfos.push(fileInfo);

        console.log(`✅ ${tempFile.name} 업로드 완료: ${downloadURL}`);
      } catch (error) {
        console.error(`❌ ${tempFile.name} 업로드 실패:`, error);
        throw error;
      }
    }

    // 업데이트된 내용과 파일 정보를 모두 반환
    return {content: updatedContent, files: uploadedFileInfos};
  };

  // 포스트 저장 함수 (이미지 업로드 포함)
  const handleSavePost = async () => {
    // 필수 필드 검증
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }

    if (!editorContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    if (!category.trim()) {
      alert("카테고리를 선택해주세요.");
      return;
    }

    try {
      setIsLoading(true);

      // base64 이미지들을 Firebase Storage에 업로드하고 URL 교체
      const {content: finalContent, files: uploadedFileInfos} = await uploadBase64ImagesToStorage();

      // 대표 이미지 설정 (첫 번째 업로드된 이미지)
      const representativeImage = uploadedFileInfos.length > 0 ? uploadedFileInfos[0].url : null;

      const postData = {
        title: title.trim(),
        content: finalContent,
        category: category.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        image: representativeImage,
        isRecommended: false,
        file: uploadedFileInfos,
        tags: activeTab,
        published: true,
        author: "차차",
      };

      // Firestore에 문서 추가
      const docRef = await addDoc(collection(db, "posts"), postData);

      console.log("포스트 저장 성공!");

      // 폼 초기화
      resetForm();
    } catch (error) {
      console.error("포스트 저장 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setActiveTab([]);
    setTempFiles([]); // 임시 파일들 초기화
    setUploadedFiles([]);
    setEditorContent("");
    if (editorViewRef.current) {
      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: "",
        },
      });
    }
  };

  // 임시 파일 삭제 함수
  const removeTempFile = (indexToRemove) => {
    const fileToRemove = tempFiles[indexToRemove];

    // 에디터에서 해당 이미지 임시명 제거
    if (editorViewRef.current && fileToRemove) {
      const currentContent = editorViewRef.current.state.doc.toString();
      const tempImageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${fileToRemove.tempName}\\)`, "g");
      const updatedContent = currentContent.replace(tempImageRegex, "");

      editorViewRef.current.dispatch({
        changes: {
          from: 0,
          to: editorViewRef.current.state.doc.length,
          insert: updatedContent,
        },
      });
    }

    setTempFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 파일 입력 핸들러
  const handleFileInputChange = async (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files);
    }
    event.target.value = "";
  };

  // 드래그 앤 드롭 이벤트 핸들러들
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dropAreaRef.current?.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFileUpload(files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // marked 설정
  marked.setOptions({
    breaks: true,
  });

  // 마크다운을 HTML로 변환 (임시 이미지 처리 포함)
  const convertMarkdownToHtml = (markdownText) => {
    try {
      // 임시 이미지들을 실제 base64 URL로 변환한 후 HTML로 변환
      const convertedContent = convertTempImagesToPreview(markdownText);
      return marked(convertedContent);
    } catch (error) {
      return markdownText;
    }
  };

  // velog 스타일 마크다운 삽입 함수들
  const insertText = (before, after = "", placeholder = "") => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;

    const selectedText = state.doc.sliceString(selection.from, selection.to) || placeholder;
    const newText = `${before}${selectedText}${after}`;

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: newText,
      },
      selection: {
        anchor: selection.from + before.length,
        head: selection.from + before.length + selectedText.length,
      },
    });

    view.focus();
  };

  const insertHeading = (level) => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.from);

    const isEmptyLine = line.text.trim() === "";
    const prefix = (isEmptyLine ? "" : "\n") + "#".repeat(level) + " ";

    insertText(prefix, "", "");
  };

  const insertBold = () => insertText("**", "**", "");
  const insertItalic = () => insertText("*", "*", "");
  const insertStrike = () => insertText("~~", "~~", "");
  const insertCode = () => insertText("`", "`", "");
  const insertCodeBlock = () => insertText("```\n", "\n```", "");
  const insertLink = () => insertText("[", "](https://)", "");
  const insertQuote = () => insertText("> ", "", "");
  const insertList = () => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.from);

    const lineStart = line.from;
    const prefix = "- ";

    view.dispatch({
      changes: {
        from: lineStart,
        to: lineStart,
        insert: prefix,
      },
      selection: {
        anchor: lineStart + prefix.length,
        head: lineStart + prefix.length,
      },
    });

    view.focus();
  };

  // 태그 관련 함수들
  const addTag = (value) => {
    const trimmedValue = value.trim();
    if (trimmedValue === "" || activeTab.includes(trimmedValue)) {
      return;
    }
    setActiveTab((prev) => [...prev, trimmedValue]);
    if (tagInputRef.current) {
      tagInputRef.current.value = "";
    }
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      isProcessingRef.current = true;
      addTag(e.target.value);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 0);
    }
    if (e.key === "Backspace" && e.target.value === "" && activeTab.length > 0) {
      e.preventDefault();
      setActiveTab((prev) => prev.slice(0, -1));
    }
  };

  const handleTagBlur = (e) => {
    if (!isProcessingRef.current) {
      addTag(e.target.value);
    }
  };

  const removeTag = (indexToRemove) => {
    setActiveTab((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // 에디터 초기화
  useEffect(() => {
    if (editorRef.current) {
      const state = EditorState.create({
        doc: editorContent,
        extensions: [
          basicSetup,
          markdown(),
          EditorView.lineWrapping,
          EditorView.theme({
            "&": {
              fontSize: "16px",
            },
            ".cm-content": {
              padding: "20px",
              minHeight: "400px",
              fontFamily: "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif",
              lineHeight: "1.7",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            },
            ".cm-editor": {
              border: "none",
            },
            ".cm-gutters": {
              display: "none !important",
              width: "0 !important",
              minWidth: "0 !important",
            },
            ".cm-gutter": {
              display: "none !important",
              width: "0 !important",
            },
            ".cm-lineNumbers": {
              display: "none !important",
            },
            ".cm-gutterElement": {
              display: "none !important",
            },
            ".cm-scroller": {
              fontFamily: "inherit",
              paddingLeft: "0 !important",
              marginLeft: "0 !important",
            },
            ".cm-editor .cm-scroller": {
              paddingLeft: "0 !important",
            },
          }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setEditorContent(update.state.doc.toString());
            }
          }),
        ],
      });

      const view = new EditorView({
        state,
        parent: editorRef.current,
      });
      editorViewRef.current = view;

      return () => {
        view.destroy();
      };
    }
  }, []);

  return (
    <FormLayout>
      <FormContainer
        ref={dropAreaRef}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <DragOverlay>
            <DragOverContent>
              <DragIcon>📁</DragIcon>
              <DragText>이미지를 여기에 드롭하세요</DragText>
            </DragOverContent>
          </DragOverlay>
        )}

        <LeftSection>
          <LeftBox>
            <LeftBoxTop>
              <input
                className="title-input"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{color: "var(--Text-Colors)"}}
              />
              <div className="input-hr"></div>

              {/* 카테고리 선택 */}
              <CategoryBox>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
                  <option value="">카테고리를 선택하세요</option>
                  <option value="React">React</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Node.js">Node.js</option>
                  <option value="CSS">CSS</option>
                  <option value="Python">Python</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="기타">기타</option>
                </select>
              </CategoryBox>

              {/* 태그 입력 */}
              <ActviveTagBox>
                {activeTab.length > 0 &&
                  activeTab.map((item, index) => (
                    <ActviveTag key={`${item}-${index}`} onClick={() => removeTag(index)}>
                      {item}
                    </ActviveTag>
                  ))}

                <input
                  ref={tagInputRef}
                  placeholder="태그를 입력하세요"
                  onKeyDown={handleTagInput}
                  onBlur={handleTagBlur}
                />
              </ActviveTagBox>
            </LeftBoxTop>

            <LeftBoxBottom>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInputChange}
                style={{display: "none"}}
              />

              <VelogToolbar>
                <ToolGroup>
                  <VelogToolButton onClick={() => insertHeading(1)}>H1</VelogToolButton>
                  <VelogToolButton onClick={() => insertHeading(2)} title="제목 2">
                    H2
                  </VelogToolButton>
                  <VelogToolButton onClick={() => insertHeading(3)} title="제목 3">
                    H3
                  </VelogToolButton>
                  <VelogToolButton onClick={() => insertHeading(4)} title="제목 4">
                    H4
                  </VelogToolButton>
                </ToolGroup>
                <ToolDivider />
                <ToolGroup>
                  <VelogToolButton onClick={insertBold} title="굵게">
                    <strong>B</strong>
                  </VelogToolButton>
                  <VelogToolButton onClick={insertItalic} title="기울임">
                    <em>I</em>
                  </VelogToolButton>
                  <VelogToolButton onClick={insertStrike} title="취소선">
                    <del>S</del>
                  </VelogToolButton>
                </ToolGroup>
                <ToolDivider />
                <ToolGroup>
                  <VelogToolButton onClick={insertCode} title="인라인 코드">
                    &lt;/&gt;
                  </VelogToolButton>
                  <VelogToolButton onClick={insertCodeBlock} title="코드 블록">
                    {}
                  </VelogToolButton>
                  <VelogToolButton onClick={insertLink} title="링크">
                    🔗
                  </VelogToolButton>
                  <VelogToolButton onClick={insertQuote} title="인용">
                    " "
                  </VelogToolButton>
                  <VelogToolButton onClick={insertList} title="리스트">
                    • • •
                  </VelogToolButton>
                </ToolGroup>
                <ToolDivider />
                <ToolGroup>
                  <VelogToolButton onClick={openFileDialog} title="이미지 업로드">
                    📁
                  </VelogToolButton>
                </ToolGroup>

                <SaveButtonGroup>
                  <SaveButton onClick={handleSavePost} disabled={isLoading}>
                    {isLoading ? (tempFiles.length > 0 ? "이미지 업로드 중..." : "저장 중...") : "포스트 저장"}
                  </SaveButton>
                  <ResetButton onClick={resetForm} disabled={isLoading}>
                    초기화
                  </ResetButton>
                </SaveButtonGroup>
              </VelogToolbar>

              <VelogEditorContainer ref={editorRef} />
            </LeftBoxBottom>
          </LeftBox>
        </LeftSection>

        <RightSection>
          <PreviewContainer>
            <div className="title-input">{title}</div>
            {category && <CategoryPreview>카테고리: {category}</CategoryPreview>}
            <PreviewContent
              dangerouslySetInnerHTML={{
                __html: convertMarkdownToHtml(editorContent),
              }}
            />
          </PreviewContainer>
        </RightSection>
      </FormContainer>
    </FormLayout>
  );
};

const HelperText = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: #f0f9ff;
  border-left: 3px solid #3b82f6;
  border-radius: 0.25rem;
`;

const TempIndicator = styled.span`
  background-color: #fbbf24;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 500;
`;

const DragOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(59, 130, 246, 0.1);
  border: 3px dashed #3b82f6;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(2px);
`;

const DragOverContent = styled.div`
  text-align: center;
  color: #3b82f6;
`;

const DragIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const DragText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

const CategoryBox = styled.div`
  margin-bottom: 1rem;

  .category-select {
    font: var(--Title-R);
    font-size: 1.125rem;
    padding: 0.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 0.25rem;
    color: var(--Text-Colors);
    background-color: var(--Back-Color);
    color: var(--Text-Color);
    min-width: 200px;

    &:focus {
      outline: none;
      border-color: #3b82f6;
    }
  }
`;

const SaveButtonGroup = styled.div`
  margin-left: auto;
  display: flex;
  gap: 0.5rem;
`;

const SaveButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #6b7280;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #4b5563;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const CategoryPreview = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 1rem;
  padding: 0.25rem 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  display: inline-block;
`;

const FileList = styled.div`
  margin-top: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: #495057;
    font-weight: 600;
  }
`;

const FileItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border-radius: 0.25rem;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
`;

const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FileIcon = styled.span`
  font-size: 1rem;
`;

const FileName = styled.span`
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
`;

const FileSize = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #fee2e2;
  }
`;

const ActviveTag = styled.div`
  background-color: #f8f9fa;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 2rem;
  font-size: 1rem;
  font: var(--Headline-R);
  padding: 0rem 1rem;
  margin: 0 0.75rem 0.75rem 0;
  color: #3b82f6;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #e5e7eb;
  }
`;

const ActviveTagBox = styled.div`
  display: flex;
  flex-wrap: wrap;

  input {
    font: var(--Title-R);
    font-size: 1.25rem;
    line-height: 2rem;
    margin-bottom: 0.75rem;
    min-width: 9rem;
    border: none;
    color: var(--Text-Colors);
    outline: none;

    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const RightSection = styled.div`
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 3rem;
  word-break: break-word;
  overflow-y: auto;
  background-color: #fbfdfc;
  max-width: 50%;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const LeftBoxBottom = styled.div`
  flex: 1;
  min-height: 450px;
  display: flex;
  flex-direction: column;
`;

const LeftBoxTop = styled.div`
  min-height: 0px;
  padding-bottom: 2rem;
  display: flex;
  flex-direction: column;

  .input-hr {
    background-color: rgb(73, 80, 87);
    height: 6px;
    width: 4rem;
    margin: 1.5rem 0 1rem;
    border-radius: 1px;
  }
`;

const LeftBox = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const LeftSection = styled.div`
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  box-shadow: rgba(0, 0, 0, 0.016) 0px 0px 8px;
  padding: 2rem 3rem 0 3rem;
  max-width: 50%;

  @media (max-width: 1024px) {
    max-width: 100%;
  }
`;

const FormContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100vh;
  position: relative;

  .title-input {
    height: 66px;
    font: var(--Large-Title);
    font-size: 2.75rem;
    line-height: 1.5;
    border: none;
    outline: none;
    width: 100%;

    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const FormLayout = styled.div`
  width: 100%;
  height: 100%;
  margin: 0 auto;
`;

const VelogToolbar = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: none;
  border-radius: 0.375rem 0.375rem 0 0;
  gap: 0.5rem;
  background-color: #fafafa;
  flex-wrap: wrap;

  @media (prefers-color-scheme: dark) {
    border-color: transparent !important;
    background-color: transparent !important;
  }
`;

const ToolGroup = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const VelogToolButton = styled.button`
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #495057;
  transition: all 0.2s;

  &:hover {
    background-color: #e9ecef;
    color: #212529;
  }

  @media (prefers-color-scheme: dark) {
    color: #adb5bd;

    &:hover {
      background-color: #404040;
      color: #e0e0e0;
    }
  }
`;

const ToolDivider = styled.div`
  width: 1px;
  height: 1.5rem;
  background-color: #e5e7eb;
  margin: 0 0.5rem;

  @media (prefers-color-scheme: dark) {
    background-color: #495057;
  }
`;

const VelogEditorContainer = styled.div`
  flex: 1;
  border: none !important;
  overflow: hidden;

  .ͼ1 .cm-gutter {
    display: none !important;
  }
  .ͼ2 .cm-activeLine {
    background-color: transparent !important;
  }

  .cm-editor {
    height: 100%;
    border: none;
  }

  .cm-focused {
    outline: none;
  }

  @media (prefers-color-scheme: dark) {
    border-color: transparent !important;
    background-color: transparent !important;
  }
`;

const PreviewContainer = styled.div`
  height: 100%;
`;

const PreviewContent = styled.div`
  height: calc(100% - 8rem);
  overflow-y: auto;
  line-height: 1.6;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 1.5rem 0 1rem 0;
    font-weight: bold;
  }

  h1 {
    font-size: 2.5rem;
  }
  h2 {
    font-size: 2rem;
  }
  h3 {
    font-size: 1.5rem;
  }
  h4 {
    font-size: 1.125rem;
  }

  p {
    margin: 1rem 0;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #6b7280;
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  code {
    background-color: #f1f5f9;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: "Fira Code", monospace;
    font-size: 0.875rem;
  }

  pre {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 1rem 0;
    border: 1px solid #e5e7eb;

    code {
      background: none;
      padding: 0;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
    margin: 1rem 0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  strong {
    font-weight: bold;
  }

  em {
    font-style: italic;
  }

  del {
    text-decoration: line-through;
  }

  a {
    color: #3b82f6;
    text-decoration: underline;

    &:hover {
      color: #2563eb;
    }
  }
`;
