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
import { useCourseQuery } from "@/hooks/use-course-query";

export default function NavBreadcrumb() {
  const pathname = usePathname();
  const courseIdMatch = pathname.match(/\/courses\/([^\/]+)/);
  const courseId = courseIdMatch ? courseIdMatch[1] : null;

  const { data: course } = courseId ? useCourseQuery(courseId) : { data: null };

  if (pathname === "/") return null;

  const breadcrumbs = generateBreadcrumb(pathname);

  let updatedBreadcrumbs = breadcrumbs;

  if (courseId && course) {
    updatedBreadcrumbs = breadcrumbs.map((breadcrumb) => {
      if (breadcrumb.label.match(/[0-9]/)) {
        return {
          ...breadcrumb,
          label: course.title,
        };
      }
      return breadcrumb;
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link always visible */}
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* Dynamic breadcrumbs */}
        {updatedBreadcrumbs.map((breadcrumb, index) => (
          <Fragment key={index}>
            {breadcrumb.isLast ? (
              <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbItem>{breadcrumb.label}</BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
