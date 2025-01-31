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

export default function NavBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumb(pathname);

  // Don't show breadcrumb on home page
  if (pathname === "/") return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home link always visible */}
        <BreadcrumbItem>Home</BreadcrumbItem>
        <BreadcrumbSeparator />

        {/* Dynamic breadcrumbs */}
        {breadcrumbs.map((breadcrumb, index) => (
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
