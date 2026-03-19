import type { PublicUser } from "./user";

export type AuthPayload = {
  user: PublicUser;
  token: string;
};

