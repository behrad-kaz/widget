// lib/utils/validation.ts
import { z } from 'zod';

export const phoneSchema = z
  .string()
  .regex(/^09[0-9]{9}$/, 'شماره همراه باید با 09 شروع شود و 11 رقم باشد');

export const nameSchema = z
  .string()
  .min(2, 'نام باید حداقل ۲ کاراکتر باشد')
  .max(100, 'نام حداکثر ۱۰۰ کاراکتر می‌تواند باشد')
  .optional();

export const widgetFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  subjectId: z.string().min(1, 'لطفاً موضوع گفتگو را انتخاب کنید'),
  description: z.string().optional(),
});

export type WidgetFormData = z.infer<typeof widgetFormSchema>;