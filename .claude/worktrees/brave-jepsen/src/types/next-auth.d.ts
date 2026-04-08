import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      accountType: "BUSINESS" | "PARTICULIER";
    } & DefaultSession["user"];
  }

  interface User {
    accountType: "BUSINESS" | "PARTICULIER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accountType: "BUSINESS" | "PARTICULIER";
  }
}
