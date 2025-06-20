import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Landing from "@/views/landing";

const Page = async () => {
  const session = await auth();

  if (session?.user) redirect("/dashboard");

  return <Landing />;
};

export default Page;
