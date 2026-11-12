import { LEAD_STATUSES, type CrmLead, type LeadInput, type LeadStatus } from '@/services/crm-leads';

export const formatDateTime = (iso?: string | null) => {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export const formatCurrencyBRL = (value?: number | null) => {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatPhone = (phone?: string | null) => {
    if (!phone) return '—';
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
    if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return phone;
};

export const stageLabel = (status?: string | null) => LEAD_STATUSES.find((s) => s.id === status)?.title ?? status ?? '—';

export const stageColor = (status?: string | null) =>
    LEAD_STATUSES.find((s) => s.id === status)?.color ?? 'bg-slate-100 text-slate-700';

export const isOverdue = (iso?: string | null) => !!iso && new Date(iso).getTime() < Date.now();

/** ISO -> valor de <input type="datetime-local"> (hora local). */
export const toDateTimeLocal = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fromDateTimeLocal = (value: string) => (value ? new Date(value).toISOString() : null);

export const errorMessage = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export interface LeadFormValues {
    name: string;
    company: string;
    email: string;
    phone: string;
    phone2: string;
    city: string;
    segment: string;
    source: string;
    status: LeadStatus;
    value: string;
    ownerId: string;
    nextActionAt: string;
    notes: string;
    lostReason: string;
}

export const emptyLeadForm = (): LeadFormValues => ({
    name: '',
    company: '',
    email: '',
    phone: '',
    phone2: '',
    city: '',
    segment: '',
    source: 'MANUAL',
    status: 'NEW',
    value: '',
    ownerId: 'none',
    nextActionAt: '',
    notes: '',
    lostReason: '',
});

export const leadToForm = (lead: CrmLead): LeadFormValues => ({
    name: lead.name ?? '',
    company: lead.company ?? '',
    email: lead.email ?? '',
    phone: lead.phone ?? '',
    phone2: lead.phone2 ?? '',
    city: lead.city ?? '',
    segment: lead.segment ?? '',
    source: lead.source ?? 'MANUAL',
    status: lead.status,
    value: lead.value !== null && lead.value !== undefined ? String(lead.value) : '',
    ownerId: lead.ownerId ? String(lead.ownerId) : 'none',
    nextActionAt: toDateTimeLocal(lead.nextActionAt),
    notes: lead.notes ?? '',
    lostReason: lead.lostReason ?? '',
});

/** Monta o corpo enviado ao backend. Campos vazios viram null; owner so vai para supervisor. */
export const formToPayload = (form: LeadFormValues, isSupervisor: boolean): LeadInput => {
    const text = (v: string) => (v.trim() ? v.trim() : null);
    const numeric = form.value.trim() ? Number(form.value.replace(',', '.')) : null;
    const payload: LeadInput = {
        name: form.name.trim(),
        company: text(form.company),
        email: text(form.email),
        phone: text(form.phone),
        phone2: text(form.phone2),
        city: text(form.city),
        segment: text(form.segment),
        source: form.source,
        status: form.status,
        value: numeric !== null && Number.isFinite(numeric) ? numeric : null,
        notes: text(form.notes),
        nextActionAt: fromDateTimeLocal(form.nextActionAt),
    };
    if (form.status === 'LOST') payload.lostReason = text(form.lostReason);
    if (isSupervisor) payload.ownerId = form.ownerId === 'none' ? null : Number(form.ownerId);
    return payload;
};
