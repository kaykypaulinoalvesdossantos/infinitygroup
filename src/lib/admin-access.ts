import { BILLING_ENABLED } from '@/lib/features';

/**
 * Politica de acesso por cargo ao painel /admin.
 * SUPER_ADMIN e ADMIN veem tudo; VENDEDOR e FINANCEIRO veem apenas as rotas listadas abaixo.
 */

const matchesPath = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

const normalizeRole = (role?: string | null) => String(role ?? '').toUpperCase();

const FINANCEIRO_PATHS = ['/admin/dashboard', '/admin/faturas', '/admin/clientes', '/admin/contratos', '/admin/primeiro-acesso'];

export function canAccessAdminPath(role: string | null | undefined, pathname: string): boolean {
    const currentRole = normalizeRole(role);
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

    if (currentRole === 'SUPER_ADMIN' || currentRole === 'ADMIN') return true;

    if (currentRole === 'VENDEDOR') {
        if (matchesPath(path, '/admin/crm/leads')) return true;
        if (matchesPath(path, '/admin/primeiro-acesso')) return true;
        if (matchesPath(path, '/admin/atendimento')) {
            return !matchesPath(path, '/admin/atendimento/supervisao') && !matchesPath(path, '/admin/atendimento/configuracoes');
        }
        return false;
    }

    if (currentRole === 'FINANCEIRO') {
        return FINANCEIRO_PATHS.some((base) => matchesPath(path, base));
    }

    return false;
}

/** Pagina inicial de cada cargo dentro do /admin. */
export function defaultAdminPath(role: string | null | undefined): string {
    switch (normalizeRole(role)) {
        case 'VENDEDOR':
            return '/admin/atendimento';
        case 'FINANCEIRO':
            return BILLING_ENABLED ? '/admin/faturas' : '/admin/dashboard';
        default:
            return '/admin/dashboard';
    }
}
