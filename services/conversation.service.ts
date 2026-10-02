// services/conversation.service.ts
import { createApiClient } from '@/lib/api/client';
import type {
  StartConversationRequest,
  StartConversationResponse,
} from '@/lib/types/api';

export class ConversationService {
  private client;

  constructor(baseURL: string) {
    this.client = createApiClient(baseURL);
  }

  async startConversation(data: StartConversationRequest): Promise<StartConversationResponse> {
    try {
      console.log('📤 شروع گفتگو با API:', data);
      
      const accessToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const contextToken = typeof window !== 'undefined' ? localStorage.getItem('contextToken') : null;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      if (contextToken) {
        headers['x-context-token'] = contextToken;
      }
      
      // ✅ استفاده از نام وارد شده توسط کاربر یا fallback
      const customerName = data.name?.trim() || `کاربر ${data.phone.slice(-4)}`;
      
      const payload = {
        customerName: customerName,
        customerPhone: data.phone,
        subject: data.subject || 'درخواست پشتیبانی از ویجت',
        teamId: data.subjectId ? parseInt(data.subjectId) : undefined,
        source: 'widget',
        priority: 'normal',
      };
      
      console.log('📤 ارسال به سرور (POST /conversation):', payload);
      
      const response = await fetch(`${this.client.defaults.baseURL}/conversation`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ خطا در شروع گفتگو:', errorText);
        throw new Error(`خطا در شروع گفتگو: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ گفتگو با موفقیت شروع شد:', result);
      
      if (result.customerId) {
        localStorage.setItem('customerId', String(result.customerId));
      }
      
      return {
        success: true,
        conversationId: result.id || result.conversationId,
        customerToken: result.token || result.customerToken,
        customerId: result.customerId,
        isExisting: result.isExisting || false,
        message: result.message || 'گفتگو با موفقیت شروع شد',
      };
    } catch (error) {
      console.error('❌ Error starting conversation:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'خطا در شروع گفتگو',
      };
    }
  }

  async getLastConversation(phone: string): Promise<any> {
    try {
      const response = await fetch(`${this.client.defaults.baseURL}/customer/by-phone/${phone}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        return null;
      }
      
      const customer = await response.json();
      if (customer && customer.lastConversationId) {
        return {
          conversationId: customer.lastConversationId,
          customerId: customer.id,
          customerName: customer.name,
        };
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error fetching last conversation:', error);
      return null;
    }
  }

  async findOrCreateCustomer(phone: string, name?: string): Promise<any> {
    try {
      const response = await fetch(`${this.client.defaults.baseURL}/customer/find-or-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to find or create customer');
      }
      
      return await response.json();
    } catch (error) {
      console.error('❌ Error finding or creating customer:', error);
      throw error;
    }
  }
}

let conversationServiceInstance: ConversationService | null = null;

export const getConversationService = (baseURL: string) => {
  if (!conversationServiceInstance) {
    conversationServiceInstance = new ConversationService(baseURL);
  }
  return conversationServiceInstance;
};