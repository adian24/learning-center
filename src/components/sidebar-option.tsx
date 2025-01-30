import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarMenu, useSidebar } from "./ui/sidebar";

export function SidebarOption() {
  const { open } = useSidebar();

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
              <Button
                className="w-full bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
                size="sm"
              >
                Daftar Sebagai Teacher
              </Button>
            </CardContent>
          </form>
        </Card>
      </SidebarMenu>
    </SidebarMenu>
  );
}
