import HeroFormSignUpForm from "@/components/hero";
import { Button, buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import Link from "next/link";

const Page = async () => {
  const session = await auth();

  return (
    <HeroFormSignUpForm />
    // <div className="py-10 lg:py-16">
    //   <div className="max-w-2xl text-center mx-auto">
    //     <p className="">Elevate your projects</p>
    //     {/* Title */}
    //     <div className="mt-5 max-w-2xl">
    //       <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
    //         Beautiful UI Blocks
    //       </h1>
    //     </div>
    //     {/* End Title */}
    //     <div className="mt-5 max-w-3xl">
    //       <p className="text-xl text-muted-foreground">
    //         Over 10+ fully responsive, UI blocks you can drop into your Shadcn
    //         UI projects and customize to your heart&apos;s content.
    //       </p>
    //     </div>
    //     {/* Buttons */}
    //     <div className="mt-8 gap-3 flex justify-center">
    //       {session?.user ? (
    //         <Link
    //           className={cn(
    //             buttonVariants({ size: "lg" }),
    //             "duration-300 transition-all"
    //           )}
    //           href="/dashboard"
    //         >
    //           <Button size={"lg"}>Dashboard</Button>
    //         </Link>
    //       ) : (
    //         <>
    //           <Link className={"duration-300 transition-all"} href="/sign-in">
    //             <Button size={"lg"}>Masuk</Button>
    //           </Link>
    //           <Link className={"duration-300 transition-all"} href="/sign-up">
    //             <Button size={"lg"} variant={"outline"}>
    //               Daftar
    //             </Button>
    //           </Link>
    //         </>
    //       )}
    //     </div>
    //     {/* End Buttons */}
    //   </div>
    // </div>
  );
};

export default Page;
