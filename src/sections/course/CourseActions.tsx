import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const CourseActions = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-8 w-8 p-0">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Aksi</DropdownMenuLabel>
      <DropdownMenuItem>Edit Course</DropdownMenuItem>
      <DropdownMenuItem>Atur Chapter</DropdownMenuItem>
      <DropdownMenuItem>Atur Quiz</DropdownMenuItem>
      <DropdownMenuItem>Analytics</DropdownMenuItem>
      <DropdownMenuItem className="text-red-600">Hapus</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default CourseActions;
