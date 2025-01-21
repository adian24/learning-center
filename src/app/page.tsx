import HeroFormSignUpForm from "@/components/hero";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();

  if (session?.user) redirect("/dashboard");

  console.log("session", session);

  return <HeroFormSignUpForm />;
};

export default Page;
