// ============================================================
// FILE: hooks/useWidget.ts
// ============================================================
'use client';

import { useState, useEffect } from 'react';
import type { WidgetConfig } from '@/lib/types/widget';
import { API_BASE_URL, IS_DEBUG, SHOW_CONFIG_IN_CONSOLE, DEFAULT_WORKSPACE_ID } from '@/lib/utils/constants';

const getPublicHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

const mapApiResponseToConfig = (data: any): WidgetConfig => {
  if (IS_DEBUG && SHOW_CONFIG_IN_CONSOLE) {
    console.log('🔄 نگاشت داده‌های API:', data);
  }
  
  return {
    workspaceId: String(data.workspaceId || data.id || ''),
    primaryColor: data.primaryColor || '#14b8a6',
    position: data.buttonPosition || 'bottom-right',
    buttonStyle: 'circle',
    buttonSize: data.buttonSize || 'md',
    buttonText: data.submitButtonText || 'گفتگو با پشتیبانی',
    companyName: data.companyName || 'پشتیبان‌یار',
    companyLogo: data.logoUrl || null,
    showLogo: true,
    showChatIcon: true,
    topics: (data.departments || []).map((dept: any) => ({
      id: String(dept.id),
      title: dept.name,
      description: dept.description || '',
      departmentId: String(dept.id),
      isActive: dept.isActive !== undefined ? dept.isActive : true,
    })),
    showDescriptionField: data.showDescriptionField !== undefined ? data.showDescriptionField : true,
    descriptionRequired: data.descriptionRequired || false,
    showSubjectField: data.showDepartmentSelect !== undefined ? data.showDepartmentSelect : true,
    showPrivacyText: true,
    phonePlaceholder: data.phonePlaceholder || 'شماره همراه خود را وارد کنید',
    descriptionPlaceholder: 'توضیحات بیشتر، اختیاری',
    successMessage: data.successMessage || 'لینک گفتگو برای شما پیامک شد.',
    invalidPhoneMessage: 'شماره همراه وارد شده معتبر نیست.',
    requiredFieldsMessage: 'لطفاً تمام فیلدهای الزامی را پر کنید.',
    sendingMessage: 'در حال ارسال لینک گفتگو...',
    privacyText: data.privacyText || 'با ثبت شماره، لینک گفتگو از طریق پیامک برای شما ارسال می‌شود.',
    widgetToken: data.widgetToken || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    formTitle: data.formTitle || 'چطور می‌تونیم کمکتون کنیم؟',
    formDescription: data.formDescription || 'بخش مورد نظرتون را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.',
    submitButtonText: data.submitButtonText || 'شروع گفتگو',
  };
};

export function useWidgetConfig(apiBaseUrl: string = API_BASE_URL) {
  const [config, setConfig] = useState<WidgetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadConfig() {
      try {
        setIsLoading(true);
        setError(null);
        
        // ✅ ابتدا بدون workspaceId درخواست بده تا بک‌اند workspace پیش‌فرض را برگرداند
        const url = `${apiBaseUrl}/widget/current`;
        
        if (IS_DEBUG) {
          console.log('📡 شروع بارگذاری تنظیمات ویجت از:', url);
        }

        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: getPublicHeaders(),
          });
          
          if (IS_DEBUG) {
            console.log(`📡 وضعیت پاسخ: ${response.status} ${response.statusText}`);
          }
          
          if (response.ok) {
            const data = await response.json();
            if (IS_DEBUG && SHOW_CONFIG_IN_CONSOLE) {
              console.log('✅ تنظیمات ویجت از API دریافت شد:', data);
            }
            
            // ✅ ذخیره workspaceId واقعی در localStorage برای استفاده بعدی
            if (data.workspaceId) {
              localStorage.setItem('workspaceId', String(data.workspaceId));
              if (IS_DEBUG) {
                console.log(`💾 workspaceId ${data.workspaceId} ذخیره شد`);
              }
            }
            
            const mappedConfig = mapApiResponseToConfig(data);
            if (IS_DEBUG && SHOW_CONFIG_IN_CONSOLE) {
              console.log('✅ تنظیمات نگاشت شده:', mappedConfig);
            }
            
            setConfig(mappedConfig);
            setError(null);
            setIsLoading(false);
            return;
          } else {
            if (response.status === 404) {
              console.warn('⚠️ Workspace یافت نشد، استفاده از دیتای پیش‌فرض...');
            } else if (response.status === 401) {
              console.warn('⚠️ مسیر نیاز به احراز هویت دارد، استفاده از دیتای پیش‌فرض...');
            } else {
              console.warn(`⚠️ دریافت از API با خطا مواجه شد: ${response.status}`);
              const errorText = await response.text();
              console.warn('📋 متن خطا:', errorText);
            }
          }
        } catch (apiError) {
          console.warn('⚠️ خطا در ارتباط با API:', apiError);
        }

        // ✅ استفاده از دیتای پیش‌فرض
        console.log('📦 استفاده از دیتای پیش‌فرض ویجت');
        const defaultConfig: WidgetConfig = {
          workspaceId: DEFAULT_WORKSPACE_ID,
          primaryColor: '#14b8a6',
          position: 'bottom-right',
          buttonStyle: 'circle',
          buttonSize: 'md',
          buttonText: 'گفتگو با پشتیبانی',
          showLogo: true,
          showChatIcon: true,
          companyName: 'پشتیبان‌یار',
          companyLogo: null,
          topics: [
            { id: 'dept-1', title: 'پشتیبانی', description: '', departmentId: 'dept-1', isActive: true },
            { id: 'dept-2', title: 'فروش', description: '', departmentId: 'dept-2', isActive: true },
            { id: 'dept-3', title: 'مالی', description: '', departmentId: 'dept-3', isActive: true },
          ],
          showDescriptionField: true,
          descriptionRequired: false,
          showSubjectField: true,
          showPrivacyText: true,
          phonePlaceholder: 'شماره همراه خود را وارد کنید',
          descriptionPlaceholder: 'توضیحات بیشتر، اختیاری',
          successMessage: 'لینک گفتگو برای شما پیامک شد.',
          invalidPhoneMessage: 'شماره همراه وارد شده معتبر نیست.',
          requiredFieldsMessage: 'لطفاً تمام فیلدهای الزامی را پر کنید.',
          sendingMessage: 'در حال ارسال لینک گفتگو...',
          privacyText: 'با ثبت شماره، لینک گفتگو از طریق پیامک برای شما ارسال می‌شود.',
          widgetToken: '',
          isActive: true,
          formTitle: 'چطور می‌تونیم کمکتون کنیم؟',
          formDescription: 'بخش مورد نظرتون را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.',
          submitButtonText: 'شروع گفتگو',
        };
        
        setConfig(defaultConfig);
        setError(null);
        
      } catch (err) {
        console.error('❌ خطا در بارگذاری تنظیمات ویجت:', err);
        setError('خطا در بارگذاری تنظیمات ویجت');
      } finally {
        setIsLoading(false);
      }
    }

    loadConfig();
  }, [apiBaseUrl]);

  return { config, isLoading, error };
}
// ============================================================