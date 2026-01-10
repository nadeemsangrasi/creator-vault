import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import { Search } from "lucide-react";

interface IdeaSearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function IdeaSearch({ value, onChange, className }: IdeaSearchProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search ideas..."
        className="pl-9 w-full"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}