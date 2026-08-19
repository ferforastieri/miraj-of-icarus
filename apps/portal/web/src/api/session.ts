import "server-only";

export const ACCESS_COOKIE = "miraj_of_icarus_access";
export const REFRESH_COOKIE = "miraj_of_icarus_refresh";

export type Account = {
  accountId: number;
  userName: string;
  role: "Player" | "Administrator";
  status: "Active" | "Suspended";
};
export type Session = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  account: Account;
};

export const apiUrl = process.env.MIRAJ_OF_ICARUS_API_INTERNAL_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://api.mirajoficarus.com"
    : "http://127.0.0.1:8080");
