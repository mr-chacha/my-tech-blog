import { auth } from "@/lib/firebase-client";

async function request(method, url, data) {
  const token = await auth.currentUser?.getIdToken();
  const response = await fetch(`/api${url}`, {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || `요청에 실패했습니다. (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return result;
}

export const apiClient = {
  get: (url) => request("GET", url),
  post: (url, data) => request("POST", url, data),
  put: (url, data) => request("PUT", url, data),
  delete: (url, data) => request("DELETE", url, data),
};
