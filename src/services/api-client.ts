import Constants from "expo-constants";

const FALLBACK_API_URL = "https://healthbridge-backend-wroj.onrender.com/api/v1";
const API_URL =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  FALLBACK_API_URL;

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const hasBody = options.body !== undefined;
    const isFormData = hasBody && typeof FormData !== "undefined" && options.body instanceof FormData;
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(payload.message ?? "Request failed", response.status);
    return payload.data as T;
  }
};
