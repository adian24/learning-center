import HeroFormSignUpForm from "@/components/hero";
import { Button, buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Page = async () => {
  const session = await auth();

  return <HeroFormSignUpForm />;
};

export default Page;
