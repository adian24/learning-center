import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SearchIcon, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

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
  variant?: "sidebar" | "drawer" | "inline";
};

const CourseFilters: React.FC<FilterProps> = ({
  categories,
  filters,
  onFilterChange,
  variant = "inline",
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);
  const [tempFilters, setTempFilters] = useState<FilterValues>(filters);

  // Filter options
  const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleFilterChange = (
    key: keyof FilterValues,
    value: string | number
  ) => {
    const newFilters = { ...tempFilters, [key]: value };
    setTempFilters(newFilters);

    // For sidebar and drawer variants, apply changes immediately
    if (variant === "sidebar" || variant === "drawer") {
      onFilterChange(newFilters);
    }
  };

  const resetFilters = () => {
    const resetValues: FilterValues = {
      search: "",
      category: "",
      level: "",
      language: "",
      minPrice: 0,
      maxPrice: 1000000,
      minRating: 0,
    };
    setTempFilters(resetValues);
    setSearchInput("");
    onFilterChange(resetValues);
  };

  // Count active filters (excluding search)
  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) =>
      key !== "search" &&
      value !== "" &&
      value !== 0 &&
      (key !== "maxPrice" || value !== 1000000)
  ).length;

  // Render search form (common across all variants)
  const renderSearchForm = () => (
    <form onSubmit={handleSearchSubmit} className="w-full mb-4">
      <div className="relative flex gap-2">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Cari courses..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit">
          <SearchIcon />
        </Button>
      </div>
    </form>
  );

  // Render sidebar/drawer filters
  const renderSidebarFilters = () => (
    <div className="space-y-6">
      {renderSearchForm()}

      <Accordion
        type="multiple"
        defaultValue={["category", "level", "price", "language", "rating"]}
      >
        <AccordionItem value="category">
          <AccordionTrigger>Kategori</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-categories"
                  checked={filters.category === ""}
                  onCheckedChange={() => handleFilterChange("category", "")}
                />
                <label htmlFor="all-categories" className="text-sm">
                  All categories
                </label>
              </div>
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.category === category.id}
                    onCheckedChange={() =>
                      handleFilterChange("category", category.id)
                    }
                  />
                  <label
                    htmlFor={`category-${category.id}`}
                    className="text-sm"
                  >
                    {category.name}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="level">
          <AccordionTrigger>Level</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-levels"
                  checked={filters.level === ""}
                  onCheckedChange={() => handleFilterChange("level", "")}
                />
                <label htmlFor="all-levels" className="text-sm">
                  Semua level
                </label>
              </div>
              {levels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={filters.level === level}
                    onCheckedChange={() => handleFilterChange("level", level)}
                  />
                  <label htmlFor={`level-${level}`} className="text-sm">
                    {level}
                  </label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Rentang Harga</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  Rp{tempFilters.minPrice} - Rp
                  {tempFilters.maxPrice === 1000000
                    ? "1.000.000+"
                    : tempFilters.maxPrice}
                </span>
              </div>
              <Slider
                value={[tempFilters.minPrice, tempFilters.maxPrice]}
                max={1000000}
                step={1000}
                onValueChange={(value) => {
                  setTempFilters((prev) => ({
                    ...prev,
                    minPrice: value[0],
                    maxPrice: value[1],
                  }));
                }}
                onValueCommit={(value) => {
                  handleFilterChange("minPrice", value[0]);
                  handleFilterChange("maxPrice", value[1]);
                }}
                className="py-4"
              />
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rating">
          <AccordionTrigger>Penilaian</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">
                  {tempFilters.minRating}+ stars
                </span>
              </div>
              <Slider
                value={[tempFilters.minRating]}
                max={5}
                step={0.5}
                onValueChange={(value) => {
                  setTempFilters((prev) => ({
                    ...prev,
                    minRating: value[0],
                  }));
                }}
                onValueCommit={(value) => {
                  handleFilterChange("minRating", value[0]);
                }}
                className="py-4"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50 mt-4 w-full"
          onClick={resetFilters}
        >
          <X className="h-4 w-4 mr-1" />
          Reset All Filters
        </Button>
      )}
    </div>
  );

  // Default inline filtering UI (the one we had previously)
  const renderInlineFilters = () => (
    <div className="space-y-4">
      {renderSearchForm()}

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
          {(filters.minPrice > 0 || filters.maxPrice < 1000000) && (
            <Badge variant="outline" className="flex items-center gap-1">
              Harga: ${filters.minPrice} - $
              {filters.maxPrice === 1000000 ? "1.000.000+" : filters.maxPrice}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() =>
                  onFilterChange({ ...filters, minPrice: 0, maxPrice: 1000000 })
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

  if (variant === "sidebar" || variant === "drawer") {
    return renderSidebarFilters();
  }

  return renderInlineFilters();
};

export default CourseFilters;
