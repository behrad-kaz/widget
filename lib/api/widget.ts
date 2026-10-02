// ============================================================
// FILE: lib/api/widget.ts
// ============================================================
import { createApiClient } from './client';
import type { WidgetConfig } from '@/lib/types/widget';

export const widgetApi = (baseURL: string) => {
  const client = createApiClient(baseURL);

  return {
    getConfig: (workspaceId: string) =>
      client.get<WidgetConfig>(`/widget/config/${workspaceId}`),
  };
};
// ============================================================