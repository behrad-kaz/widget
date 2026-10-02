// components/shared/Portal/Portal.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

export function Portal({ children, containerId = 'portal-root' }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    
    if (!containerRef.current) {
      let container = document.getElementById(containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
      }
      containerRef.current = container;
    }

    return () => {
      if (containerRef.current && containerRef.current.children.length === 0) {
        containerRef.current.remove();
      }
    };
  }, [containerId]);

  if (!mounted || !containerRef.current) return null;

  return createPortal(children, containerRef.current);
}