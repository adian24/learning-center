import { auth } from "@/lib/auth";
import Landing from "@/views/landing";
import { redirect } from "next/navigation";

const Page = async () => {
  const session = await auth();

  if (session?.user) redirect("/dashboard");

  return <Landing />;
};

export default Page;
