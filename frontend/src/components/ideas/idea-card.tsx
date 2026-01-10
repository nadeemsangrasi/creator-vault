import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { StageBadge } from "./stage-badge";
import { PriorityBadge } from "./priority-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, Tag } from "lucide-react";
import Link from "next/link";
import { Idea } from "@/types/idea";
import { format } from "date-fns";

interface IdeaCardProps {
  idea: Idea;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Link href={`/ideas/${idea.id}`} className="block">
      <Card className="h-full flex flex-col cursor-pointer hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold leading-none tracking-tight line-clamp-2">
            {idea.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <StageBadge stage={idea.stage} />
          <PriorityBadge priority={idea.priority} />
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-3">
        {idea.notes && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {idea.notes}
          </p>
        )}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {idea.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-3 flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          {format(new Date(idea.updated_at), "MMM dd, yyyy")}
        </div>
        <Button variant="outline" size="sm">
          View
        </Button>
      </CardFooter>
    </Card>
    </Link>
  );
}