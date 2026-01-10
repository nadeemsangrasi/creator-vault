"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ideasApi } from "@/lib/api/ideas";
import { Idea } from "@/types/idea";

const ideaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  notes: z.string().optional(),
  stage: z.enum(["idea", "outline", "draft", "published"]),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.string().optional(), // Comma separated
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

interface EditIdeaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditIdeaPage({ params }: EditIdeaPageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [currentTag, setCurrentTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const handleAddTag = () => {
    if (currentTag.trim() !== '' && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: "",
      notes: "",
      stage: "idea",
      priority: "medium",
      tags: ""
    }
  });

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await ideasApi.getById(id);
        if (response.success && response.data) {
          setIdea(response.data);
          const ideaTags = response.data.tags || [];
          setTags(ideaTags);
          form.reset({
            title: response.data.title,
            notes: response.data.notes || "",
            stage: response.data.stage,
            priority: response.data.priority,
            tags: ideaTags.join(", "), // Keep for form compatibility
          });
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
  }, [id, form, router]);

  const onSubmit = async (values: IdeaFormValues) => {
    if (!idea) return;

    setLoading(true);
    try {
      const response = await ideasApi.update(id, {
        title: values.title,
        notes: values.notes,
        stage: values.stage,
        priority: values.priority,
        tags: tags, // Use the tags state instead of parsing from form field
      });

      if (response.success) {
        toast.success("Idea updated successfully");
        router.push(`/ideas/${id}`);
        router.refresh();
      } else {
        throw new Error(response.error || "Failed to update idea");
      }
    } catch (error) {
      console.error("Error updating idea:", error);
      toast.error("Failed to update idea");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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
            <CardTitle>Loading Idea...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/ideas/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Idea</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Idea</CardTitle>
          <CardDescription>
            Update your idea details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What's your idea?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add some details..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="stage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stage</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="idea">Idea</SelectItem>
                          <SelectItem value="outline">Outline</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter a tag"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={handleAddTag}>Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <div key={index} className="flex items-center bg-secondary px-2 py-1 rounded">
                          <span>{tag}</span>
                          <button
                            type="button"
                            className="ml-2 text-destructive hover:text-destructive/80"
                            onClick={() => handleRemoveTag(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="hidden"
                      value={tags.join(',')}
                      onChange={() => {}} // Read-only for react-hook-form
                      {...field}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href={`/ideas/${id}`}>Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}