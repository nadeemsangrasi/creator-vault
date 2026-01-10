import { authClient } from "@/lib/auth-client";

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      // Get the current session to include the JWT token
      // Better Auth doesn't provide access tokens directly, so we need to get one from our API
      let token = null;
      const sessionResponse = await fetch('/api/auth/token', {
        method: 'POST',
        credentials: 'include', // Include session cookies
      });

      if (sessionResponse.ok) {
        const tokenData = await sessionResponse.json();
        token = tokenData.access_token;
      } else {
        console.error('Error getting API token:', sessionResponse.status);
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Return 401 error without redirecting here - let caller handle it
      if (response.status === 401) {
        return {
          error: "Unauthorized. Please sign in again.",
          success: false,
        };
      }

      if (response.status >= 500 && retries > 0) {
        // Retry for 5xx errors
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.request<T>(endpoint, options, retries - 1);
      }

      if (!response.ok) {
        const errorData = await response.text();
        return {
          error: errorData || `HTTP error! status: ${response.status}`,
          success: false,
        };
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error: any) {
      if (error.name === "AbortError") {
        return {
          error: "Request timed out",
          success: false,
        };
      }

      return {
        error: error.message || "Network error occurred",
        success: false,
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();