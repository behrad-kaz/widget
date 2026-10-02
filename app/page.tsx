// ============================================================
// FILE: app/page.tsx
// ============================================================
'use client';

import { useEffect, useState } from 'react';
import { Widget } from '@/components/widget/Widget';
import { useWidgetConfig } from '@/hooks/useWidget';
import { Loader } from '@/components/shared/Loader';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '@/lib/utils/constants'; // ✅ استفاده از constant

export default function HomePage() {
  const { config, isLoading, error } = useWidgetConfig(API_BASE_URL);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">خطا در بارگذاری</h2>
          <p className="text-gray-600 mb-6">
            {error || 'تنظیمات ویجت یافت نشد. لطفاً دوباره تلاش کنید.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            تلاش مجدد
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{config.companyName}</h1>
                <p className="text-sm text-gray-500">ویجت چت پشتیبانی</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                آنلاین
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
            >
              {config.companyName}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600"
            >
              بهترین تورهای داخلی و خارجی با قیمت مناسب
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: '🏛️', title: 'تورهای داخلی', desc: 'بازدید از جاذبه‌های گردشگری ایران' },
              { icon: '✈️', title: 'تورهای خارجی', desc: 'سفر به بهترین مقاصد دنیا' },
              { icon: '🏨', title: 'رزرو هتل', desc: 'رزرو آنلاین هتل با بهترین قیمت' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl"
              >
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <p className="text-gray-600">برای ارتباط با پشتیبانی، روی دکمه سبز رنگ در گوشه صفحه کلیک کنید.</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                <span>🔒</span>
                <span>اطلاعات شما نزد ما محفوظ است</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>⏱️ پاسخگویی سریع</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {config.companyName}. تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>

      <Widget config={config} apiBaseUrl={API_BASE_URL} />
    </div>
  );
}
// ============================================================