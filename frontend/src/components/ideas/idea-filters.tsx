import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { StageFilter } from "./stage-filter";
import { PriorityFilter } from "./priority-filter";
import { TagFilter } from "./tag-filter";
import { Idea } from "@/types/idea";

interface IdeaFiltersProps {
  stage: string;
  priority: string;
  tags: string[];
  searchQuery: string;
  allTags: string[];
  onStageChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onSearchChange: (value: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function IdeaFilters({
  stage,
  priority,
  tags,
  searchQuery,
  allTags,
  onStageChange,
  onPriorityChange,
  onTagsChange,
  onSearchChange,
  onClearFilters,
  hasActiveFilters,
}: IdeaFiltersProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-2">
            <StageFilter value={stage} onChange={onStageChange} />
            <PriorityFilter value={priority} onChange={onPriorityChange} />
            <TagFilter
              availableTags={allTags}
              selectedTags={tags}
              onTagsChange={onTagsChange}
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search ideas..."
              className="w-full px-3 py-2 border rounded-md text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}