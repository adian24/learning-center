"use server";

import { registerSchema } from "@/lib/schema";
import db from "@/lib/db/db";
import argon2 from "argon2";

const signUp = async (formData: FormData) => {
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");
  const validatedData = registerSchema.parse({ email, password, name });

  if (!validatedData) {
    return { success: false };
  }

  const existingUser = await db.user.findUnique({
    where: { email: validatedData.email },
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await argon2.hash(validatedData.password);

  await db.user.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
    },
  });

  return { success: true };
};

const checkEmailExists = async (email: string) => {
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  return user !== null;
};

export { signUp, checkEmailExists };
