import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { X } from "lucide-react";
import React, { useState } from "react";

interface TagFilterProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagFilter({ availableTags, selectedTags, onTagsChange }: TagFilterProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleUnselect = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex h-9 items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            selectedTags.length > 0 && "bg-muted/50"
          )}
        >
          {selectedTags.length === 0 ? (
            <>
              <span>Select tags...</span>
            </>
          ) : (
            <div className="flex gap-1">
              {selectedTags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-sm px-1 font-normal">
                  {tag}
                  <span
                    className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(tag);
                      }
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleUnselect(tag);
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Remove ${tag} tag`}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </span>
                </Badge>
              ))}
              {selectedTags.length > 2 && (
                <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                  +{selectedTags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search tags..." />
          <CommandList>
            <CommandEmpty>No tags found.</CommandEmpty>
            <CommandGroup>
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <CommandItem
                    key={tag}
                    onSelect={() => handleSelect(tag)}
                    className="capitalize"
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className="h-4 w-4" />
                    </div>
                    <span>{tag}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedTags.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onTagsChange([])}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}