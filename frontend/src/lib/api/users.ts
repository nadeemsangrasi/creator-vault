import { apiClient, ApiResponse } from "./client";

export interface User {
  user_id: string; // Changed to match backend
  authenticated: boolean;
}

export const usersApi = {
  getProfile(): Promise<ApiResponse<User>> {
    return apiClient.get<User>("/api/v1/users/me"); // Changed to match backend
  },
};
