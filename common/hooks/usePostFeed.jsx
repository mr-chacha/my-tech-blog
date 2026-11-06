"use client";
import { useEffect, useRef, useState } from "react";
import { apiClient } from "@/common/apis/apiClient";
import { isPublicPost } from "@/common/util/post-data.mjs";

export function usePostFeed(initialPage, initialError, userInfo, authReady) {
  const [page, setPage] = useState(initialPage);
  const [recentPosts, setRecentPosts] = useState(initialPage.posts.slice(0, 5));
  const [category, setCategory] = useState("");
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const scope = userInfo?.uid || "public";
  const [pageScope, setPageScope] = useState("public");
  const fetchPage = (cursor) => apiClient.get(`/firebase/posts?${new URLSearchParams({ category, ...(cursor ? { cursor } : {}) })}`);

  useEffect(() => {
    if (!authReady) return;
    const current = ++generation.current;
    inFlight.current = true;
    setLoading(true); setError(false);
    setPage((previous) => ({ posts: [], nextCursor: null, categories: pageScope === scope ? previous.categories : initialPage.categories, total: pageScope === scope ? previous.total : initialPage.total }));
    setPageScope(scope);
    if (!userInfo) setRecentPosts((posts) => posts.filter(isPublicPost));
    fetchPage().then((result) => {
      if (current !== generation.current) return;
      setPage(result);
      if (!category) setRecentPosts(result.posts.slice(0, 5));
    }).catch((error) => { if (current === generation.current) setError(error.message); })
      .finally(() => { if (current === generation.current) { inFlight.current = false; setLoading(false); } });
    return () => { generation.current++; inFlight.current = false; };
  }, [authReady, scope, category, retry]);

  const loadMore = async () => {
    if (!page.nextCursor || inFlight.current || pageScope !== scope) return;
    const current = generation.current;
    inFlight.current = true; setLoading(true); setError(false);
    try {
      const result = await fetchPage(page.nextCursor);
      if (current !== generation.current) return;
      setPage((previous) => ({ ...previous, ...result, posts: [...new Map([...previous.posts, ...result.posts].map((post) => [post.id, post])).values()] }));
    } catch (error) { if (current === generation.current) setError(error.message); }
    finally { if (current === generation.current) { inFlight.current = false; setLoading(false); } }
  };
  const visible = pageScope === scope ? page : { ...initialPage, posts: [], nextCursor: null };
  return { ...visible, posts: userInfo ? visible.posts : visible.posts.filter(isPublicPost), recentPosts: userInfo ? recentPosts : recentPosts.filter(isPublicPost), category, setCategory, error, loading, loadMore, retry: () => setRetry((value) => value + 1) };
}
