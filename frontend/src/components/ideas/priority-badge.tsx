import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface PriorityBadgeProps {
  priority: "low" | "medium" | "high";
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityConfig = {
    low: {
      label: "Low",
      className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/30 dark:text-gray-300 dark:border-gray-700",
    },
    medium: {
      label: "Medium",
      className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    },
    high: {
      label: "High",
      className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    },
  };

  const config = priorityConfig[priority];

  return (
    <Badge variant="outline" className={cn("capitalize", config.className)}>
      {config.label}
    </Badge>
  );
}