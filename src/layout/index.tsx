import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link as LocaleLink, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import NavBreadcrumb from "@/components/nav-breadcrumb";
import { Button } from "@/components/ui/button";

function Layout({ children }: { children: ReactNode }) {
  const t = useTranslations();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const flagEmoji = currentLocale === "id" ? "🇮🇩" : "🇬🇧";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 mr-6">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <NavBreadcrumb />
          </div>
          {/* Language Switcher (flag only) */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <span className="text-lg">{flagEmoji}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center">
                <DropdownMenuItem asChild>
                  <LocaleLink href={pathname} locale="en">
                    🇬🇧 English
                  </LocaleLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <LocaleLink href={pathname} locale="id">
                    🇮🇩 Bahasa
                  </LocaleLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div className="p-6 space-y-4 container mx-auto">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default Layout;
