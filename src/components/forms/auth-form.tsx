"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";
import Link from "next/link";
import ActionButton from "./action-button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "../ui/alert";
import { useTranslations } from "next-intl";

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("signin");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  // Helper function to check what provider an email is registered with
  const checkEmailProvider = async (email: string) => {
    try {
      const response = await fetch("/api/auth/check-provider", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.provider; // 'google', 'credentials', or null
      }
      return null;
    } catch (error) {
      console.error("Error checking email provider:", error);
      return null;
    }
  };

  async function handleCredential(formData: FormData) {
    setError("");
    const email = formData.get("email") as string;

    try {
      // First, check if this email is registered with Google
      const existingProvider = await checkEmailProvider(email);

      if (existingProvider === "google") {
        setError(t("errors.google_registered"));
        return;
      }

      const result = await signIn("credentials", {
        email: email,
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError(t("errors.credentials_signin"));
        } else {
          setError(t("errors.login_error"));
        }
      } else {
        const routerCache = localStorage.getItem("routerCache");
        router.push(routerCache || "/dashboard");
        localStorage.removeItem("routerCache");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError(t("errors.login_error"));
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");

    try {
      const result = await signIn("google", {
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "OAuthAccountNotLinked") {
          setError(t("errors.oauth_not_linked"));
        } else if (result.error === "EmailExistsWithCredentials") {
          setError(t("errors.email_exists_credentials"));
        } else {
          setError(t("errors.google_signin_failed"));
        }
      } else if (result?.ok) {
        const routerCache = localStorage.getItem("routerCache");
        router.push(routerCache || "/dashboard");
        localStorage.removeItem("routerCache");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError(t("errors.google_signin_failed"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{tCommon("signin")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {isGoogleLoading ? t("loading") + "..." : t("subtitle")}
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                {tCommon("or")}
              </span>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form action={handleCredential}>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{t("password")}</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t("forgot_password")}
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                  />
                </div>
                <ActionButton
                  type="submit"
                  className="w-full"
                  defaultText={t("submit")}
                  loadingText={t("loading")}
                />
              </div>
            </form>
            <div className="text-center text-sm">
              {t("no_account")}{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                {tCommon("signup")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        {tCommon("terms")} <a href="#">{tCommon("terms_link")}</a>{" "}
        {tCommon("and")} <a href="#">{tCommon("privacy_link")}</a>.
      </div>
    </div>
  );
}
