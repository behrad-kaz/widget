// components/shared/Loader/Loader.tsx
'use client';

import { cn } from '@/lib/utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Loader({ size = 'md', className }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-primary/20 border-t-primary animate-spin',
        sizeClasses[size],
        className
      )}
    />
  );
}