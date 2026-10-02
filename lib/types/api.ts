// lib/types/api.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StartConversationRequest {
  workspaceId: string;
  name?: string; 
  phone: string;
  subjectId: string;
  description?: string;
  subject?: string;
}

export interface StartConversationResponse {
  success: boolean;
  conversationId?: string;
  customerToken?: string;
  customerId?: number;
  isExisting?: boolean;
  message?: string;
  error?: string;
}