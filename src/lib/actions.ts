import { registerSchema } from "@/lib/schema";
import db from "@/lib/db/db";
import { executeAction } from "@/lib/executeAction";
import argon2 from "argon2";

const signUp = async (formData: FormData) => {
  return executeAction({
    actionFn: async () => {
      const email = formData.get("email");
      const password = formData.get("password");
      const name = formData.get("name");
      const validatedData = registerSchema.parse({ email, password, name });

      const hashedPassword = await argon2.hash(validatedData.password);

      await db.user.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          password: hashedPassword,
        },
      });
    },
    successMessage: "Signed up successfully",
  });
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
