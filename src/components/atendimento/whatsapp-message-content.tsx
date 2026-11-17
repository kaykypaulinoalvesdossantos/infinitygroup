'use client';

import { useState } from 'react';
import type { CrmLeadActivity } from '@/services/crm-leads';

export function WhatsAppMessageContent({ activity }: { activity: CrmLeadActivity }) {
  const [failed, setFailed] = useState(false);
  const rawMedia = activity.metadata?.deletedAt ? null : activity.metadata?.media;
  const media = rawMedia && typeof rawMedia === 'object' && !Array.isArray(rawMedia)
    ? rawMedia as Record<string, unknown> : null;
  let url: string | null = null;
  if (typeof media?.url === 'string') {
    try {
      const parsed = new URL(media.url);
      if (parsed.protocol === 'https:' && parsed.hostname === 'res.cloudinary.com') url = parsed.href;
    } catch { /* Older messages may have no usable media URL. */ }
  }
  const text = typeof activity.metadata?.messageText === 'string'
    ? activity.metadata.messageText : '';
  const caption = text && !/^\[(Imagem|Áudio|Vídeo|Documento|Figurinha) (recebid[ao]|enviad[ao])\]$/.test(text)
    ? text : '';
  const fileName = typeof media?.fileName === 'string' ? media.fileName : 'Abrir arquivo';

  if (!url) return (
    <p className="whitespace-pre-wrap break-words text-sm">
      {text || activity.summary || 'Mensagem'}
      {media?.status === 'UNAVAILABLE' && <span className="mt-1 block text-xs text-muted-foreground">Arquivo indisponível: maior que 15 MB.</span>}
    </p>
  );

  return (
    <div className="min-w-0 space-y-2">
      {!failed && (media?.type === 'image' || media?.type === 'sticker') && (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block" aria-label="Abrir imagem">
          {/* Cloudinary already delivers this file; avoid fetching private conversation media through the image optimizer. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={caption || 'Imagem do WhatsApp'} loading="lazy" onError={() => setFailed(true)} className="max-h-80 w-auto max-w-full rounded-lg object-contain" />
        </a>
      )}
      {!failed && media?.type === 'audio' && (
        <audio controls preload="none" src={url} aria-label="Áudio do WhatsApp" onError={() => setFailed(true)} className="w-64 max-w-full" />
      )}
      {!failed && media?.type === 'video' && (
        <video controls playsInline preload="none" src={url} aria-label="Vídeo do WhatsApp" onError={() => setFailed(true)} className="max-h-80 max-w-full rounded-lg" />
      )}
      {failed && <p role="status" className="text-xs text-muted-foreground">Não foi possível carregar a prévia. Abra o arquivo abaixo.</p>}
      <a href={url} target="_blank" rel="noopener noreferrer" className="block break-all text-xs underline underline-offset-2">{fileName}</a>
      {caption && <p className="whitespace-pre-wrap break-words text-sm">{caption}</p>}
    </div>
  );
}

