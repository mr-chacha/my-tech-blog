"use client";
import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useRouter, useSearchParams } from "next/navigation";
import { useBlogApis } from "@/common/apis";
import { useZustandStore } from "@/common/store";

export default function PortfolioFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const { userInfo, setIsLoading, setActiveModal, setModalMessage } = useZustandStore();
  const { postImage, createPortfolio, updatePortfolio, fetchPortfolioItem } = useBlogApis();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("web");
  const [url, setUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [image, setImage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
  }, [userInfo, router]);

  useEffect(() => {
    if (!editId || !userInfo) return;

    const loadItem = async () => {
      try {
        setIsLoading(true);
        const item = await fetchPortfolioItem(editId);
        setTitle(item.title || "");
        setDescription(item.description || "");
        setType(item.type || "web");
        setUrl(item.url || "");
        setDownloadUrl(item.downloadUrl || (item.type === "app" ? item.url || "" : ""));
        setGithubUrl(item.githubUrl || "");
        setImage(item.image || "");
      } catch (error) {
        console.error("포트폴리오 불러오기 실패:", error);
        setActiveModal({ oneButtonModal: true });
        setModalMessage({
          topMessage: "불러오기 실패",
          bottomMessage: "해당 항목을 찾을 수 없습니다.",
        });
        router.push("/portfolio");
      } finally {
        setIsLoading(false);
      }
    };

    loadItem();
  }, [editId, userInfo]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setActiveModal({ oneButtonModal: true });
      setModalMessage({
        topMessage: "이미지 파일만 가능",
        bottomMessage: "jpg, png, webp 등의 이미지를 선택해주세요.",
      });
      return;
    }

    try {
      setIsUploading(true);
      const fileName = `portfolio/${Date.now()}-${file.name}`;
      const uploadedUrl = await postImage(fileName, file);
      setImage(uploadedUrl);
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      setActiveModal({ oneButtonModal: true });
      setModalMessage({
        topMessage: "업로드 실패",
        bottomMessage: "이미지 업로드에 실패했습니다.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setActiveModal({ oneButtonModal: true });
      setModalMessage({
        topMessage: "입력 확인",
        bottomMessage: "제목과 간단 설명은 필수입니다.",
      });
      return;
    }

    if (type === "web" && !url.trim()) {
      setActiveModal({ oneButtonModal: true });
      setModalMessage({
        topMessage: "입력 확인",
        bottomMessage: "사이트 URL을 입력해주세요.",
      });
      return;
    }

    if (type === "app" && !downloadUrl.trim()) {
      setActiveModal({ oneButtonModal: true });
      setModalMessage({
        topMessage: "입력 확인",
        bottomMessage: "다운로드 URL을 입력해주세요.",
      });
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      type,
      url: type === "web" ? url.trim() : "",
      downloadUrl: type === "app" ? downloadUrl.trim() : "",
      githubUrl: githubUrl.trim(),
      image,
    };

    try {
      setIsLoading(true);
      if (editId) {
        await updatePortfolio(editId, payload);
      } else {
        await createPortfolio(payload);
      }
      router.push("/portfolio");
    } catch (error) {
      console.error("저장 실패:", error);
      setActiveModal({ oneButtonModal: true });
      setModalMessage({
        topMessage: "저장 실패",
        bottomMessage: "권한 또는 네트워크를 확인해주세요.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!userInfo) return null;

  return (
    <Page>
      <Form onSubmit={handleSubmit}>
        <Header>
          <PageTitle>{editId ? "포트폴리오 수정" : "포트폴리오 등록"}</PageTitle>
          <CancelButton type="button" onClick={() => router.push("/portfolio")}>
            목록으로
          </CancelButton>
        </Header>

        <Field>
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="프로젝트 이름"
            maxLength={80}
          />
        </Field>

        <Field>
          <Label htmlFor="description">간단 설명 *</Label>
          <TextArea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="무엇을 만든 프로젝트인지 짧게 적어주세요"
            rows={4}
            maxLength={500}
          />
        </Field>

        <Field>
          <Label>유형 *</Label>
          <TypeRow>
            <TypeOption $active={type === "web"} type="button" onClick={() => setType("web")}>
              Web
            </TypeOption>
            <TypeOption $active={type === "app"} type="button" onClick={() => setType("app")}>
              App
            </TypeOption>
          </TypeRow>
        </Field>

        {type === "web" ? (
          <Field>
            <Label htmlFor="url">사이트 URL *</Label>
            <Input
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
            />
            <Hint>카드의 ‘사이트 보기’ 버튼과 카드 클릭에 연결됩니다.</Hint>
          </Field>
        ) : (
          <Field>
            <Label htmlFor="downloadUrl">다운로드 URL *</Label>
            <Input
              id="downloadUrl"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              placeholder="https://... (APK, Play Store, App Store 등)"
            />
            <Hint>카드의 ‘앱 다운로드’ 버튼과 카드 클릭에 연결됩니다.</Hint>
          </Field>
        )}

        <Field>
          <Label htmlFor="githubUrl">GitHub URL (선택)</Label>
          <Input
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
          />
        </Field>

        <Field>
          <Label>대표 이미지</Label>
          <ImageRow>
            <UploadButton type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()}>
              {isUploading ? "업로드 중..." : "이미지 업로드"}
            </UploadButton>
            <HiddenInput ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} />
            {image && (
              <ClearImage type="button" onClick={() => setImage("")}>
                이미지 제거
              </ClearImage>
            )}
          </ImageRow>
          {image && (
            <PreviewWrap>
              <Preview src={image} alt="미리보기" />
            </PreviewWrap>
          )}
          <Hint>이미지를 올리지 않으면 기본 이미지가 사용됩니다.</Hint>
        </Field>

        <SubmitRow>
          <SubmitButton type="submit">{editId ? "수정 완료" : "등록하기"}</SubmitButton>
        </SubmitRow>
      </Form>
    </Page>
  );
}

const Page = styled.section`
  width: 100%;
  padding: 2rem 1rem 4rem;
`;

const Form = styled.form`
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const PageTitle = styled.h1`
  font: var(--Large-Title);
  color: var(--Text-Color);
`;

const CancelButton = styled.button`
  height: 36px;
  padding: 0 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--Border-Color);
  background: transparent;
  color: var(--Text-Color);
  font: var(--Body-M);
  cursor: pointer;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font: var(--Body-B);
  color: var(--Text-Color);
`;

const Input = styled.input`
  height: 44px;
  padding: 0 0.9rem;
  border: 1px solid var(--Border-Color);
  border-radius: 8px;
  background: var(--Back-Color);
  color: var(--Text-Color);
  font: var(--Body-R);

  &:focus {
    outline: 2px solid var(--Brand-Colors);
    outline-offset: 1px;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--Border-Color);
  border-radius: 8px;
  background: var(--Back-Color);
  color: var(--Text-Color);
  font: var(--Body-R);
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: 2px solid var(--Brand-Colors);
    outline-offset: 1px;
  }
`;

const TypeRow = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TypeOption = styled.button`
  height: 40px;
  min-width: 88px;
  padding: 0 1rem;
  border-radius: 8px;
  border: 1px solid ${(props) => (props.$active ? "var(--Brand-Colors)" : "var(--Border-Color)")};
  background: ${(props) => (props.$active ? "var(--Brand-Colors)" : "transparent")};
  color: ${(props) => (props.$active ? "#fff" : "var(--Text-Color)")};
  font: var(--Body-B);
  cursor: pointer;
`;

const Hint = styled.p`
  font: var(--Caption-R);
  color: var(--Brand-Colors-Two);
`;

const ImageRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const UploadButton = styled.button`
  height: 40px;
  padding: 0 1rem;
  border: none;
  border-radius: 8px;
  background: var(--Brand-Colors);
  color: #fff;
  font: var(--Body-B);
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ClearImage = styled.button`
  height: 40px;
  padding: 0 0.9rem;
  border-radius: 8px;
  border: 1px solid var(--Border-Color);
  background: transparent;
  color: var(--Text-Color);
  font: var(--Body-M);
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewWrap = styled.div`
  width: 100%;
  max-width: 360px;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--Border-Color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--Code-Back-Color);
`;

const Preview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const SubmitRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
`;

const SubmitButton = styled.button`
  height: 44px;
  min-width: 140px;
  padding: 0 1.25rem;
  border: none;
  border-radius: 8px;
  background: var(--Brand-Colors);
  color: #fff;
  font: var(--Body-B);
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;
