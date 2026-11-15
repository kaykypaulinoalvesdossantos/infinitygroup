'use client';

import { useEffect, useRef } from 'react';

/** Mapa tecla -> acao. Letras em minusculo (ex.: 'n', '/', 'Escape', 'ArrowUp'). */
export type HotkeyMap = Record<string, (event: KeyboardEvent) => void>;

const EDITABLE_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];

/** Verdadeiro se o foco esta em campo de digitacao (atalhos nao devem disparar). */
function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return EDITABLE_TAGS.includes(target.tagName);
}

/** Registra atalhos de teclado na janela. Ignora quando o foco esta em campo de texto. */
export function useHotkeys(map: HotkeyMap, enabled = true) {
  // Mantem o mapa mais recente sem reregistrar o listener a cada render
  const mapRef = useRef(map);
  useEffect(() => {
    mapRef.current = map;
  });

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const handler = mapRef.current[key];
      if (!handler) return;
      event.preventDefault();
      handler(event);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
