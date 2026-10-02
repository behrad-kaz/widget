// ============================================================
// FILE: services/widget.service.ts
// ============================================================
import { widgetApi } from '@/lib/api/widget';
import type { WidgetConfig } from '@/lib/types/widget';

export class WidgetService {
  private api: ReturnType<typeof widgetApi>;

  constructor(baseURL: string) {
    this.api = widgetApi(baseURL);
  }

  async getConfig(workspaceId: string, baseURL: string): Promise<WidgetConfig> {
    try {
      // دریافت تنظیمات از API بک‌اند
      const response = await this.api.getConfig(workspaceId);
      return response.data;
    } catch (error) {
      console.error('Error fetching widget config:', error);
      throw new Error('Failed to fetch widget configuration');
    }
  }
}

let widgetServiceInstance: WidgetService | null = null;

export const getWidgetService = (baseURL: string) => {
  if (!widgetServiceInstance) {
    widgetServiceInstance = new WidgetService(baseURL);
  }
  return widgetServiceInstance;
};

export const widgetService = {
  getConfig: (workspaceId: string, baseURL: string) =>
    getWidgetService(baseURL).getConfig(workspaceId, baseURL),
};
// ============================================================