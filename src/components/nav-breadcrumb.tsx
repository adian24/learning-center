"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateBreadcrumb } from "@/lib/breadcrumb";
import { Fragment } from "react";
import { useTranslations } from "next-intl";
// import { useCourseQuery } from "@/hooks/use-course-query";

export default function NavBreadcrumb() {
  const t = useTranslations("common");
  const pathname = usePathname();

  // Early return for root path
  if (pathname === "/") return null;

  // More precise course ID extraction
  const courseIdMatch = pathname.match(/^\/courses\/([^\/]+)$/);
  const courseId = courseIdMatch?.[1] || null;

  // Only fetch course query if a valid course ID exists
  // const { data: course } = courseId !== null ? useCourseQuery(courseId) : { data: null };

  const breadcrumbs = generateBreadcrumb(pathname);

  let updatedBreadcrumbs = breadcrumbs;

  // Only modify breadcrumbs if course data is available
  if (courseId) {
    updatedBreadcrumbs = breadcrumbs.map((breadcrumb) => {
      if (/course|[0-9]/.test(breadcrumb.label.toLowerCase())) {
        return {
          ...breadcrumb,
          // label: course.title,
        };
      }
      return breadcrumb;
    });
  }

  const tWithFallback = (key: string) => {
    if (t.has(key)) {
      return t(key);
    }

    return key;
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>{t("home")}</BreadcrumbItem>
        <BreadcrumbSeparator />
        {updatedBreadcrumbs.map((breadcrumb, index) => {
          return (
            <Fragment key={index}>
              {breadcrumb.isLast ? (
                <BreadcrumbPage>
                  {tWithFallback(
                    `${breadcrumb.label.toLowerCase().replaceAll(/\s/g, "_")}`
                  )}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbItem>
                    {tWithFallback(
                      `${breadcrumb.label.toLowerCase().replaceAll(/\s/g, "_")}`
                    )}
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
