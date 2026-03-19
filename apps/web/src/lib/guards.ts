import { getStoredUser } from "./auth";

export function isAuthenticated() {
  return !!getStoredUser();
}

export function isAdmin() {
  const user = getStoredUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

