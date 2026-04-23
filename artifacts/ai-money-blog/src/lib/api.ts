// src/lib/api.ts

export function getApiBaseUrl(): string {
  // 🔥 FORCE PRODUCTION BACKEND
  if (window.location.hostname !== "localhost") {
    return "https://aimoneyinfo.onrender.com/api";
  }

  // ✅ Local development
  return "http://localhost:8080/api";
}