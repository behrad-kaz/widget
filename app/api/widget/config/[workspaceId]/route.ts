// app/api/widget/config/[workspaceId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const DEMO_CONFIG = {
  workspaceId: 'demo-workspace',
  primaryColor: '#14b8a6',
  position: 'bottom-right' as const,
  buttonStyle: 'circle' as const,
  buttonSize: 'medium' as const,
  buttonText: 'گفتگو با پشتیبانی',
  showLogo: true,
  showChatIcon: true,
  companyName: 'آژانس مسافرتی سفر آسان',
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
};

export async function GET(
  request: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const { workspaceId } = await params;

    // در حالت واقعی، از دیتابیس بخوانید
    // const config = await getWidgetConfig(workspaceId);

    // برای دمو، تنظیمات پیش‌فرض را برمی‌گردانیم
    return NextResponse.json({
      ...DEMO_CONFIG,
      workspaceId,
    });
  } catch (error) {
    console.error('Error fetching widget config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widget config' },
      { status: 500 }
    );
  }
}