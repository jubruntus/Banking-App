import session from "express-session";

declare module "express-session" {
  interface SessionData {
    accountId: string;
    username: string;
  }
}
export {};
