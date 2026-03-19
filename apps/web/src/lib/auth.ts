import type { PublicUser } from "@/types/user";
import { clearAuthTokenCookie, setAuthTokenCookie } from "./authCookie";

const TOKEN_KEY = "aldens_autocare_token";
const USER_KEY = "aldens_autocare_user";

export function setAuthSession(token: string, user: PublicUser) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAuthTokenCookie(token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearAuthTokenCookie();
}

