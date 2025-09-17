import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // ✅ on ajoute id
    } & DefaultSession["user"];
  }

  interface User {
    id: string; // utile si tu veux aussi taper User
  }
}
