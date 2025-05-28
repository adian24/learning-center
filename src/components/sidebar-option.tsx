import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarMenu, useSidebar } from "./ui/sidebar";
import Link from "next/link";
import { useUserRole } from "@/hooks/use-user-role";

export function SidebarOption() {
  const { open } = useSidebar();
  const { data: user, isLoading } = useUserRole();

  // Don't show while loading or if user has teacher profile
  if (isLoading || !user || user?.role === "TEACHER") {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenu className={open ? "block" : "hidden"}>
        <Card className="shadow-none">
          <form>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-sm">Menjadi Teacher?</CardTitle>
              <CardDescription>
                Buat kelas Anda sendiri dan dapatkan cuan tambahan.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2.5 p-4">
              <Link href={"/teacher/register"}>
                <Button
                  className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
                  size="sm"
                >
                  Daftar Sebagai Teacher
                </Button>
              </Link>
            </CardContent>
          </form>
        </Card>
      </SidebarMenu>
    </SidebarMenu>
  );
}
