// ============================================================
// FILE: lib/types/widget.ts
// ============================================================

export interface WidgetConfig {
  workspaceId: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  buttonStyle: 'circle' | 'capsule';
  buttonSize: 'sm' | 'md' | 'lg';
  buttonText: string;
  showLogo: boolean;
  showChatIcon: boolean;
  companyName: string;
  companyLogo?: string | null;
  topics: Topic[];
  showDescriptionField: boolean;
  descriptionRequired: boolean;
  showSubjectField: boolean;
  showPrivacyText: boolean;
  phonePlaceholder: string;
  descriptionPlaceholder: string;
  successMessage: string;
  invalidPhoneMessage: string;
  requiredFieldsMessage: string;
  sendingMessage: string;
  privacyText: string;
  widgetToken?: string;
  isActive?: boolean;
  formTitle?: string;
  formDescription?: string;
  submitButtonText?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  departmentId: string;
  isActive: boolean;
}

export interface Message {
  id: string;
  text: string;
  sender: 'customer' | 'support';
  timestamp: Date;
  isInternal?: boolean;
  senderName?: string;
  fileUrl?: string;
  fileType?: 'image' | 'document' | 'video' | 'audio';
  fileName?: string;
}

export interface Conversation {
  id: string;
  customerName?: string;
  customerPhone: string;
  subject: string;
  status: 'open' | 'waiting' | 'answered' | 'closed';
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export type WidgetState = 'closed' | 'form' | 'sending' | 'success' | 'error' | 'chat';
// ============================================================