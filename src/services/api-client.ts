import Constants from "expo-constants";

const FALLBACK_API_URL = "https://healthbridge-backend-wroj.onrender.com/api/v1";
const API_URL =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL as string | undefined) ??
  process.env.EXPO_PUBLIC_API_URL ??
  FALLBACK_API_URL;

const friendlyApiMessage = (message: string, status: number) => {
  const lower = message.toLowerCase();
  if (status === 401 || lower.includes("credential")) return "Invalid email or password.";
  if (lower.includes("failed to fetch") || lower.includes("network")) return "Unable to reach the HealthBridge server. Please wait 30 seconds and try again.";
  if (lower === "request failed") return "Please check your internet connection and try again.";
  return message;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const hasBody = options.body !== undefined;
    const isFormData = hasBody && typeof FormData !== "undefined" && options.body instanceof FormData;
    let response: Response;
    try {
      response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
      });
    } catch {
      throw new ApiError(friendlyApiMessage("network", 0), 0);
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new ApiError(friendlyApiMessage(payload.message ?? "Request failed", response.status), response.status);
    return payload.data as T;
  }
};
