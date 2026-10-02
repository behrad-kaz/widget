// ============================================================
// FILE: lib/utils/constants.ts
// ============================================================

// ✅ دریافت از فایل .env با fallback
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
export const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE_URL;

// ✅ تنظیمات دیباگ
export const IS_DEBUG = process.env.NEXT_PUBLIC_DEBUG !== 'false';
export const SHOW_CONFIG_IN_CONSOLE = process.env.NEXT_PUBLIC_SHOW_CONFIG_IN_CONSOLE !== 'false';

// ✅ تنظیمات پیش‌فرض ویجت
export const DEFAULT_WORKSPACE_ID = process.env.NEXT_PUBLIC_DEFAULT_WORKSPACE_ID || '1';
export const DEFAULT_PRIMARY_COLOR = process.env.NEXT_PUBLIC_DEFAULT_PRIMARY_COLOR || '#14b8a6';
export const DEFAULT_BUTTON_POSITION = process.env.NEXT_PUBLIC_DEFAULT_BUTTON_POSITION || 'bottom-right';
export const DEFAULT_BUTTON_SIZE = process.env.NEXT_PUBLIC_DEFAULT_BUTTON_SIZE || 'md';
export const DEFAULT_COMPANY_NAME = process.env.NEXT_PUBLIC_DEFAULT_COMPANY_NAME || 'پشتیبان‌یار';
export const DEFAULT_BUTTON_TEXT = process.env.NEXT_PUBLIC_DEFAULT_BUTTON_TEXT || 'گفتگو با پشتیبانی';

// ✅ تنظیمات فرم
export const DEFAULT_FORM_TITLE = process.env.NEXT_PUBLIC_DEFAULT_FORM_TITLE || 'چطور می‌تونیم کمکتون کنیم؟';
export const DEFAULT_FORM_DESCRIPTION = process.env.NEXT_PUBLIC_DEFAULT_FORM_DESCRIPTION || 'بخش مورد نظرتون را انتخاب کنید تا شما را به تیم مناسب وصل کنیم.';
export const DEFAULT_PHONE_PLACEHOLDER = process.env.NEXT_PUBLIC_DEFAULT_PHONE_PLACEHOLDER || 'شماره همراه خود را وارد کنید';
export const DEFAULT_DESCRIPTION_PLACEHOLDER = process.env.NEXT_PUBLIC_DEFAULT_DESCRIPTION_PLACEHOLDER || 'توضیحات بیشتر، اختیاری';
export const DEFAULT_SUBMIT_BUTTON_TEXT = process.env.NEXT_PUBLIC_DEFAULT_SUBMIT_BUTTON_TEXT || 'شروع گفتگو';
export const DEFAULT_SUCCESS_MESSAGE = process.env.NEXT_PUBLIC_DEFAULT_SUCCESS_MESSAGE || 'لینک گفتگو برای شما پیامک شد.';
export const DEFAULT_PRIVACY_TEXT = process.env.NEXT_PUBLIC_DEFAULT_PRIVACY_TEXT || 'با ثبت شماره، لینک گفتگو از طریق پیامک برای شما ارسال می‌شود.';
export const DEFAULT_INVALID_PHONE_MESSAGE = process.env.NEXT_PUBLIC_DEFAULT_INVALID_PHONE_MESSAGE || 'شماره همراه وارد شده معتبر نیست.';
export const DEFAULT_REQUIRED_FIELDS_MESSAGE = process.env.NEXT_PUBLIC_DEFAULT_REQUIRED_FIELDS_MESSAGE || 'لطفاً تمام فیلدهای الزامی را پر کنید.';
export const DEFAULT_SENDING_MESSAGE = process.env.NEXT_PUBLIC_DEFAULT_SENDING_MESSAGE || 'در حال ارسال لینک گفتگو...';

// ✅ تنظیمات نمایش
export const SHOW_LOGO = process.env.NEXT_PUBLIC_SHOW_LOGO !== 'false';
export const SHOW_CHAT_ICON = process.env.NEXT_PUBLIC_SHOW_CHAT_ICON !== 'false';
export const SHOW_PRIVACY_TEXT = process.env.NEXT_PUBLIC_SHOW_PRIVACY_TEXT !== 'false';
export const SHOW_DESCRIPTION_FIELD = process.env.NEXT_PUBLIC_SHOW_DESCRIPTION_FIELD !== 'false';
export const SHOW_SUBJECT_FIELD = process.env.NEXT_PUBLIC_SHOW_SUBJECT_FIELD !== 'false';
export const WIDGET_ACTIVE_BY_DEFAULT = process.env.NEXT_PUBLIC_WIDGET_ACTIVE_BY_DEFAULT !== 'false';

// ✅ تنظیمات زمان‌بندی
export const REQUEST_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '15000', 10);
export const SOCKET_RECONNECTION_ATTEMPTS = parseInt(process.env.NEXT_PUBLIC_SOCKET_RECONNECTION_ATTEMPTS || '5', 10);
export const SOCKET_RECONNECTION_DELAY = parseInt(process.env.NEXT_PUBLIC_SOCKET_RECONNECTION_DELAY || '1000', 10);

// ✅ تنظیمات ثابت
export const SOCKET_TIMEOUT = 10000;
export const PHONE_REGEX = /^09[0-9]{9}$/;
export const PHONE_ERROR_MESSAGE = 'شماره همراه باید با 09 شروع شود و 11 رقم باشد';

export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  FAILED: 'failed',
} as const;

export const CONVERSATION_STATUS = {
  OPEN: 'open',
  WAITING: 'waiting',
  ANSWERED: 'answered',
  CLOSED: 'closed',
} as const;
// ============================================================