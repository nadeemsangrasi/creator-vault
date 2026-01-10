"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types/idea";
import { useEffect, useState, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { IdeaFilters } from "@/components/ideas/idea-filters";
import { IdeaCard } from "@/components/ideas/idea-card";
import { useSearchParams, useRouter } from "next/navigation";
import { useMemo } from "react";

function IdeasContent() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters
  const [stage, setStage] = useState(searchParams.get("stage") || "all");
  const [priority, setPriority] = useState(searchParams.get("priority") || "all");
  const [tags, setTags] = useState<string[]>(() => {
    const tagsParam = searchParams.get("tags");
    return tagsParam ? tagsParam.split(",") : [];
  });
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await ideasApi.getAll();
        if (response.success) {
          setIdeas(response.data || []);
        } else {
          throw new Error(response.error || "Failed to fetch ideas");
        }
      } catch (error) {
        console.error("Error fetching ideas:", error);
        toast.error("Failed to load ideas");
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  // Extract all unique tags from ideas
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    ideas.forEach(idea => {
      idea.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [ideas]);

  // Apply filters to ideas
  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      // Stage filter
      if (stage !== "all" && idea.stage !== stage) {
        return false;
      }

      // Priority filter
      if (priority !== "all" && idea.priority !== priority) {
        return false;
      }

      // Tags filter
      if (tags.length > 0 && !tags.every(tag => idea.tags.includes(tag))) {
        return false;
      }

      // Search filter
      if (
        searchQuery &&
        !idea.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !idea.notes?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [ideas, stage, priority, tags, searchQuery]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (stage !== "all") params.set("stage", stage);
    if (priority !== "all") params.set("priority", priority);
    if (tags.length > 0) params.set("tags", tags.join(","));
    if (searchQuery) params.set("q", searchQuery);

    const queryString = params.toString();
    const newPath = queryString ? `?${queryString}` : "";

    router.push(`/ideas${newPath}`, { scroll: false });
  }, [stage, priority, tags, searchQuery, router]);

  const hasActiveFilters = stage !== "all" || priority !== "all" || tags.length > 0 || !!searchQuery;

  const handleClearFilters = () => {
    setStage("all");
    setPriority("all");
    setTags([]);
    setSearchQuery("");
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4">
          <Skeleton className="h-20 w-full" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="h-full">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-2" />
                <div className="flex flex-wrap gap-1 mt-3">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ideas Vault</h1>
          <p className="text-muted-foreground">
            Manage and organize your content ideas
          </p>
        </div>
        <Button asChild>
          <Link href="/ideas/new">
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      <IdeaFilters
        stage={stage}
        priority={priority}
        tags={tags}
        searchQuery={searchQuery}
        allTags={allTags}
        onStageChange={setStage}
        onPriorityChange={setPriority}
        onTagsChange={setTags}
        onSearchChange={setSearchQuery}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {filteredIdeas.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="flex flex-col h-full border-dashed shadow-none bg-muted/30">
            <CardHeader className="flex-1 flex flex-col items-center justify-center text-center p-10">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle className="text-lg">
                {hasActiveFilters ? "No ideas match your filters" : "No ideas found"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                {hasActiveFilters
                  ? "Try adjusting your filters."
                  : "Start by capturing your first idea."}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button asChild variant="outline">
                  <Link href="/ideas/new">Create Idea</Link>
                </Button>
              )}
            </CardHeader>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredIdeas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </div>
  );
}
export default function IdeasPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-6"><Skeleton className="h-8 w-48 mb-8" /><div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div></div>}>
      <IdeasContent />
    </Suspense>
  );
}
