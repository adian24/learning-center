import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { signUp } from "@/lib/actions";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import ActionButton from "./action-button";
import { useTranslations } from "next-intl";
import GoogleAuthButton from "./google-auth";

export default function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("signup");
  const tCommon = useTranslations("common");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-6" />
            </div>
            <span className="sr-only">Learning Center</span>
          </a>
          <h1 className="text-xl font-bold">{t("title")}</h1>
          <div className="text-center text-sm">
            {t("have_account")}{" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              {tCommon("signin")}
            </Link>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <form
            action={async (formData) => {
              "use server";
              const res = await signUp(formData);
              if (res.success) {
                redirect("/sign-in");
              } else {
                console.error("Failed to sign up");
              }
            }}
          >
            <div className="grid gap-3 space-y-3">
              <div className="grid gap-3">
                <Label htmlFor="email">{t("name_label")}</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder={t("name_placeholder")}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">{t("email_label")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("email_placeholder")}
                  required
                />
              </div>
              <div className="grid gap-3">
                {" "}
                <Label htmlFor="email">{t("password_label")}</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder={t("password_placeholder")}
                  type="password"
                  required
                  autoComplete="password"
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
        </div>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            {tCommon("or")}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-1">
          <GoogleAuthButton>{t("google")}</GoogleAuthButton>
        </div>
      </div>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary  ">
        {tCommon("terms")} <a href="#">{tCommon("terms_link")}</a>{" "}
        {tCommon("and")} <a href="#">{tCommon("privacy_link")}</a>.
      </div>
    </div>
  );
}
