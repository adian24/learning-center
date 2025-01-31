"use client";

import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { generateBreadcrumb } from "@/lib/breadcrumb";

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
          <BreadcrumbItem key={breadcrumb.href}>
            {breadcrumb.isLast ? (
              <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
            ) : (
              <>
                <BreadcrumbLink href={breadcrumb.href}>
                  {breadcrumb.label}
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
