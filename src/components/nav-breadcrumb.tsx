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
// import { useCourseQuery } from "@/hooks/use-course-query";

export default function NavBreadcrumb() {
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
