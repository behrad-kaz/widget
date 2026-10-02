// components/widget/WidgetButton/WidgetButton.tsx
'use client';

import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { WidgetConfig } from '@/lib/types/widget';

interface WidgetButtonProps {
  config: WidgetConfig;
  onClick: () => void;
  className?: string;
}

export function WidgetButton({
  config,
  onClick,
  className,
}: WidgetButtonProps) {
  const isCircle = config.buttonStyle === 'circle';
  
  // ✅ محاسبه اندازه بر اساس buttonSize
  const getSize = () => {
    switch (config.buttonSize) {
      case 'sm': return 48; // کوچک
      case 'lg': return 72; // بزرگ
      default: return 56; // متوسط
    }
  };
  
  const size = getSize();
  
  // ✅ رنگ اصلی از config
  const primaryColor = config.primaryColor || '#14b8a6';

  console.log('🎨 WidgetButton渲染:', {
    primaryColor,
    buttonSize: config.buttonSize,
    size,
    isCircle,
    buttonText: config.buttonText,
  });

  return (
    <div className="relative">
      <motion.button
        onClick={onClick}
        className={cn(
          'widget-button flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300',
          isCircle ? 'rounded-full' : 'rounded-2xl',
          className
        )}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: primaryColor,
          color: 'white',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <MessageCircle className="w-6 h-6" strokeWidth={1.8} />
        {!isCircle && (
          <span className="text-sm font-medium mr-2 whitespace-nowrap">
            {config.buttonText || 'گفتگو با پشتیبانی'}
          </span>
        )}
      </motion.button>

      {isCircle && (
        <div 
          className="absolute inset-0 rounded-full -z-10 animate-pulse-ring" 
          style={{ backgroundColor: primaryColor + '40' }}
        />
      )}
    </div>
  );
}