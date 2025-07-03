import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = {
    ...(await import(`../locale/${locale}/landing.json`)).default,
    ...(await import(`../locale/${locale}/signup.json`)).default,
    ...(await import(`../locale/${locale}/signin.json`)).default,
    ...(await import(`../locale/${locale}/dashboard.json`)).default,
    ...(await import(`../locale/${locale}/common.json`)).default,
    ...(await import(`../locale/${locale}/careers.json`)).default,
    ...(await import(`../locale/${locale}/students.json`)).default,
    ...(await import(`../locale/${locale}/courses.json`)).default,
    ...(await import(`../locale/${locale}/chapters.json`)).default,
    ...(await import(`../locale/${locale}/reviews.json`)).default,
    ...(await import(`../locale/${locale}/checkout.json`)).default,

    ...(await import(`../locale/${locale}/teacher.json`)).default,
  };

  return {
    locale,
    messages,
  };
});
