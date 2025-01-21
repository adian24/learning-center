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
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
        name: {},
      },
      authorize: async (credentials) => {
        const { email, password } = loginSchema.parse(credentials);

        const emailExists = await checkEmailExists(email);

        if (emailExists) {
          throw new Error("User already exists.");
        }

        const user = await db.user.findFirst({
          where: {
            email: email,
          },
        });

        if (!user) {
          throw new Error("Invalid credentials.");
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
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
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
