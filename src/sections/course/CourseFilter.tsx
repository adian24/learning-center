import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, List, Search } from "lucide-react";
import React, { Dispatch, SetStateAction } from "react";

interface CourseFilterProps {
  viewType: "grid" | "list";
  setViewType: Dispatch<SetStateAction<"grid" | "list">>;
}

const CourseFilter = ({ viewType, setViewType }: CourseFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
        <Input placeholder="Cari course..." className="pl-9" />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="published">Published</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Level" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Level</SelectItem>
          <SelectItem value="BEGINNER">Beginner</SelectItem>
          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
          <SelectItem value="ADVANCED">Advanced</SelectItem>
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button
          variant={viewType === "grid" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewType("grid")}
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewType === "list" ? "default" : "outline"}
          size="icon"
          onClick={() => setViewType("list")}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CourseFilter;
