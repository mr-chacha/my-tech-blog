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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const tagInputRef = useRef(null);
  const editorRef = useRef(null);
  const isProcessingRef = useRef(false);
  const editorViewRef = useRef(null);
  const fileInputRef = useRef(null);

  // 이미지 업로드 함수
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      try {
        setIsLoading(true);

        // Firebase Storage에 이미지 업로드
        const timestamp = Date.now();
        const fileName = `images/${timestamp}_${file.name}`;
        const storageRef = ref(storage, fileName);

        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 업로드된 파일 정보 저장
        const fileInfo = {
          name: file.name,
          url: downloadURL,
          path: fileName,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
        };

        setUploadedFiles((prev) => [...prev, fileInfo]);

        // 마크다운 에디터에 이미지 삽입
        insertText("![", `](${downloadURL})`, file.name.split(".")[0]);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
        alert("이미지 업로드에 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("이미지 파일만 업로드 가능합니다.");
    }
    event.target.value = "";
  };

  // 포스트 저장 함수
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
      const representativeImage = uploadedFiles.length > 0 ? uploadedFiles[0].url : null; // 또는 기본 이미지 URL
      const postData = {
        title: title.trim(),
        content: editorContent,
        category: category.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        image: representativeImage,
        isRecommended: false,

        file: uploadedFiles,
        tags: activeTab,
        published: true,
        author: "차차",
      };

      // Firestore에 문서 추가
      const docRef = await addDoc(collection(db, "posts"), postData);
      console.log("docRef", docRef);
      if (docRef.id) {
      }

      // 폼 초기화 (선택사항)
      // resetForm();
    } catch (error) {
      console.error("포스트 저장 실패:", error);
      alert("포스트 저장에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setActiveTab([]);
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

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // marked 설정
  marked.setOptions({
    breaks: true,
  });

  // 마크다운을 HTML로 변환
  const convertMarkdownToHtml = (markdownText) => {
    try {
      return marked(markdownText);
    } catch (error) {
      return markdownText;
    }
  };

  // velog 스타일 마크다운 삽입 함수들
  // 올바른 텍스트 삽입 함수
  const insertText = (before, after = "", placeholder = "") => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;

    // 선택된 텍스트가 있으면 그것을 사용, 없으면 placeholder 사용
    const selectedText = state.doc.sliceString(selection.from, selection.to) || placeholder;
    const newText = `${before}${selectedText}${after}`;

    // 현재 선택 영역에 새 텍스트 삽입
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

    // 에디터에 포커스 다시 주기
    view.focus();
  };

  const insertHeading = (level) => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;
    const line = state.doc.lineAt(selection.from);

    // 현재 줄이 비어있지 않으면 새 줄에 삽입
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

    // 줄의 시작에 삽입
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
  // 기존 태그 관련 함수들
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

  // 태그 삭제
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
              wordBreak: "break-word", // CSS로도 강제 줄바꿈
              whiteSpace: "pre-wrap", // 공백 및 줄바꿈 유지
            },
            ".cm-editor": {
              border: "none",
            },
            // 거터 관련 모든 스타일 제거
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
            // 스크롤러에서 패딩 제거
            ".cm-scroller": {
              fontFamily: "inherit",
              paddingLeft: "0 !important",
              marginLeft: "0 !important",
            },
            // 에디터 전체에서 왼쪽 여백 제거
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
      editorViewRef.current = view; // 에디터 인스턴스 저장

      return () => {
        view.destroy();
      };
    }
  }, []);

  return (
    <FormLayout>
      <FormContainer>
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

              {/* 카테고리 선택 추가 */}
              <CategoryBox>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="category-select">
                  <option value="">카테고리를 선택하세요</option>
                  <option value="React">React</option>
                  <option value="JavaScript">JavaScript</option>
                  <option value="Node.js">Node.js</option>
                  <option value="CSS">CSS</option>
                  <option value="기타">기타</option>
                </select>
              </CategoryBox>

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
                onChange={handleFileUpload}
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
                    {isLoading ? "저장 중..." : "포스트 저장"}
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
            {uploadedFiles.length > 0 && (
              <FileList>
                <h4>업로드된 파일들:</h4>
                {uploadedFiles.map((file, index) => (
                  <FileItem key={index}>
                    📁 {file.name} ({Math.round(file.size / 1024)}KB)
                  </FileItem>
                ))}
              </FileList>
            )}
          </PreviewContainer>
        </RightSection>
      </FormContainer>
    </FormLayout>
  );
};

// 새로운 스타일 컴포넌트들 추가
const CategoryBox = styled.div`
  margin-bottom: 1rem;

  .category-select {
    font: var(--Title-R);
    font-size: 1.125rem;
    padding: 0.5rem;
    border: 1px solid #e1e5e9;
    border-radius: 0.25rem;
    color: var(--Text-Colors);
    background-color: white;
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
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    color: #495057;
  }
`;

const FileItem = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
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

  .title-input {
    height: 66px;
    font: var(--Large-Title);
    font-size: 2.75rem;
    line-height: 1.5;
    border: none;
    outline: none;
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
    font-size: 40px;
  }
  h2 {
    font-size: 32px;
  }
  h3 {
    font-size: 24px;
  }
  h4 {
    font-size: 18px;
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
  }

  code {
    background-color: #f1f5f9;
    padding: 0.125rem 0.25rem;
    border-radius: 0.25rem;
    font-family: monospace;
  }

  pre {
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.375rem;
    overflow-x: auto;
    margin: 1rem 0;
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
`;
