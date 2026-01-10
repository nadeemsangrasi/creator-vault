"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { ideasApi } from "@/lib/api/ideas";

const ideaSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  notes: z.string().optional(),
  stage: z.enum(["idea", "outline", "draft", "published"]),
  priority: z.enum(["low", "medium", "high"]),
  tags: z.string().optional(), // Comma separated
});

type IdeaFormValues = z.infer<typeof ideaSchema>;

export default function NewIdeaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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

  const onSubmit = async (values: IdeaFormValues) => {
    setLoading(true);
    try {
      const response = await ideasApi.create({
        title: values.title,
        notes: values.notes,
        stage: values.stage,
        priority: values.priority,
        tags: tags, // Use the tags state instead of parsing from form field
      });

      if (response.success && response.data) {
        toast.success("Idea created successfully");
        router.push(`/ideas/${response.data.id}`);
        router.refresh();
      } else {
        throw new Error(response.error || "Failed to create idea");
      }
    } catch (error) {
      console.error("Error creating idea:", error);
      toast.error("Failed to create idea");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/ideas">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">New Idea</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Capture Idea</CardTitle>
          <CardDescription>
            Don't let it slip away. You can refine it later.
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
                 render={({ field }) => {
                   const { ref, value: fieldValue, ...fieldWithoutValueAndRef } = field;
                   return (
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
                       ref={ref}
                       {...fieldWithoutValueAndRef}
                       value={tags.join(',')}
                     />
                     <FormMessage />
                   </FormItem>
                   )
                 }}
               />

              <div className="flex justify-end gap-4">
                <Button variant="outline" asChild>
                  <Link href="/ideas">Cancel</Link>
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" />
                  Save Idea
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
