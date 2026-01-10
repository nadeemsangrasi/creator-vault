import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Idea } from "@/types/idea";
import { IdeaCard } from "@/components/ideas/idea-card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RecentIdeasProps {
  ideas: Idea[];
}

export function RecentIdeas({ ideas }: RecentIdeasProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Ideas</CardTitle>
      </CardHeader>
      <CardContent>
        {ideas.length > 0 ? (
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {ideas.slice(0, 5).map((idea) => (
                <div key={idea.id} className="hover:bg-muted/50 transition-colors">
                  <IdeaCard idea={idea} />
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No recent ideas</p>
            <p className="text-sm mt-1">Create your first idea to get started</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}