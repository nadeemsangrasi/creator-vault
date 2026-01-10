// frontend/src/types/idea.ts

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  notes?: string; // Changed from description to match backend
  stage: "idea" | "outline" | "draft" | "published";
  priority: "low" | "medium" | "high";
  tags: string[];
  due_date?: string; // Added due_date field from backend
  created_at: string;
  updated_at: string;
}