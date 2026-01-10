"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Calendar, MessageSquare, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { toast } from "sonner";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types/idea";
import { StageBadge } from "@/components/ideas/stage-badge";
import { PriorityBadge } from "@/components/ideas/priority-badge";
import { DeleteDialog } from "@/components/ideas/delete-dialog";
import { format } from "date-fns";

interface IdeaDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function IdeaDetailPage({ params }: IdeaDetailPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await ideasApi.getById(id);
        if (response.success && response.data) {
          setIdea(response.data);
        } else {
          throw new Error(response.error || "Failed to fetch idea");
        }
      } catch (error) {
        console.error("Error fetching idea:", error);
        toast.error("Failed to load idea");
        router.push("/ideas");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchIdea();
    }
  }, [id, router]);

  const handleDelete = async () => {
    try {
      const response = await ideasApi.delete(id);
      if (response.success) {
        toast.success("Idea deleted successfully");
        // Redirect to dashboard after deletion
        router.push("/dashboard");
        router.refresh();
      } else {
        console.error("Failed to delete idea:", response.error);
        toast.error(response.error || "Failed to delete idea");
      }
    } catch (error) {
      console.error("Error deleting idea:", error);
      toast.error("Failed to delete idea");
    }
  };

  if (loading || !idea) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/ideas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="h-8 w-64 bg-muted rounded"></div>
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-muted rounded"></div>
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
              <div className="flex flex-wrap gap-2 mt-6">
                <div className="h-6 w-16 bg-muted rounded"></div>
                <div className="h-6 w-20 bg-muted rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ideas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Idea Details</h1>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <h2 className="text-2xl font-bold tracking-tight">{idea.title}</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/ideas/${idea.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StageBadge stage={idea.stage} />
            <PriorityBadge priority={idea.priority} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {idea.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notes
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{idea.notes}</p>
              </div>
            )}

            {idea.tags && idea.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Created</h4>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(idea.created_at), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Last Updated</h4>
                <p className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(idea.updated_at), "MMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onDelete={handleDelete}
        itemName={idea.title}
      />
    </div>
  );
}