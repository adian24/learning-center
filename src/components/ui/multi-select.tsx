"use client";

import * as React from "react";
import { Check, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ExpertiseType } from "@/lib/constants";

interface MultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: ExpertiseType[];
  placeholder?: string;
}

export function MultiSelect({
  value = [],
  onChange,
  options,
  placeholder = "Select items...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter((item) => item !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  const handleRemove = (selectedValue: string) => {
    onChange(value.filter((item) => item !== selectedValue));
  };

  const addCustomValue = () => {
    if (
      inputValue.trim() !== "" &&
      !value.includes(inputValue.trim()) &&
      !options.some((group) => group.options.includes(inputValue.trim()))
    ) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  // Flatten all options for search
  const allOptions = options.flatMap((group) => group.options);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full border border-input px-3 py-2 text-sm rounded-md min-h-[40px] flex flex-wrap gap-1 cursor-pointer">
          {value.length === 0 && (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="mr-1">
              {item}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none hover:bg-secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(item);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput
            placeholder="Search expertise..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty className="py-2 px-4">
              {inputValue && (
                <button
                  onClick={addCustomValue}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add "{inputValue}"
                </button>
              )}
              {!inputValue && "No expertise found."}
            </CommandEmpty>

            {options.map((group) => (
              <React.Fragment key={group.group}>
                <CommandGroup heading={group.group}>
                  {group.options.map((option) => (
                    <CommandItem
                      key={option}
                      onSelect={() => handleSelect(option)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value.includes(option) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
