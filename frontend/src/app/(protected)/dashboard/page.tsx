"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Lightbulb, FileText, PenTool, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types/idea";
import { StatsCard } from "@/components/dashboard/stats-card";
import { RecentIdeas } from "@/components/dashboard/recent-ideas";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ideas: 0,
    outlines: 0,
    drafts: 0,
    published: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await ideasApi.getAll();
        if (response.success) {
          const fetchedIdeas = response.data || [];
          setIdeas(fetchedIdeas);

          // Calculate stats
          const total = fetchedIdeas.length;
          const ideasCount = fetchedIdeas.filter(idea => idea.stage === "idea").length;
          const outlinesCount = fetchedIdeas.filter(idea => idea.stage === "outline").length;
          const draftsCount = fetchedIdeas.filter(idea => idea.stage === "draft").length;
          const publishedCount = fetchedIdeas.filter(idea => idea.stage === "published").length;

          setStats({
            total,
            ideas: ideasCount,
            outlines: outlinesCount,
            drafts: draftsCount,
            published: publishedCount,
          });
        } else {
          throw new Error(response.error || "Failed to fetch ideas");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              {[...Array(3)].map((_, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4 last:mb-0">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                  <div className="flex gap-2 mt-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6 mt-2" />
              <Skeleton className="h-4 w-4/6 mt-2" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Creator"}
          </p>
        </div>
        <Button asChild>
          <Link href="/ideas/new">
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Ideas"
          value={stats.total}
          icon={Lightbulb}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Ideas"
          value={stats.ideas}
          icon={Lightbulb}
          iconColor="text-yellow-500"
        />
        <StatsCard
          title="Drafts"
          value={stats.drafts}
          icon={PenTool}
          iconColor="text-orange-500"
        />
        <StatsCard
          title="Published"
          value={stats.published}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentIdeas ideas={ideas} />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/ideas/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Idea
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/ideas">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Ideas
                </Link>
              </Button>
              {ideas.length === 0 && (
                <div className="mt-6 text-center text-muted-foreground">
                  <p>No ideas yet</p>
                  <p className="text-sm mt-1">Start by creating your first idea</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
