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
import { Fragment } from "react";
import { Link as LocaleLink, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";

const Navbar = () => {
  const t = useTranslations();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const flagEmoji = currentLocale === "id" ? "🇮🇩" : "🇬🇧";

  return (
    <nav className="border-b bg-white">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="font-bold text-xl text-sky-700">
              LearningCenter
            </Link>
          </div>

          {/* Auth */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:underline"
                >
                  {t("dashboard")}
                </Link>

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
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => signOut()}
                        className="flex items-center w-full"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("logout")}
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Fragment>
                <Button
                  variant="outline"
                  className="border-sky-700 text-sky-600 hover:bg-black hover:text-white"
                  asChild
                >
                  <Link href="/sign-in">{t("signin")}</Link>
                </Button>
                <Button
                  className="bg-sky-600 text-white hover:bg-sky-700"
                  asChild
                >
                  <Link href="/sign-up">{t("signup")}</Link>
                </Button>
              </Fragment>
            )}

            {/* Language Switcher (flag only) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="text-lg">{flagEmoji}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem asChild>
                  <LocaleLink href={pathname} locale="en">
                    🇬🇧 English
                  </LocaleLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocaleLink href={pathname} locale="id">
                    🇮🇩 Bahasa
                  </LocaleLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
