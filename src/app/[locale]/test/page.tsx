import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Page() {
  const t = useTranslations("landing");

  return (
    <div>
      <h2>PAGE</h2>
      <Link href="/test" locale="en">
        Switch to English
      </Link>
      <hr />
      <Link href="/test" locale="id">
        Switch to Bahasa
      </Link>
      <p>{t("hero_title")}</p>
    </div>
  );
}
