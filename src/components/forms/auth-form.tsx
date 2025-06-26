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
  const t = useTranslations();
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
        setError(
          "This email is already registered with Google. Please use 'Sign in with Google' instead."
        );
        return;
      }

      const result = await signIn("credentials", {
        email: email,
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Email atau password yang Anda masukkan salah");
        } else {
          setError("Terjadi kesalahan saat proses login. Silakan coba lagi.");
        }
      } else {
        const routerCache = localStorage.getItem("routerCache");
        router.push(routerCache || "/dashboard");
        localStorage.removeItem("routerCache");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setError("Terjadi kesalahan saat proses login. Silakan coba lagi.");
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
          setError(
            "This email is already registered with email/password. Please sign in using your email and password instead."
          );
        } else if (result.error === "EmailExistsWithCredentials") {
          setError(
            "This email is already registered with email/password. Please sign in using your email and password instead."
          );
        } else {
          setError("Google sign-in failed. Please try again.");
        }
      } else if (result?.ok) {
        const routerCache = localStorage.getItem("routerCache");
        router.push(routerCache || "/dashboard");
        localStorage.removeItem("routerCache");
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("title_signin")}</CardTitle>
          <CardDescription>{t("subtitle_signin")}</CardDescription>
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
                {isGoogleLoading ? "Signing in..." : "Masuk dengan Google"}
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                {t("or_signin")}
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
                  <Label htmlFor="email">{t("email_signin")}</Label>
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
                    <Label htmlFor="password">{t("password_signin")}</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      {t("forgot_password_signin")}
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
                  defaultText={t("submit_signin")}
                  loadingText={t("loading_signin")}
                />
              </div>
            </form>
            <div className="text-center text-sm">
              {t("no_account_signin")}{" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                {t("signup")}
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        {t("terms")} <a href="#">{t("terms_link")}</a> {t("and")}{" "}
        <a href="#">{t("privacy_link")}</a>.
      </div>
    </div>
  );
}
