import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { admin, multiSession } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { lastLoginMethod } from "better-auth/plugins";

const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

if (!BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  secret: BETTER_AUTH_SECRET,
  baseURL: APP_URL,

  plugins: [
    admin({
      defaultRole: "USER",
      adminRole: "ADMIN",
    }),
    multiSession(),
    lastLoginMethod(),
    nextCookies(),
  ],

  trustedOrigins: [APP_URL],

  emailAndPassword: {
    enabled: true,
  },

  user: {
    deleteUser: { 
      enabled: true
    } 
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  advanced: {
    disableErrorPage: true,
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    },
    onAPIError: {
      disableErrorPage: true,
    },
  },
});

// TypeScript exports for frontend and backend use
export type Auth = typeof auth;
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;