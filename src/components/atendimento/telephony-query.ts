import { apiRequest } from '@/services/api';
import type { Paginated, PhoneCall, PhoneCallStatus, TelephonyKpis } from '@/services/telephony';

/**
 * Consultas filtradas de ligacoes e KPIs.
 * Observacao: telephonyService.listCalls e telephonyService.getKpis ainda nao repassam os
 * parametros para a URL, por isso estas funcoes montam o query string diretamente.
 */

export interface CallsQuery {
  userId?: number;
  leadId?: number;
  status?: PhoneCallStatus;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
  campaignId?: number;
}

export interface KpisQuery {
  from?: string;
  to?: string;
  userId?: number;
  campaignId?: number;
}

function toQuery(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

export function fetchCalls(params: CallsQuery): Promise<Paginated<PhoneCall>> {
  return apiRequest(`/telephony/calls${toQuery({ ...params })}`) as Promise<Paginated<PhoneCall>>;
}

export function fetchKpis(params: KpisQuery): Promise<TelephonyKpis> {
  return apiRequest(`/telephony/kpis${toQuery({ ...params })}`) as Promise<TelephonyKpis>;
}
