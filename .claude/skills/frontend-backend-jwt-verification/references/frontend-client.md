# Frontend API Client

## Creating Authenticated API Client

### Basic Fetch Wrapper

```typescript
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: Record<string, unknown>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async getToken(): Promise<string | null> {
    const session = await auth.api.getSession();
    return session?.token || null;
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const token = await this.getToken();

    if (!token) {
      throw new Error("Authentication required");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    if (options.body) {
      options.body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token expired or invalid
      await auth.signOut();
      window.location.href = "/sign-in";
      throw new Error("Session expired");
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    // Handle empty responses
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  post<T>(endpoint: string, body: Record<string, unknown>) {
    return this.request<T>(endpoint, { method: "POST", body });
  }

  put<T>(endpoint: string, body: Record<string, unknown>) {
    return this.request<T>(endpoint, { method: "PUT", body });
  }

  patch<T>(endpoint: string, body: Record<string, unknown>) {
    return this.request<T>(endpoint, { method: "PATCH", body });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient(API_BASE_URL);
```

### Usage

```typescript
// Fetch data
const tasks = await api.get<Task[]>("/api/tasks");

// Create data
const newTask = await api.post<Task>("/api/tasks", {
  title: "New Task",
  description: "Task description",
});

// Update data
const updatedTask = await api.put<Task>(`/api/tasks/${taskId}`, {
  title: "Updated Title",
});

// Delete
await api.delete(`/api/tasks/${taskId}`);
```

## Better Auth Client Plugin

### Setup

```typescript
// auth-client.ts
import { createAuthClient } from "better-auth/client";
import { bearerClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [bearerClient()],
});
```

### Generate Bearer Token

```typescript
// Generate access token
const { data, error } = await authClient.bearer.generate();

if (data) {
  console.log("Access Token:", data.accessToken);
  console.log("Refresh Token:", data.refreshToken);
}
```

### Verify Token Server-Side

```typescript
import { auth } from "@/auth";
import { serverClient } from "@/lib/server-client";

export async function verifyToken(token: string) {
  try {
    const payload = await serverClient.verifyAccessToken(token, {
      verifyOptions: {
        audience: "https://api.your-domain.com",
      },
    });
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
```

## React Query Integration

### API Hooks

```typescript
// hooks/useApi.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: () => api.get<Task[]>("/api/tasks"),
  });
}

export function useTask(taskId: string) {
  return useQuery({
    queryKey: ["tasks", taskId],
    queryFn: () => api.get<Task>(`/api/tasks/${taskId}`),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: TaskCreate) =>
      api.post<Task>("/api/tasks", task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...task }: Task & { id: string }) =>
      api.put<Task>(`/api/tasks/${id}`, task),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.setQueryData(["tasks", updatedTask.id], updatedTask);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
```

### Usage in Components

```typescript
// components/TaskList.tsx
"use client";

import { useTasks, useDeleteTask } from "@/hooks/useApi";

export function TaskList() {
  const { data: tasks, isLoading, error } = useTasks();
  const deleteTask = useDeleteTask();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>
          <span>{task.title}</span>
          <button onClick={() => deleteTask.mutate(task.id)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## Axios Alternative

```typescript
// lib/axios.ts
import axios from "axios";
import { auth } from "@/auth";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Request interceptor to add token
api.interceptors.request.use(async (config) => {
  const session = await auth.api.getSession();

  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }

  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await auth.signOut();
      window.location.href = "/sign-in";
    }
    return Promise.reject(error);
  }
);

export default api;
```

## Error Handling

```typescript
// lib/api-error.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function handleApiError(error: unknown): Promise<ApiError> {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError("Unknown error occurred", 500);
}

// Usage
try {
  const tasks = await api.get<Task[]>("/api/tasks");
} catch (error) {
  const apiError = await handleApiError(error);

  if (apiError.statusCode === 401) {
    // Redirect to login
    router.push("/sign-in");
  } else {
    // Show error message
    toast.error(apiError.message);
  }
}
```

## TypeScript Types

```typescript
// types/api.ts
export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}
```
