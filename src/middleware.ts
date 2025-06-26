// export { auth as middleware } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

// export default createMiddleware(routing);

export default createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
