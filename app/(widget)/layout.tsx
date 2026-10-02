// app/(widget)/layout.tsx
'use client';

import { ReactNode } from 'react';

interface WidgetLayoutProps {
  children: ReactNode;
}

export default function WidgetLayout({ children }: WidgetLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {children}
    </div>
  );
}