import {marked} from "marked";
import styled from "styled-components";
import {useBlogApis} from "@/common/apis";
import {useLocation, useNavigate} from "react-router-dom";
import {EditorState} from "@codemirror/state";
import {EditorView, basicSetup} from "codemirror";
import {serverTimestamp} from "firebase/firestore";
import {markdown} from "@codemirror/lang-markdown";
import React, {useRef, useEffect, useState} from "react";
import {useZustandStore} from "@/common/store";

export const FormPage = () => {
  const CATEGORY_LIST = [
    {id: 0, value: "React"},
    {id: 1, value: "TypeScript"},
    {id: 3, value: "JavaScript"},
    {id: 4, value: "Next"},
    {id: 4, value: "CSS"},
    {id: 99, value: "직접입력"},
  ];

  const nav = useNavigate();
  const location = useLocation();
  const {userInfo, setActiveModal, setModalMessage, setModalConfirmHandler, isLoading, setIsLoading} =
    useZustandStore();
  const {postImage, postPost, fetchDetailPost, updatePost} = useBlogApis();
  const [title, setTitle] = useState("");
  const [activeTab, setActiveTab] = useState([]);
  const [editorContent, setEditorContent] = useState("");
  const [category, setCategory] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [tempFiles, setTempFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [bestImage, setBestImage] = useState("");
  const [existingImages, setExistingImages] = useState([]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editPostId, setEditPostId] = useState(null);
  const [isPrivate, setIsPrivate] = useState(false);

  // 표 관련 상태 추가
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableData, setTableData] = useState([
    ["제목 1", "제목 2", "제목 3"],
    ["내용 1", "내용 2", "내용 3"],
    ["내용 4", "내용 5", "내용 6"],
  ]);

  const tagInputRef = useRef(null);
  const editorRef = useRef(null);
  const isProcessingRef = useRef(false);
  const editorViewRef = useRef(null);
  const fileInputRef = useRef(null);
  const dropAreaRef = useRef(null);

  // 폼 초기화 함수
  const resetForm = () => {
    setTitle("");
    setCategory("");
    setActiveTab([]);
    setTempFiles([]);
    setEditorContent("");
    setBestImage("");
    setExistingImages([]);
    setIsPrivate(false);
    setTableData([
      ["제목 1", "제목 2", "제목 3"],
      ["내용 1", "내용 2", "내용 3"],
      ["내용 4", "내용 5", "내용 6"],
    ]);
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
      tableHtml += `      <th>${cell}</th>\n`;
    });
    tableHtml += "    </tr>\n  </thead>\n";

    // 바디 행들
    tableHtml += "  <tbody>\n";
    tableData.slice(1).forEach((row) => {
      tableHtml += "    <tr>\n";
      row.forEach((cell) => {
        tableHtml += `      <td>${cell}</td>\n`;
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

  // 표 편집 모달
  // 기존 코드에서 이 부분만 교체
  const TableEditorModal = () => {
    if (!showTableModal) return null;

    const addRow = () => {
      const newRow = Array(tableData[0].length).fill("");
      setTableData([...tableData, newRow]);
    };

    const addColumn = () => {
      setTableData(tableData.map((row) => [...row, ""]));
    };

    const deleteRow = (index) => {
      if (tableData.length > 1) {
        setTableData(tableData.filter((_, i) => i !== index));
      }
    };

    const deleteColumn = (index) => {
      if (tableData[0].length > 1) {
        setTableData(tableData.map((row) => row.filter((_, i) => i !== index)));
      }
    };

    const updateCell = (rowIndex, colIndex, value) => {
      const newData = [...tableData];
      newData[rowIndex][colIndex] = value;
      setTableData(newData);
    };

    return (
      <ModalOverlay onClick={() => setShowTableModal(false)}>
        <ModalContent onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <h3>표 편집</h3>
            <CloseButton onClick={() => setShowTableModal(false)}>×</CloseButton>
          </ModalHeader>

          <ModalBody>
            <div style={{marginBottom: "20px"}}>
              <button
                onClick={addRow}
                style={{
                  marginRight: "10px",
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                + 행 추가
              </button>
              <button
                onClick={addColumn}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                + 열 추가
              </button>
            </div>

            <table style={{borderCollapse: "collapse", width: "100%"}}>
              <thead>
                <tr>
                  {tableData[0].map((_, colIndex) => (
                    <th
                      key={colIndex}
                      style={{
                        border: "1px solid #e2e8f0",
                        padding: "0",
                        position: "relative",
                        backgroundColor: "#f8fafc",
                      }}
                    >
                      <input
                        value={tableData[0][colIndex]}
                        onChange={(e) => updateCell(0, colIndex, e.target.value)}
                        placeholder="헤더"
                        style={{
                          border: "none",
                          outline: "none",
                          width: "100%",
                          padding: "12px",
                          background: "transparent",
                        }}
                      />
                      <button
                        onClick={() => deleteColumn(colIndex)}
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} style={{border: "1px solid #e2e8f0", padding: "0"}}>
                        <input
                          value={cell}
                          onChange={(e) => updateCell(rowIndex + 1, colIndex, e.target.value)}
                          placeholder="내용"
                          style={{
                            border: "none",
                            outline: "none",
                            width: "100%",
                            padding: "12px",
                            background: "transparent",
                          }}
                        />
                      </td>
                    ))}
                    <td style={{border: "1px solid #e2e8f0", padding: "0"}}>
                      <button
                        onClick={() => deleteRow(rowIndex + 1)}
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          fontSize: "12px",
                        }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setShowTableModal(false)}>취소</Button>
            <Button
              onClick={() => {
                insertTable();
                setShowTableModal(false);
              }}
            >
              삽입
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    );
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

  // 임시 파일명을 실제 URL로 변환하는 함수
  const convertTempImagesToPreview = (markdownContent) => {
    let convertedContent = markdownContent;

    tempFiles.forEach((tempFile) => {
      if (tempFile.isVideo) {
        // 동영상용 정규식
        const tempVideoRegex = new RegExp(
          `<video controls width="100%">\\s*<source src="${tempFile.tempName}" type="${tempFile.type}">\\s*동영상을 재생할 수 없습니다\\.\\s*</video>`,
          "g"
        );
        convertedContent = convertedContent.replace(
          tempVideoRegex,
          `<video controls width="100%"><source src="${tempFile.base64Url}" type="${tempFile.type}">동영상을 재생할 수 없습니다.</video>`
        );
      } else {
        // 기존 이미지 처리 로직
        const tempImageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${tempFile.tempName}\\)`, "g");
        convertedContent = convertedContent.replace(tempImageRegex, `![$1](${tempFile.base64Url})`);
      }
    });

    return convertedContent;
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

  // 마크다운을 HTML로 변환
  const convertMarkdownToHtml = (markdownText) => {
    try {
      // 이미지들을 base64 URL로 변환한 후 HTML로 변환
      const convertedContent = convertTempImagesToPreview(markdownText);
      return marked(convertedContent);
    } catch (error) {
      return markdownText;
    }
  };

  // 파일을 base64로 변환하는 함수
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 이미지 추가 함수 base64로 변환
  const handleFileUpload = async (files) => {
    const mediaFiles = Array.from(files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );

    if (mediaFiles.length === 0) {
      alert("이미지 또는 동영상 파일만 업로드 가능합니다.");
      return;
    }

    try {
      setIsLoading(true);

      for (const file of mediaFiles) {
        // 파일을 base64로 변환
        const base64Url = await fileToBase64(file);

        const timestamp = Date.now();
        const tempId = `temp_${timestamp}_${file.name.replace(/\s+/g, "_")}`;

        // 임시 파일 정보 저장
        const tempFileInfo = {
          id: tempId,
          name: file.name,
          tempName: tempId,
          file: file,
          base64Url: base64Url,
          size: file.size,
          type: file.type,
          addedAt: new Date(),
          isVideo: file.type.startsWith("video/"),
        };

        setTempFiles((prev) => [...prev, tempFileInfo]);
        // insertText("![", `](${tempId})`, file.name.split(".")[0]);

        // 동영상과 이미지에 따라 다른 마크다운 문법 사용
        if (file.type.startsWith("video/")) {
          // video 태그를 직접 삽입 (insertText의 before 매개변수에 전체 태그를 넣음)
          const videoTag = `<video controls width="100%">
  <source src="${tempId}" type="${file.type}">
  동영상을 재생할 수 없습니다.
</video>`;
          insertText(videoTag, "", "");
        } else {
          insertText("![", `](${tempId})`, file.name.split(".")[0]);
        }
      }
    } catch (error) {
      console.error("이미지 처리 실패:", error);
      alert("이미지 처리에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 이미지 저장 API
  const uploadImage = async () => {
    if (tempFiles.length === 0) return {content: editorContent, files: []};

    let updatedContent = editorContent;
    const uploadedFileInfos = [];

    for (const tempFile of tempFiles) {
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileExtension = tempFile.name.split(".").pop();
        const folderName = tempFile.isVideo ? "videos" : "images";
        const fileName = `${folderName}/${timestamp}_${randomId}.${fileExtension}`;

        const downloadURL = await postImage(fileName, tempFile.file);

        if (tempFile.isVideo) {
          // 동영상용 정규식으로 교체
          const tempVideoRegex = new RegExp(
            `<video controls width="100%">\\s*<source src="${tempFile.tempName}" type="${tempFile.type}">\\s*동영상을 재생할 수 없습니다\\.\\s*</video>`,
            "g"
          );
          updatedContent = updatedContent.replace(
            tempVideoRegex,
            `<video controls width="100%"><source src="${downloadURL}" type="${tempFile.type}">동영상을 재생할 수 없습니다.</video>`
          );
        } else {
          // 기존 이미지 처리 로직
          const tempImageRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${tempFile.tempName}\\)`, "g");
          updatedContent = updatedContent.replace(tempImageRegex, `![$1](${downloadURL})`);
        }

        const fileInfo = {
          name: tempFile.name,
          url: downloadURL,
          path: fileName,
          size: tempFile.size,
          type: tempFile.type,
          isVideo: tempFile.isVideo,
          uploadedAt: new Date(),
        };

        uploadedFileInfos.push(fileInfo);
      } catch (error) {
        console.error(`파일 업로드 실패:`, error);
        throw error;
      }
    }

    return {content: updatedContent, files: uploadedFileInfos};
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
    try {
      setIsLoading(true);

      // base64 이미지들을 Firebase Storage에 업로드하고 URL 교체
      const {content: finalContent, files: uploadedFileInfos} = await uploadImage();

      // 대표 이미지 설정
      let representativeImage = bestImage;

      if (uploadedFileInfos.length > 0) {
        representativeImage = uploadedFileInfos[0].url;
      } else {
        const imageRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/;
        const match = finalContent.match(imageRegex);
        representativeImage = match ? match[1] : null;
      }
      const postData = {
        title: title.trim(),
        content: finalContent,
        category: category === "직접입력" ? categoryInput : category.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bestImage: bestImage || null,
        image: representativeImage || null,
        isRecommended: false,
        file: uploadedFileInfos || [],
        tags: activeTab || [],
        published: !isPrivate,
        isPrivate: isPrivate,
        author: "차차",
        authorId: userInfo?.uid,
      };

      // 수정 모드와 등록 모드 구분
      if (isEditMode && editPostId) {
        await updatePost(editPostId, postData);
        nav(`/post/${editPostId}`);
      } else {
        // 등록 모드: 새로운 포스트 생성
        postData.createdAt = serverTimestamp();
        const response = await postPost(postData);
        nav(`/post/${response.id}`);
      }
      setModalMessage({
        topMessage: `포스트 ${isEditMode ? "수정" : "저장"}에 성공했습니다.`,
      });
      setActiveModal({
        oneButtonModal: true,
        twoButtonModal: false,
      });

      // 폼 초기화
      resetForm();
    } catch (error) {
      console.log(`포스트 ${isEditMode ? "수정" : "저장"}에 실패했습니다.`, error);
      setModalMessage({
        topMessage: "포스트 저장에 실패했습니다.",
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
      setIsLoading(false);
    }
  };

  // marked 설정
  marked.setOptions({
    breaks: true,
  });

  // 수정 포스트 조회
  const loadPostForEdit = async (postId) => {
    try {
      setIsLoading(true);
      const postData = await fetchDetailPost(postId);

      // 폼에 기존 데이터 설정
      setTitle(postData.title || "");
      setCategory(postData.category || "");
      setActiveTab(postData.tags || []);
      setEditorContent(postData.content || "");
      setBestImage(postData.bestImage || "");
      setIsPrivate(postData.isPrivate || false);

      // 기존 이미지들 추출
      const extractedImages = extractImagesFromContent(postData.content || "");
      setExistingImages(extractedImages);

      // 카테고리가 기본 목록에 없으면 직접입력으로 설정
      const categoryExists = CATEGORY_LIST.some((cat) => cat.value === postData.category);
      if (!categoryExists && postData.category) {
        setCategory("직접입력");
        setCategoryInput(postData.category);
      }

      setTimeout(() => {
        if (editorViewRef.current && postData.content) {
          editorViewRef.current.dispatch({
            changes: {
              from: 0,
              to: editorViewRef.current.state.doc.length,
              insert: postData.content,
            },
          });
        }
      }, 100);
    } catch (error) {
      console.error("포스트 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!userInfo) {
        nav("/");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [userInfo]);

  // URL 쿼리 파라미터에서 수정할 포스트 ID 확인
  useEffect(() => {
    setIsLoading(true);
    const searchParams = new URLSearchParams(location.search);
    const postId = searchParams.get("id");

    if (postId) {
      setIsEditMode(true);
      setEditPostId(postId);
      loadPostForEdit(postId);
      setIsLoading(false);
    }
  }, [location.search]);

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

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!userInfo)
        if (!userInfo) {
          nav("/");
        }
    }, 1000);

    return () => clearTimeout(timer);
  }, [userInfo]);

  // 마크다운에서 이미지 URL들을 추출하는 함수
  const extractImagesFromContent = (content) => {
    const files = [];

    // 기존 이미지 추출 로직
    const imageRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;
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
    const videoRegex = /<video[^>]*>[\s\S]*?<source src="(https?:\/\/[^"]+)"[^>]*>[\s\S]*?<\/video>/g;
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
                onClick={() => handleBestImageSelect(imageUrl)}
                $isSelected={bestImage === imageUrl}
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

  return (
    <FormLayout>
      <TableEditorModal />
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
                accept="image/*,video/*"
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
            <ContentWrapper
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
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:first-child {
    background: #6c757d;
    color: white;
  }

  &:last-child {
    background: #007bff;
    color: white;
  }
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

const ContentWrapper = styled.div`
  font-weight: 400;
  line-height: 1rem;
  background-color: var(--Content-Back-Color);
  color: var(--Text-Color) !important;

  p + h1,
  p + h2,
  p + h3,
  p + h4 {
    margin-top: 3rem;
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.4rem;
    margin: 1rem 0 0.5rem 0;
    font-weight: bold;
    color: var(--Text-Color);
  }

  h1 {
    font-size: 3rem;
    line-height: 3rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
  }
  h2 {
    font-size: 2rem;
    line-height: 2.5rem;
    margin-top: 0.93em;
    margin-bottom: 0.93em;
  }
  h3 {
    font-size: 1.5rem;
    line-height: 1.5rem;
    margin-top: 0.83em;
    margin-bottom: 0.83em;
  }
  h4 {
    font-size: 1.125rem;
    line-height: 1.5rem;
    margin-top: 0.73em;
    margin-bottom: 0.73em;
  }

  p {
    font-size: 1rem;
    margin-bottom: 0.75rem;
    color: var(--Text-Color);
    white-space: pre-line;
    line-height: 1.2rem;
  }

  li {
    font-size: 1rem;
    margin-bottom: 0.25rem;
  }

  ul {
    margin-top: 0.75rem;
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
    list-style-type: disc;
  }

  strong {
    font-weight: bold;
    color: var(--Text-Color);
  }

  em {
    font-style: italic;
    color: var(--Text-Color);
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
    margin: 1.5rem auto;
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  code {
    background: #f1f5f9;
    padding: 3px 6px;
    border-radius: 4px;
    font-size: 0.875rem;
    font-family: Monaco, Consolas, monospace;
    background: var(--Code-Back-Color);
    line-height: 1.5;
  }

  pre {
    background: #f8fafc;
    padding: 16px;
    border-radius: 8px;
    overflow: auto;
    margin: 1.5rem 0;
    border: 1px solid #e2e8f0;

    code {
      background: none;
      padding: 0;
      font-family: Monaco, Consolas, monospace;
      font-size: 0.875rem;
      line-height: 1.5;
    }
  }

  a {
    color: #3b82f6;
    text-decoration: underline;

    &:hover {
      color: #2563eb;
    }
  }

  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 1rem;
    margin: 0.75rem 0;
    color: #6b7280;
    background-color: #f8fafc;
    padding: 1rem;
    border-radius: 0.25rem;
  }

  del {
    text-decoration: line-through;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1.5rem 0;
  }

  th,
  td {
    border: 1px solid #e2e8f0;
    padding: 12px;
    text-align: left;
  }

  th {
    background-color: #f8fafc;
    font-weight: bold;
  }
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
