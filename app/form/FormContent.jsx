"use client";
import { useMarkdownEditor } from "@/common/hooks/useMarkdownEditor";
import { usePostMedia } from "@/common/hooks/usePostMedia";
import TableEditorModal from "@/components/form/TableEditorModal";
import { escapeHtml } from "@/common/util/security.mjs";
import { MarkDownContent } from "@/components/layout";
import styled from "styled-components";
import {useBlogApis} from "@/common/apis";
import {useSearchParams, useRouter} from "next/navigation";
import React, {useRef, useEffect, useState} from "react";
import {useZustandStore} from "@/common/store";

export default function FormContent() {
  const CATEGORY_LIST = [
    {id: 0, value: "React"},
    {id: 1, value: "TypeScript"},
    {id: 3, value: "JavaScript"},
    {id: 4, value: "Next"},
    {id: 5, value: "CSS"},
    {id: 99, value: "직접입력"},
  ];

  const router = useRouter();
  const searchParams = useSearchParams();
  const {userInfo, authReady, setActiveModal, setModalMessage, setModalConfirmHandler, isLoading, setIsLoading} =
    useZustandStore();
  const {postImage, postPost, fetchDetailPost, updatePost} = useBlogApis();
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [bestImage, setBestImage] = useState("");
  const [existingImages, setExistingImages] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // 표 편집 상태
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableData, setTableData] = useState([
    ["제목 1", "제목 2", "제목 3"],
    ["내용 1", "내용 2", "내용 3"],
    ["내용 4", "내용 5", "내용 6"],
  ]);

  const tagInputRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isSavingRef = useRef(false);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  const { content: editorContent, replaceContent: setEditorContent, editorRef, editorViewRef, insertText, insertHeading, insertList } = useMarkdownEditor(authReady && !!userInfo);
  const { tempFiles, resetMedia, convertTempImagesToPreview, uploadImage, markSaved, handleFileUpload: addFiles } = usePostMedia(editorContent, insertText, postImage);
  const handleFileUpload = async (files) => {
    setIsLoading(true);
    try { await addFiles(files); }
    catch (error) { setModalMessage({ topMessage: error.message }); setActiveModal({ oneButtonModal: true }); }
    finally { setIsLoading(false); }
  };

  // 폼 초기화 함수
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setCategoryInput("");
    setActiveTab([]);
    resetMedia();
    setEditorContent("");
    setBestImage("");
    setExistingImages([]);
    setExistingFiles([]);
    setIsPrivate(false);
    setTableData([
      ["제목 1", "제목 2", "제목 3"],
      ["내용 1", "내용 2", "내용 3"],
      ["내용 4", "내용 5", "내용 6"],
    ]);

  };

  // 표 삽입 함수
  const insertTable = () => {
    if (!editorViewRef.current) return;

    const view = editorViewRef.current;
    const state = view.state;
    const selection = state.selection.main;

    // HTML 테이블 생성
    let tableHtml = "<table>\n";

    // 헤더 행
    tableHtml += "  <thead>\n    <tr>\n";
    tableData[0].forEach((cell) => {
      tableHtml += `      <th>${escapeHtml(cell)}</th>\n`;
    });
    tableHtml += "    </tr>\n  </thead>\n";

    // 바디 행들
    tableHtml += "  <tbody>\n";
    tableData.slice(1).forEach((row) => {
      tableHtml += "    <tr>\n";
      row.forEach((cell) => {
        tableHtml += `      <td>${escapeHtml(cell)}</td>\n`;
      });
      tableHtml += "    </tr>\n";
    });
    tableHtml += "  </tbody>\n</table>\n";

    view.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: tableHtml,
      },
      selection: {
        anchor: selection.from + tableHtml.length,
        head: selection.from + tableHtml.length,
      },
    });

    view.focus();
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

  const insertBold = () => insertText("**", "**", "");
  const insertItalic = () => insertText("*", "*", "");
  const insertStrike = () => insertText("~~", "~~", "");
  const insertCode = () => insertText("`", "`", "");
  const insertCodeBlock = () => insertText("```\n", "\n```", "");
  const insertLink = () => insertText("[", "](https://)", "");
  const insertQuote = () => insertText("> ", "", "");
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

  // 포스트 저장 API
  const handleSavePost = async () => {
    // 필수 필드 검증
    if (!title.trim()) {
      setActiveModal({
        oneButtonModal: true,
      });
      setModalMessage({
        topMessage: "제목을 입력해주세요.",
      });
      return;
    }

    if (!editorContent.trim()) {
      setActiveModal({
        oneButtonModal: true,
      });
      setModalMessage({
        topMessage: "내용을 입력해주세요.",
      });
      return;
    }

    if (!category.trim()) {
      setActiveModal({
        oneButtonModal: true,
      });
      setModalMessage({
        topMessage: "카테고리를 선택해주세요.",
      });
      return;
    }
    setActiveModal({
      twoButtonModal: true,
    });
    setModalMessage({
      topMessage: isEditMode ? "포스트를 수정하시겠습니까?" : "포스트를 저장하시겠습니까?",
    });

    setModalConfirmHandler(() => submit());
  };

  const submit = async () => {
    if (!authReady || !userInfo || isLoading || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      setIsLoading(true);

      // 임시 미디어를 S3에 업로드하고 URL 교체
      const {content: finalContent, files: uploadedFileInfos, image: selectedImage} = await uploadImage(bestImage);

      // 대표 이미지 설정
      let representativeImage = selectedImage;

      if (!representativeImage && uploadedFileInfos.length > 0) {
        representativeImage = uploadedFileInfos[0].url;
      } else if (!representativeImage) {
        const imageRegex = /!\[.*?\]\(((?:https?:\/\/|\/api\/media\/)[^\s\)]+)\)/;
        const match = finalContent.match(imageRegex);
        representativeImage = match ? match[1] : null;
      }
      const postData = {
        title: title.trim(),
        content: finalContent,
        category: category === "직접입력" ? categoryInput : category.trim(),
        bestImage: selectedImage || null,
        image: representativeImage || null,
        file: [...existingFiles.filter((file) => finalContent.includes(file.url)), ...uploadedFileInfos],
        tags: activeTab || [],
        published: !isPrivate,
        isPrivate: isPrivate,
      };

      // 수정 모드와 등록 모드 구분
      if (isEditMode && editPostId) {
        await updatePost(editPostId, postData);
        router.push(`/post/${editPostId}`);
      } else {
        // 등록 모드: 새로운 포스트 생성
        const response = await postPost(postData);
        router.push(`/post/${response.id}`);
      }
      setModalMessage({
        topMessage: `포스트 ${isEditMode ? "수정" : "저장"}에 성공했습니다.`,
      });
      setActiveModal({
        oneButtonModal: true,
        twoButtonModal: false,
      });

      markSaved();
      resetForm();
    } catch (error) {
      console.log(`포스트 ${isEditMode ? "수정" : "저장"}에 실패했습니다.`, error);
      setModalMessage({
        topMessage: error.message || "포스트 저장에 실패했습니다.",
      });
      setActiveModal({
        oneButtonModal: true,
        twoButtonModal: false,
      });

      setModalConfirmHandler(() => () => {
        setActiveModal({
          oneButtonModal: false,
        });
      });
    } finally {
      isSavingRef.current = false;
      setIsLoading(false);
    }
  };

  const loadPostForEdit = async (postId, isCurrent) => {
    try {
      setIsLoading(true);
      const postData = await fetchDetailPost(postId);
      if (!isCurrent()) return;

      // 폼에 기존 데이터 설정
      setTitle(postData.title || "");
      setCategory(postData.category || "");
      setActiveTab(postData.tags || []);
      setEditorContent(postData.content || "");
      setBestImage(postData.bestImage || "");
      setIsPrivate(postData.published === false || postData.isPrivate === true);

      // 기존 이미지들 추출
      const extractedImages = extractImagesFromContent(postData.content || "");
      setExistingImages(extractedImages);
      setExistingFiles(postData.file || []);

      // 카테고리가 기본 목록에 없으면 직접입력으로 설정
      const categoryExists = CATEGORY_LIST.some((cat) => cat.value === postData.category);
      if (!categoryExists && postData.category) {
        setCategory("직접입력");
        setCategoryInput(postData.category);
      }

    } catch (error) {
      if (isCurrent()) {
        setModalMessage({ topMessage: "게시물을 불러오지 못했습니다.", bottomMessage: error.message });
        setActiveModal({ oneButtonModal: true });
        router.replace("/");
      }
    } finally {
      if (isCurrent()) setIsLoading(false);
    }
  };



  useEffect(() => {
    if (!authReady) return;
    if (!userInfo) { router.replace("/login"); return; }
    const postId = searchParams.get("id");
    setIsEditMode(Boolean(postId));
    setEditPostId(postId);
    let active = true;
    if (postId) loadPostForEdit(postId, () => active);
    else { resetForm(); setIsLoading(false); }
    return () => { active = false; setIsLoading(false); };
  }, [authReady, userInfo?.uid, searchParams, router]);

  // 마크다운에서 이미지 URL들을 추출하는 함수
  const extractImagesFromContent = (content) => {
    const files = [];

    // 기존 이미지 추출 로직
    const imageRegex = /!\[.*?\]\(((?:https?:\/\/|\/api\/media\/)[^\s\)]+)\)/g;
    let match;
    while ((match = imageRegex.exec(content)) !== null) {
      const fileUrl = match[1];
      const altText = match[0].match(/!\[(.*?)\]/)?.[1] || "이미지";

      if (!files.some((file) => file.url === fileUrl)) {
        files.push({
          id: `existing_${Date.now()}_${Math.random()}`,
          url: fileUrl,
          name: altText,
          type: "existing",
          isVideo: false,
        });
      }
    }

    // 동영상 추출 로직 추가
    const videoRegex = /<video[^>]*>[\s\S]*?<source src="((?:https?:\/\/|\/api\/media\/)[^"]+)"[^>]*>[\s\S]*?<\/video>/g;
    while ((match = videoRegex.exec(content)) !== null) {
      const fileUrl = match[1];
      const fileName = fileUrl.split("/").pop() || "동영상";

      if (!files.some((file) => file.url === fileUrl)) {
        files.push({
          id: `existing_${Date.now()}_${Math.random()}`,
          url: fileUrl,
          name: fileName,
          type: "existing",
          isVideo: true,
        });
      }
    }

    return files;
  };
  // 대표이미지 선택 함수
  const handleBestImageSelect = (imageUrl) => {
    setBestImage(imageUrl);
  };

  // 업로드된 이미지 목록에서 대표이미지 선택 UI
  const renderBestImageSelector = () => {
    const allImages = [...existingImages, ...tempFiles];

    if (allImages.length === 0) return null;

    return (
      <BestImageSelector>
        <BestImageLabel>대표이미지 선택:</BestImageLabel>
        <BestImageGrid>
          {allImages.map((image, index) => {
            const imageUrl = image.type === "existing" ? image.url : image.base64Url;
            const imageName = image.type === "existing" ? image.name : image.name;

            return (
              <BestImageOption
                key={image.id}
                onClick={() => handleBestImageSelect(image.type === "existing" ? image.url : image.tempName)}
                $isSelected={bestImage === (image.type === "existing" ? image.url : image.tempName)}
              >
                <BestImageThumbnail src={imageUrl} alt={imageName} />
                <BestImageName>{imageName}</BestImageName>
                {image.type === "existing" && <ExistingImageBadge>기존</ExistingImageBadge>}
              </BestImageOption>
            );
          })}
        </BestImageGrid>
      </BestImageSelector>
    );
  };

  if (!authReady || !userInfo) return <p role="status">인증 확인 중...</p>;

  return (
    <FormLayout>
      <TableEditorModal open={showTableModal} tableData={tableData} setTableData={setTableData} onClose={() => setShowTableModal(false)} onInsert={insertTable} />
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
                  {CATEGORY_LIST.map((item, index) => (
                    <option key={`category_${index}`} value={item.value}>
                      {item.value}
                    </option>
                  ))}
                </select>
              </CategoryBox>

              {/* 카테고리 직접입력 */}
              {category === "직접입력" && (
                <CategoryInput
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  type="text"
                  placeholder="카테고리를 입력하세요"
                />
              )}

              <PrivacyToggleContainer>
                <PrivacyToggleLabel>
                  <PrivacyToggleInput
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                  <PrivacyToggleSlider $isPrivate={isPrivate} />
                  <PrivacyToggleText $isPrivate={isPrivate}>{isPrivate ? "🔒 나만보기" : "🌍 공개"}</PrivacyToggleText>
                </PrivacyToggleLabel>
                <PrivacyDescription>
                  {isPrivate ? "이 포스트는 나에게만 보입니다" : "이 포스트는 모든 사용자에게 공개됩니다"}
                </PrivacyDescription>
              </PrivacyToggleContainer>
              {/* 대표이미지 선택 UI */}
              {renderBestImageSelector()}

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
                title="이미지/동영상 파일당 최대 3MB"
                accept="image/jpeg,image/png,image/gif,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
                multiple
                onChange={handleFileInputChange}
                style={{display: "none"}}
              />

              <FormToolbar>
                <ToolGroup>
                  <FormToolButton onClick={() => insertHeading(1)}>H1</FormToolButton>
                  <FormToolButton onClick={() => insertHeading(2)} title="제목 2">
                    H2
                  </FormToolButton>
                  <FormToolButton onClick={() => insertHeading(3)} title="제목 3">
                    H3
                  </FormToolButton>
                  <FormToolButton onClick={() => insertHeading(4)} title="제목 4">
                    H4
                  </FormToolButton>
                </ToolGroup>
                <ToolDivider />
                <ToolGroup>
                  <FormToolButton onClick={insertBold} title="굵게">
                    <strong>B</strong>
                  </FormToolButton>
                  <FormToolButton onClick={insertItalic} title="기울임">
                    <em>I</em>
                  </FormToolButton>
                  <FormToolButton onClick={insertStrike} title="취소선">
                    <del>S</del>
                  </FormToolButton>
                </ToolGroup>
                <ToolDivider />
                <ToolGroup>
                  <FormToolButton onClick={insertCode} title="인라인 코드">
                    &lt;/&gt;
                  </FormToolButton>
                  <FormToolButton onClick={insertCodeBlock} title="코드 블록">
                    {`{ }`}
                  </FormToolButton>
                  <FormToolButton onClick={insertLink} title="링크">
                    🔗
                  </FormToolButton>
                  <FormToolButton onClick={insertQuote} title="인용">
                    " "
                  </FormToolButton>
                  <FormToolButton onClick={insertList} title="리스트">
                    • • •
                  </FormToolButton>
                </ToolGroup>
                <ToolDivider />
                <ToolGroup>
                  <FormToolButton onClick={openFileDialog} title="이미지 업로드">
                    📁
                  </FormToolButton>
                  <FormToolButton onClick={() => setShowTableModal(true)} title="표 삽입">
                    📊
                  </FormToolButton>
                </ToolGroup>

                <SaveButtonGroup>
                  <SaveButton onClick={handleSavePost} disabled={isLoading}>
                    {isLoading ? (tempFiles.length > 0 ? "이미지 업로드 중..." : "저장 중...") : "포스트 저장"}
                  </SaveButton>
                  <ResetButton onClick={resetForm} disabled={isLoading}>
                    초기화
                  </ResetButton>
                </SaveButtonGroup>
              </FormToolbar>

              <FormEditorContainer ref={editorRef} />
            </LeftBoxBottom>
          </LeftBox>
        </LeftSection>

        <RightSection>
          <PreviewContainer>
            <MarkDownContent content={convertTempImagesToPreview(editorContent)} isPreview />
          </PreviewContainer>
        </RightSection>
      </FormContainer>
    </FormLayout>
  );
};

const PrivacyToggleContainer = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--Back-Color);
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const PrivacyToggleLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
`;

const PrivacyToggleInput = styled.input`
  display: none;
`;

const PrivacyToggleSlider = styled.div`
  position: relative;
  width: 3rem;
  height: 1.5rem;
  background-color: ${(props) => (props.$isPrivate ? "#3b82f6" : "#d1d5db")};
  border-radius: 0.75rem;
  transition: background-color 0.2s;

  &::after {
    content: "";
    position: absolute;
    top: 0.125rem;
    left: ${(props) => (props.$isPrivate ? "1.375rem" : "0.125rem")};
    width: 1.25rem;
    height: 1.25rem;
    background-color: white;
    border-radius: 50%;
    transition: left 0.2s;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const PrivacyToggleText = styled.span`
  font: var(--Body-M);
  font-weight: 600;
  color: ${(props) => (props.$isPrivate ? "#3b82f6" : "#6b7280")};
`;

const PrivacyDescription = styled.p`
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-style: italic;
`;

const ExistingImageBadge = styled.div`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background-color: #10b981;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-weight: 600;
`;

const BestImageOption = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  border: 2px solid ${(props) => (props.$isSelected ? "#3b82f6" : "#e5e7eb")};
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${(props) => (props.$isSelected ? "#eff6ff" : "transparent")};
  min-width: 120px;
  flex-shrink: 0;

  &:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
`;

const BestImageSelector = styled.div`
  margin-bottom: 1rem;
  padding: 1rem;
  background-color: var(--Back-Color);
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
`;

const BestImageLabel = styled.div`
  font: var(--Title-R);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--Text-Color);
`;

const BestImageGrid = styled.div`
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const BestImageThumbnail = styled.img`
  width: 100%;
  height: 80px;
  object-fit: cover;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
`;

const BestImageName = styled.div`
  font-size: 0.75rem;
  color: var(--Text-Color);
  text-align: center;
  word-break: break-word;
  line-height: 1.2;
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

const CategoryInput = styled.input`
  margin-bottom: 0.75rem;
  font: var(--Title-R);
  font-size: 1.25rem;
  line-height: 2rem;
  min-width: 9rem;
  border: none;
  color: var(--Text-Colors);
  outline: none;

  &::placeholder {
    color: #9ca3af;
  }
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

const SaveButton = styled.div`
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

const ResetButton = styled.div`
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
  background-color: var(--Content-Back-Color);
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

const FormToolbar = styled.div`
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

const FormToolButton = styled.button`
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

const FormEditorContainer = styled.div`
  flex: 1;
  border: none !important;
  overflow: hidden;
  code {
    background-color: var(--Text-Color) !important;
    line-height: 1.5;
  }

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
  background-color: var(--Content-Back-Color);
  color: var(--Text-Color) !important;
  blockquote {
    background-color: var(--Back-Color) !important;
  }
  code {
    color: var(--Dark) !important;
    line-height: 1.5;
  }
`;
