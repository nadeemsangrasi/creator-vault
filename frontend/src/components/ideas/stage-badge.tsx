import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StageBadgeProps {
  stage: "idea" | "outline" | "draft" | "published";
}

export function StageBadge({ stage }: StageBadgeProps) {
  const stageConfig = {
    idea: {
      label: "Idea",
      className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    outline: {
      label: "Outline",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    },
    draft: {
      label: "Draft",
      className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    },
    published: {
      label: "Published",
      className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    },
  };

  const config = stageConfig[stage];

  return (
    <Badge variant="outline" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}