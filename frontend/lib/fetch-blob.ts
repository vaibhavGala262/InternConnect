// lib/fetch-blob.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const fetchWithAuthBlob = async (endpoint: string) => {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Image fetch failed:", errorText);
    throw new Error("Failed to fetch image");
  }

  return await response.blob(); // returns the image as blob
};

export default fetchWithAuthBlob;
