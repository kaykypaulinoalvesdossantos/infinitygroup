import { apiRequest } from './api';

export interface IntegrationStatus {
  provider: string;
  settings: Record<string, string>;
  hasSecret: boolean;
  configured: boolean;
  source: 'panel' | 'environment';
  updatedAt: string | null;
}

const base = '/system-settings/integrations';

export const integrationSettings = {
  list: (): Promise<IntegrationStatus[]> => apiRequest(base),
  get: (provider: string): Promise<IntegrationStatus> => apiRequest(`${base}/${provider}`),
  save: (provider: string, settings: Record<string, string>, secret: string): Promise<IntegrationStatus> =>
    apiRequest(`${base}/${provider}`, { method: 'PUT', body: JSON.stringify({ settings, ...(secret ? { secret } : {}) }) }),
  test: (provider: string): Promise<{ connected: boolean; message: string }> =>
    apiRequest(`${base}/${provider}/test`, { method: 'POST' }),
};
