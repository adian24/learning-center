import HeroFormSignUpForm from "@/components/hero";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const SignIn = async () => {
  const session = await auth();
  if (session) redirect("/");

  return (
    <div className="py-10">
      <HeroFormSignUpForm />
    </div>
  );
};

export default SignIn;
