import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

type FilterValues = {
  search: string;
  category: string;
  level: string;
  language: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
};

type FilterProps = {
  categories: { id: string; name: string }[];
  filters: FilterValues;
  onFilterChange: (filters: FilterValues) => void;
};

const CourseFilters: React.FC<FilterProps> = ({
  categories,
  filters,
  onFilterChange,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [openFilters, setOpenFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterValues>(filters);

  // Filter options
  const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
  const languages = [
    "English",
    "Spanish",
    "Indonesian",
    "French",
    "German",
    "Chinese",
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleFilterChange = (
    key: keyof FilterValues,
    value: string | number
  ) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    onFilterChange(tempFilters);
    setOpenFilters(false);
  };

  const resetFilters = () => {
    const resetValues: FilterValues = {
      search: "",
      category: "",
      level: "",
      language: "",
      minPrice: 0,
      maxPrice: 1000,
      minRating: 0,
    };
    setTempFilters(resetValues);
    onFilterChange(resetValues);
    setSearchInput("");
    setOpenFilters(false);
  };

  // Count active filters (excluding search)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "search" &&
      value !== "" &&
      value !== 0 &&
      (key !== "maxPrice" || value !== 1000)
  ).length;

  return (
    <div className="mb-8 space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search courses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">Search</Button>
        <Popover open={openFilters} onOpenChange={setOpenFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-primary">{activeFilterCount}</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={tempFilters.category}
                  onValueChange={(value) =>
                    handleFilterChange("category", value)
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <Select
                  value={tempFilters.level}
                  onValueChange={(value) => handleFilterChange("level", value)}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All levels</SelectItem>
                    {levels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={tempFilters.language}
                  onValueChange={(value) =>
                    handleFilterChange("language", value)
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="All languages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All languages</SelectItem>
                    {languages.map((language) => (
                      <SelectItem key={language} value={language}>
                        {language}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Price Range</Label>
                  <span className="text-sm text-gray-500">
                    ${tempFilters.minPrice} - $
                    {tempFilters.maxPrice === 1000
                      ? "1000+"
                      : tempFilters.maxPrice}
                  </span>
                </div>
                <Slider
                  defaultValue={[tempFilters.minPrice, tempFilters.maxPrice]}
                  max={1000}
                  step={10}
                  onValueChange={(value) => {
                    handleFilterChange("minPrice", value[0]);
                    handleFilterChange("maxPrice", value[1]);
                  }}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Minimum Rating</Label>
                  <span className="text-sm text-gray-500">
                    {tempFilters.minRating}+ stars
                  </span>
                </div>
                <Slider
                  defaultValue={[tempFilters.minRating]}
                  max={5}
                  step={0.5}
                  onValueChange={(value) =>
                    handleFilterChange("minRating", value[0])
                  }
                  className="py-4"
                />
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={resetFilters}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reset
                </Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </form>

      {/* Active filter badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.category && (
            <Badge variant="outline" className="flex items-center gap-1">
              Category:{" "}
              {categories.find((c) => c.id === filters.category)?.name}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ ...filters, category: "" })}
              />
            </Badge>
          )}
          {filters.level && (
            <Badge variant="outline" className="flex items-center gap-1">
              Level: {filters.level}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ ...filters, level: "" })}
              />
            </Badge>
          )}
          {filters.language && (
            <Badge variant="outline" className="flex items-center gap-1">
              Language: {filters.language}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ ...filters, language: "" })}
              />
            </Badge>
          )}
          {(filters.minPrice > 0 || filters.maxPrice < 1000) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Price: ${filters.minPrice} - $
              {filters.maxPrice === 1000 ? "1000+" : filters.maxPrice}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFilterChange({ ...filters, minPrice: 0, maxPrice: 1000 })
                }
              />
            </Badge>
          )}
          {filters.minRating > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              Rating: {filters.minRating}+ stars
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFilterChange({ ...filters, minRating: 0 })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseFilters;
