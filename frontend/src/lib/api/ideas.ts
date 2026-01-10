import { apiClient, ApiResponse } from "./client";
import { Idea } from "@/types/idea";
import { authClient } from "@/lib/auth-client";

export interface CreateIdeaData {
  title: string;
  notes?: string; // Changed from description to match backend
  stage: "idea" | "outline" | "draft" | "published";
  priority: "low" | "medium" | "high";
  tags?: string[];
  due_date?: string; // Added due_date field
}

export interface UpdateIdeaData extends Partial<CreateIdeaData> {}

// Define the response structure for paginated idea lists
interface IdeaListResponse {
  items: Idea[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export const ideasApi = {
  async getAll(): Promise<ApiResponse<Idea[]>> {
    try {
      const { data: session } = await authClient.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return { error: "User not authenticated", success: false };
      }

      // Get the paginated response and extract the items array
      const response = await apiClient.get<IdeaListResponse>(`/api/v1/${userId}/ideas`);

      // If successful and we have a response with items, return the items array
      if (response.success && response.data) {
        // Check if it's a paginated response with items, otherwise use data directly
        if ('items' in response.data) {
          return { data: (response.data as IdeaListResponse).items, success: true };
        } else {
          // Fallback: if data is already an array, return it
          return { data: response.data as unknown as Idea[], success: true };
        }
      }

      return {
        success: false,
        error: response.error || "Failed to fetch ideas",
      };
    } catch (error) {
      return { error: "Failed to get user session", success: false };
    }
  },

  async getById(id: string): Promise<ApiResponse<Idea>> {
    try {
      const { data: session } = await authClient.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return { error: "User not authenticated", success: false };
      }

      return apiClient.get<Idea>(`/api/v1/${userId}/ideas/${id}`);
    } catch (error) {
      return { error: "Failed to get user session", success: false };
    }
  },

  async create(data: CreateIdeaData): Promise<ApiResponse<Idea>> {
    try {
      const { data: session } = await authClient.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return { error: "User not authenticated", success: false };
      }

      return apiClient.post<Idea>(`/api/v1/${userId}/ideas`, data);
    } catch (error) {
      return { error: "Failed to get user session", success: false };
    }
  },

  async update(id: string, data: UpdateIdeaData): Promise<ApiResponse<Idea>> {
    try {
      const { data: session } = await authClient.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return { error: "User not authenticated", success: false };
      }

      return apiClient.put<Idea>(`/api/v1/${userId}/ideas/${id}`, data);
    } catch (error) {
      return { error: "Failed to get user session", success: false };
    }
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: session } = await authClient.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return { error: "User not authenticated", success: false };
      }

      return apiClient.delete(`/api/v1/${userId}/ideas/${id}`);
    } catch (error) {
      return { error: "Failed to get user session", success: false };
    }
  },
};
