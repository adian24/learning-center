"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("landing");

  return (
    <footer className="relative bg-white text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-2xl font-bold text-sky-700">
              Learning Center
            </span>
          </div>
          <p className="text-sm leading-relaxed text-gray-600 mb-6">
            {t("footer_description")}
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-gray-900 border-b-2 border-sky-500 inline-block">
            {t("footer_training_category")}
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="#">» {t("footer_categories_business")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_categories_design")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_categories_personal")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_categories_certification")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_categories_tech")}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-gray-900 border-b-2 border-sky-500 inline-block">
            {t("footer_help")}
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="#">» {t("footer_help_center")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_faq")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_contact_us")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_user_guide")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_report_issue")}</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-4 text-gray-900 border-b-2 border-sky-500 inline-block">
            {t("footer_quick_links")}
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link href="#">» {t("footer_all_courses")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_about_us")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_partner")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_privacy_policy")}</Link>
            </li>
            <li>
              <Link href="#">» {t("footer_terms_conditions")}</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-28 bg-contain bg-no-repeat bg-bottom bg-[url('/footer-silhouette.svg')] opacity-10"></div>

      <div className="text-center pt-6 text-xs text-gray-500 border-t border-gray-200">
        © {new Date().getFullYear()} Learning Center. {t("footer_rights")}
      </div>
    </footer>
  );
}
