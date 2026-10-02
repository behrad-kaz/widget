// components/widget/Widget/Widget.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useWidgetStore } from '@/stores/widget.store';
import { WidgetButton } from '@/components/widget/WidgetButton';
import { WidgetForm } from '@/components/widget/WidgetForm';
import { WidgetChat } from '@/components/widget/WidgetChat';
import { cn } from '@/lib/utils/cn';
import type { WidgetConfig } from '@/lib/types/widget';
import { getConversationService } from '@/services/conversation.service';
import { IS_DEBUG } from '@/lib/utils/constants';

interface WidgetProps {
  config: WidgetConfig;
  apiBaseUrl: string;
}

// کلیدهای ذخیره‌سازی در localStorage
const STORAGE_KEYS = {
  CONVERSATION_ID: 'widget_conversation_id',
  CUSTOMER_TOKEN: 'widget_customer_token',
  CUSTOMER_PHONE: 'widget_customer_phone',
  CUSTOMER_ID: 'widget_customer_id',
  CUSTOMER_SUBJECT: 'widget_customer_subject',
  CUSTOMER_DESCRIPTION: 'widget_customer_description',
  WORKSPACE_ID: 'workspaceId',
};

export function Widget({ config, apiBaseUrl }: WidgetProps) {
  const { state, setState, conversationId, setConversationId, reset } =
    useWidgetStore();
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [workspaceId, setWorkspaceId] = useState<string>(config.workspaceId || '');
  const [isCheckingConversation, setIsCheckingConversation] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // ✅ بررسی وجود گفتگوی قبلی در localStorage
    const savedConversationId = typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID) 
      : null;
    
    // ✅ دریافت workspaceId از localStorage
    const savedWorkspaceId = typeof window !== 'undefined' 
      ? localStorage.getItem(STORAGE_KEYS.WORKSPACE_ID) 
      : null;
    
    if (savedWorkspaceId) {
      setWorkspaceId(savedWorkspaceId);
      if (IS_DEBUG) {
        console.log(`📌 workspaceId از localStorage: ${savedWorkspaceId}`);
      }
    } else if (config.workspaceId) {
      setWorkspaceId(config.workspaceId);
    }

    // ✅ اگر گفتگوی قبلی وجود دارد، مستقیماً به حالت چت برو
    if (savedConversationId) {
      const savedToken = localStorage.getItem(STORAGE_KEYS.CUSTOMER_TOKEN) || '';
      const savedPhone = localStorage.getItem(STORAGE_KEYS.CUSTOMER_PHONE) || '';
      
      if (IS_DEBUG) {
        console.log(`🔄 بازیابی گفتگوی قبلی: ${savedConversationId}`);
        console.log(`📱 شماره مشتری: ${savedPhone}`);
      }
      
      setConversationId(savedConversationId);
      setState('chat');
      
      // ذخیره توکن
      if (savedToken) {
        localStorage.setItem('customerToken', savedToken);
      }
      
      setIsCheckingConversation(false);
    } else {
      // ✅ بررسی آخرین گفتگوی مشتری از دیتابیس
      const savedPhone = typeof window !== 'undefined' 
        ? localStorage.getItem(STORAGE_KEYS.CUSTOMER_PHONE) 
        : null;
      
      if (savedPhone) {
        checkLastConversation(savedPhone);
      } else {
        setIsCheckingConversation(false);
      }
    }
    
    if (config.widgetToken) {
      localStorage.setItem('widgetToken', config.widgetToken);
    }
    
    console.log('📊 Widget تنظیمات دریافت شد:', {
      primaryColor: config.primaryColor,
      position: config.position,
      buttonSize: config.buttonSize,
      companyName: config.companyName,
      isActive: config.isActive,
      workspaceId: workspaceId || config.workspaceId,
      hasSavedConversation: !!savedConversationId,
    });
  }, [config, workspaceId, setConversationId, setState]);

  // ✅ بررسی آخرین گفتگوی مشتری از دیتابیس
  const checkLastConversation = useCallback(async (phone: string) => {
    try {
      console.log(`🔍 بررسی آخرین گفتگوی مشتری با شماره: ${phone}`);
      
      const conversationService = getConversationService(apiBaseUrl);
      const result = await conversationService.getLastConversation(phone);
      
      if (result && result.conversationId) {
        console.log(`✅ گفتگوی قبلی پیدا شد: ${result.conversationId}`);
        
        localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, result.conversationId);
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_ID, String(result.customerId));
        
        setConversationId(result.conversationId);
        setState('chat');
      }
    } catch (error) {
      console.error('❌ خطا در بررسی آخرین گفتگو:', error);
    } finally {
      setIsCheckingConversation(false);
    }
  }, [apiBaseUrl, setConversationId, setState]);

  const handleOpen = useCallback(() => {
    if (!config.isActive) {
      console.warn('⚠️ ویجت غیرفعال است');
      return;
    }
    
    // ✅ بررسی وجود گفتگوی قبلی
    const savedConversationId = localStorage.getItem(STORAGE_KEYS.CONVERSATION_ID);
    if (savedConversationId) {
      setConversationId(savedConversationId);
      setState('chat');
      return;
    }
    
    setState('form');
  }, [config.isActive, setState, setConversationId]);

  const handleClose = useCallback(() => {
    reset();
    setFormData(null);
  }, [reset]);

  const handleFormSubmit = useCallback(async (data: any) => {
    console.log('✅ فرم ارسال شد:', data);
    
    const finalWorkspaceId = workspaceId || config.workspaceId || '1';
    
    // ✅ ذخیره شماره مشتری در localStorage
    localStorage.setItem(STORAGE_KEYS.CUSTOMER_PHONE, data.phone);
    
    if (data.conversationId) {
      // ✅ ذخیره اطلاعات در localStorage
      localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, data.conversationId);
      localStorage.setItem(STORAGE_KEYS.CUSTOMER_SUBJECT, data.subjectId || '');
      if (data.description) {
        localStorage.setItem(STORAGE_KEYS.CUSTOMER_DESCRIPTION, data.description);
      }
      
      setConversationId(data.conversationId);
      setState('chat');
    } else {
      try {
        const conversationService = getConversationService(apiBaseUrl);
        const result = await conversationService.startConversation({
          workspaceId: finalWorkspaceId,
          phone: data.phone,
          subjectId: data.subjectId,
          description: data.description || '',
        });
        
        if (result.success && result.conversationId) {
          // ✅ ذخیره اطلاعات در localStorage
          localStorage.setItem(STORAGE_KEYS.CONVERSATION_ID, result.conversationId);
          localStorage.setItem(STORAGE_KEYS.CUSTOMER_SUBJECT, data.subjectId || '');
          if (data.description) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMER_DESCRIPTION, data.description);
          }
          
          if (result.customerId) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMER_ID, String(result.customerId));
          }
          
          if (result.customerToken) {
            localStorage.setItem(STORAGE_KEYS.CUSTOMER_TOKEN, result.customerToken);
            localStorage.setItem('customerToken', result.customerToken);
          }
          
          setConversationId(result.conversationId);
          setState('chat');
        } else {
          setState('error');
        }
      } catch (error) {
        console.error('❌ خطا در شروع گفتگو:', error);
        setState('error');
      }
    }
  }, [apiBaseUrl, config.workspaceId, workspaceId, setConversationId, setState]);

  // تابع پاک کردن اطلاعات ذخیره شده (برای خروج از گفتگو)
  const clearStoredConversation = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.CONVERSATION_ID);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_PHONE);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_ID);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_SUBJECT);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMER_DESCRIPTION);
    localStorage.removeItem('customerToken');
  }, []);

  if (!isMounted || isCheckingConversation) {
    return null;
  }

  if (!config.isActive) {
    return null;
  }

  const positionClass = config.position === 'bottom-right' ? 'right-6' : 'left-6';

  return (
    <div className={cn('widget-container fixed bottom-6 z-[999999] flex flex-col items-end', positionClass)}>
      <AnimatePresence mode="wait">
        {state === 'closed' && (
          <WidgetButton
            key="button"
            config={config}
            onClick={handleOpen}
            className="animate-bounce-in"
          />
        )}

        {(state === 'form' || state === 'sending' || state === 'error') && (
          <WidgetForm
            key="form"
            config={config}
            state={state}
            onSubmit={handleFormSubmit}
            onClose={handleClose}
            className="animate-slide-up"
            apiBaseUrl={apiBaseUrl}
          />
        )}

        {state === 'chat' && conversationId && (
          <WidgetChat
            key="chat"
            config={config}
            conversationId={conversationId}
            apiBaseUrl={apiBaseUrl}
            onClose={handleClose}
            className="animate-slide-up"
          />
        )}
      </AnimatePresence>
    </div>
  );
}