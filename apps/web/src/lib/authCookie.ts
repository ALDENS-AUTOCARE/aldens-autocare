const COOKIE_NAME = "aldens_autocare_token";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function getSecureAttr() {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

export function setAuthTokenCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${getSecureAttr()}`;
}

export function clearAuthTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${getSecureAttr()}`;
}
