"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <nav className="border-b">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl">
              LearningCenter
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:underline"
                >
                  Dashboard
                </Link>

                {/* Profile Avatar & Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage
                        src={session?.user?.image || ""}
                        alt="Profile"
                      />
                      <AvatarFallback>
                        {session?.user?.name?.charAt(0) || (
                          <User className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuItem>
                      <Link
                        href="/profile"
                        className="flex items-center w-full"
                      >
                        Profile
                      </Link>
                    </DropdownMenuItem> */}
                    <DropdownMenuItem>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              /* Unauthenticated - Signup Button */
              <Button asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
