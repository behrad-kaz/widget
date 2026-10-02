// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata: Metadata = {
  title: 'پشتیبان‌یار - ویجت چت پشتیبانی',
  description: 'ویجت چت پشتیبانی آنلاین برای وب‌سایت‌ها',
  applicationName: 'پشتیبان‌یار',
  authors: [{ name: 'پشتیبان‌یار' }],
  keywords: ['چت', 'پشتیبانی', 'ویجت', 'گفتگو'],
  creator: 'پشتیبان‌یار',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}