import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth";
import Link from "next/link";
import ActionButton from "./action-button";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import GoogleAuthButton from "./google-auth";
import { executeAction } from "@/lib/executeAction";

async function handleCredential(formData: FormData) {
  "use server";
  await executeAction({
    actionFn: async () => {
      const result = await signIn("credentials", {
        email: formData.get("email"),
        password: formData.get("password"),
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      redirect("/dashboard");
    },
  });
}

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("signin");
  const tCommon = useTranslations("common");

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
              <GoogleAuthButton redirectTo="/dashboard">
                {t("subtitle")}
              </GoogleAuthButton>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground">
                {tCommon("or")}
              </span>
            </div>
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
