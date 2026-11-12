'use client';

import { useEffect, useState } from 'react';
import { Download, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStoredUser, isSalesRole } from '@/services/crm-leads';
import { RAMAL_APP_DOWNLOAD_URL, RAMAL_APP_FILE_NAME, RAMAL_APP_VERSION } from '@/lib/ramal-app';

type Variant = 'sidebar' | 'card';

/**
 * Botao "Baixar app Infinity Ramal". Aparece so para quem usa o ramal
 * (vendedor, admin e super admin); financeiro e cliente nao veem.
 */
export function DownloadRamalAppButton({ variant = 'card', className }: { variant?: Variant; className?: string }) {
  // Le o cargo so no navegador (evita divergencia de hidratacao)
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    setAllowed(isSalesRole(getStoredUser()?.role));
  }, []);

  if (!allowed) return null;

  if (variant === 'sidebar') {
    return (
      <a
        href={RAMAL_APP_DOWNLOAD_URL}
        download={RAMAL_APP_FILE_NAME}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm text-[#0076FF] hover:bg-blue-50 transition-all',
          className,
        )}
        title={`Instalar o app Infinity Ramal no celular Android (versão ${RAMAL_APP_VERSION})`}
      >
        <Smartphone className="h-4 w-4" />
        <span className="flex flex-col leading-tight">
          <span className="font-medium">Baixar app Infinity Ramal</span>
          <span className="text-xs text-slate-500">Android · v{RAMAL_APP_VERSION}</span>
        </span>
      </a>
    );
  }

  return (
    <div className={cn('rounded-xl border border-blue-100 bg-blue-50/60 p-4', className)}>
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-white p-2 text-[#0076FF] shadow-sm">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1A1A1A]">App Infinity Ramal</p>
          <p className="mt-0.5 text-xs text-slate-600">
            Instale no seu celular Android, entre com seu usuário e toque em &quot;Conectar este celular&quot;.
            As ligações saem pelo chip do seu próprio aparelho.
          </p>
          <a
            href={RAMAL_APP_DOWNLOAD_URL}
            download={RAMAL_APP_FILE_NAME}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-[#0076FF] px-4 text-sm font-medium text-white hover:bg-[#0060D0] transition-colors"
          >
            <Download className="h-4 w-4" />
            Baixar app (Android · v{RAMAL_APP_VERSION})
          </a>
          <p className="mt-2 text-[11px] text-slate-500">
            No celular, permita &quot;instalar apps desta fonte&quot; quando o Android pedir.
          </p>
        </div>
      </div>
    </div>
  );
}
