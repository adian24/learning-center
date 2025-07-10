import { v4 as uuid } from "uuid";
import { encode as defaultEncode } from "next-auth/jwt";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { loginSchema } from "@/lib/schema";
import { checkEmailExists } from "./actions";
import db from "@/lib/db/db";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import argon2 from "argon2";

const adapter = PrismaAdapter(db);

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  providers: [
    Google({
      allowDangerousEmailAccountLinking: false, // Prevent automatic linking
    }),
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        let user = null;

        const { email, password } = await loginSchema.parseAsync(credentials);

        const emailExists = await checkEmailExists(email);

        if (!emailExists) {
          throw new Error("User not found.");
        }

        user = await db.user.findFirst({
          where: {
            email: email,
          },
          include: {
            accounts: {
              select: {
                provider: true,
              },
            },
          },
        });

        if (!user) {
          throw new Error("Invalid credentials.");
        }

        // Check if user has Google account but no password
        const hasGoogleAccount = user.accounts.some(
          (account) => account.provider === "google"
        );

        if (hasGoogleAccount && !user.password) {
          throw new Error("EmailExistsWithGoogle");
        }

        // Verify the password
        if (!user?.password) {
          throw new Error("Invalid credentials.");
        }

        const isValid = await argon2.verify(user.password, password);

        if (!isValid) {
          throw new Error("Invalid credentials.");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle Google sign-in
      if (account?.provider === "google") {
        const email = user.email;

        if (email) {
          // Check if user exists with credentials
          const existingUser = await db.user.findUnique({
            where: { email },
            include: {
              accounts: {
                select: {
                  provider: true,
                },
              },
            },
          });

          if (existingUser) {
            // Check if user has password but no Google account
            const hasPassword = !!existingUser.password;
            const hasGoogleAccount = existingUser.accounts.some(
              (acc) => acc.provider === "google"
            );

            if (hasPassword && !hasGoogleAccount) {
              // User exists with credentials, prevent Google sign-in
              throw new Error("EmailExistsWithCredentials");
            }
          }
        }
      }

      return true;
    },
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      // Log successful sign-ins
      console.log(`User ${user.email} signed in with ${account?.provider}`);
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          throw new Error("No user ID found in token");
        }

        const createdSession = await adapter?.createSession?.({
          sessionToken: sessionToken,
          userId: params.token.sub,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        if (!createdSession) {
          throw new Error("Failed to create session");
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
});
