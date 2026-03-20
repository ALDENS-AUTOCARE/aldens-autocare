import { API_BASE_URL } from "./constants";
import { getToken } from "./auth";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH";
  body?: unknown;
  auth?: boolean;
};

type ApiEnvelope = {
  success?: boolean;
  message?: string;
};

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new Error(`Unable to reach API at ${API_BASE_URL}. Ensure the API server is running.`);
  }

  let json: (T & ApiEnvelope) | null = null;

  try {
    json = (await response.json()) as T & ApiEnvelope;
  } catch {
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    throw new Error("Invalid server response format");
  }

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Request failed with status ${response.status}`);
  }

  return json as T;
}

export const api = {
  get: <T>(path: string, auth = false) => request<T>(path, { method: "GET", auth }),
  post: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "POST", body, auth }),
  patch: <T>(path: string, body?: unknown, auth = false) =>
    request<T>(path, { method: "PATCH", body, auth }),
};

