export const ACCESS_COOKIE = "masicarus_access";
export const REFRESH_COOKIE = "masicarus_refresh";

export type Account = { accountId: number; userName: string };
export type Session = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  account: Account;
};

export const apiUrl = process.env.MASICARUS_API_INTERNAL_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://api.masicarus.com.br"
    : "http://127.0.0.1:8080");
