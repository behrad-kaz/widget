// components/widget/WidgetForm/WidgetForm.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Send, Loader2, CheckCircle, AlertCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { widgetFormSchema, type WidgetFormData } from '@/lib/utils/validation';
import type { WidgetConfig, WidgetState } from '@/lib/types/widget';
import { getConversationService } from '@/services/conversation.service';

interface WidgetFormProps {
  config: WidgetConfig;
  state: WidgetState;
  onSubmit: (data: WidgetFormData) => void;
  onClose: () => void;
  className?: string;
  apiBaseUrl?: string;
}

export function WidgetForm({
  config,
  state,
  onSubmit,
  onClose,
  className,
  apiBaseUrl = 'http://localhost:3000',
}: WidgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<WidgetFormData>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      subjectId: '',
      description: '',
    },
  });

  const primaryColor = config.primaryColor || '#14b8a6';
  const companyName = config.companyName || 'پشتیبان‌یار';
  const companyLogo = config.companyLogo;
  const formTitle = config.formTitle || 'چطور می‌تونیم کمکتون کنیم؟';
  const formDescription = config.formDescription || 'بخش مورد نظرتون را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.';

  const onFormSubmit = async (data: WidgetFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('📤 ارسال فرم به API...', data);

      const conversationService = getConversationService(apiBaseUrl);

      const result = await conversationService.startConversation({
        workspaceId: config.workspaceId,
        name: data.name, // ✅ ارسال نام
        phone: data.phone,
        subjectId: data.subjectId,
        description: data.description,
      });

      if (result.success && result.conversationId) {
        if (result.customerToken) {
          localStorage.setItem('customerToken', result.customerToken);
          localStorage.setItem('customerId', result.conversationId);
        }

        onSubmit({
          ...data,
          conversationId: result.conversationId,
        });
      } else {
        setSubmitError(result.error || 'خطا در شروع گفتگو');
        setError('root', { message: result.error || 'خطا در شروع گفتگو' });
      }
    } catch (error) {
      console.error('❌ خطا در ارسال فرم:', error);
      setSubmitError(error instanceof Error ? error.message : 'خطا در ارسال درخواست');
      setError('root', { message: error instanceof Error ? error.message : 'خطا در ارسال درخواست' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = state === 'sending' || isSubmitting;
  const isSuccess = state === 'success';
  const isError = state === 'error' || !!submitError;

  return (
    <motion.div
      className={cn('widget-card', className)}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div 
        className="widget-header p-5 text-white relative"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            {config.showLogo && (
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                {companyLogo ? (
                  <img
                    src={companyLogo}
                    alt={companyName}
                    className="w-6 h-6 object-contain"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                    {companyName.charAt(0)}
                  </div>
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base truncate">
                {companyName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mt-2">
          <h4 className="font-bold text-lg">{formTitle}</h4>
          <p className="text-sm opacity-90 mt-1">{formDescription}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="p-5 space-y-4">
        {isSuccess ? (
          <motion.div
            className="text-center py-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <p className="text-gray-900 font-medium mb-2">
              {config.successMessage || 'لینک گفتگو برای شما پیامک شد.'}
            </p>
            <p className="text-sm text-gray-500">
              لطفاً صندوق پیامک خود را بررسی کنید.
            </p>
          </motion.div>
        ) : isError ? (
          <motion.div
            className="text-center py-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-gray-900 font-medium mb-2">
              {submitError || config.invalidPhoneMessage || 'خطا در ارسال درخواست'}
            </p>
            <p className="text-sm text-gray-500">لطفاً دوباره تلاش کنید.</p>
          </motion.div>
        ) : (
          <>
            {/* ✅ فیلد نام و نام خانوادگی - جدید */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                نام و نام خانوادگی
                <span className="text-red-500 mr-1">*</span>
              </label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name')}
                  placeholder="مثال: علی محمدی"
                  disabled={isLoading}
                  className={cn(
                    'widget-input pr-12',
                    errors.name && 'border-red-500 focus:ring-red-500/30'
                  )}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* ✅ نمایش انتخاب دپارتمان */}
            {config.showSubjectField && config.topics && config.topics.length > 0 && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  دپارتمان
                  <span className="text-red-500 mr-1">*</span>
                </label>
                <select
                  {...register('subjectId')}
                  disabled={isLoading}
                  className={cn(
                    'widget-select',
                    errors.subjectId && 'border-red-500 focus:ring-red-500/30'
                  )}
                >
                  <option value="">انتخاب کنید</option>
                  {config.topics
                    .filter((t) => t.isActive)
                    .map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.title}
                      </option>
                    ))}
                </select>
                {errors.subjectId && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.subjectId.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">
                شماره همراه
                <span className="text-red-500 mr-1">*</span>
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder={config.phonePlaceholder || 'شماره همراه خود را وارد کنید'}
                disabled={isLoading}
                dir="ltr"
                className={cn(
                  'widget-input',
                  errors.phone && 'border-red-500 focus:ring-red-500/30'
                )}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {config.showDescriptionField && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-700">
                  توضیحات
                  {config.descriptionRequired && (
                    <span className="text-red-500 mr-1">*</span>
                  )}
                </label>
                <textarea
                  {...register('description')}
                  placeholder={config.descriptionPlaceholder || 'توضیحات بیشتر، اختیاری'}
                  rows={3}
                  disabled={isLoading}
                  className="widget-input resize-none min-h-[80px]"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="widget-button-primary w-full py-3 rounded-xl text-sm font-medium text-white transition-all duration-300 hover:opacity-90 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{config.sendingMessage || 'در حال ارسال...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{config.submitButtonText || 'شروع گفتگو'}</span>
                </>
              )}
            </button>

            {config.showPrivacyText && (
              <p className="text-xs text-gray-500 text-center leading-relaxed">
                {config.privacyText || 'با ثبت شماره، لینک گفتگو از طریق پیامک برای شما ارسال می‌شود.'}
              </p>
            )}
          </>
        )}
      </form>
    </motion.div>
  );
}