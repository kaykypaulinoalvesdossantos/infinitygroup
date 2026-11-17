'use client';

import { useEffect, useRef, useState } from 'react';
import { apiRequest, apiRequestBlob } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Call = { id: string; leadName: string | null; createdAt: string; user: { name: string }; recording: { status: string; audioMode: string; lastError: string | null } | null };
type Transcript = { status: string; lastError: string | null; segments: { startMs: number; endMs: number; text: string }[] };
const labels: Record<string, string> = { UPLOADING: 'Enviando áudio', PENDING: 'Aguardando transcrição', PROCESSING: 'Transcrevendo', COMPLETED: 'Áudio e transcrição disponíveis', FAILED: 'Falha na transcrição', UPLOAD_FAILED: 'Falha no envio', DELETING: 'Exclusão em andamento', DELETE_FAILED: 'Exclusão pendente — nova tentativa automática', DELETED: 'Gravação e transcrição excluídas' };
const base = '/telephony/recordings/mixed';

export function CallRecordings() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const audioRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try { setCalls(await apiRequest(base)); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível consultar as gravações.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), 10000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    setTranscript(null); setConfirmDelete(false); setAudio(null);
    if (audioRef.current) URL.revokeObjectURL(audioRef.current);
    audioRef.current = null;
    if (!selected) return;
    let cancelled = false;
    async function load() {
      try { const value: Transcript = await apiRequest(`${base}/${selected}`); if (!cancelled) setTranscript(value); }
      catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : 'Falha ao carregar transcrição.'); }
    }
    void load(); const timer = window.setInterval(() => void load(), 10000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [selected]);
  useEffect(() => () => { if (audioRef.current) URL.revokeObjectURL(audioRef.current); }, []);

  async function action(work: () => Promise<void>) {
    setBusy(true); setError(null);
    try { await work(); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível concluir a operação.'); }
    finally { setBusy(false); }
  }
  async function upload(callId: string, file?: File) {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError('O áudio deve ter até 50 MB.'); return; }
    await action(async () => { const form = new FormData(); form.append('audio', file); await apiRequest(`${base}/${callId}`, { method: 'POST', body: form }); setSelected(callId); });
  }

  return <Card>
    <CardHeader><CardTitle>Gravações e transcrições</CardTitle><p className="text-sm text-muted-foreground">Últimas 50 ligações. Anexe o áudio gravado pelo celular para guardar e transcrever a conversa. A ligação pelo chip continua no fluxo atual.</p></CardHeader>
    <CardContent className="space-y-4">
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {loading && <p>Consultando ligações…</p>}
      {!loading && calls.length === 0 && <p>Nenhuma ligação encontrada.</p>}
      <div className="max-h-96 space-y-3 overflow-auto">
        {calls.map(call => <div key={call.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
          <div><p className="font-medium">{call.leadName || 'Ligação'} · {call.user.name}</p><p className="text-xs text-muted-foreground">{new Date(call.createdAt).toLocaleString('pt-BR')} · {call.id}</p><p className="text-sm">{call.recording ? labels[call.recording.status] ?? call.recording.status : 'Sem áudio recebido'}</p></div>
          {!call.recording ? <label className="cursor-pointer text-sm font-medium">Anexar áudio<input aria-label={`Anexar áudio de ${call.leadName || call.id}`} type="file" accept="audio/*,.m4a,.mp4" disabled={busy} className="block max-w-60 text-xs" onChange={e => { void upload(call.id, e.target.files?.[0]); e.target.value = ''; }} /></label> : call.recording.audioMode === 'MIXED' && call.recording.status !== 'DELETED' ? <Button variant="outline" disabled={busy} onClick={() => setSelected(call.id)}>Ver gravação</Button> : null}
        </div>)}
      </div>
      {selected && <section className="space-y-3 rounded-lg border p-4" aria-label="Detalhes da gravação">
        <div className="flex justify-between gap-2"><p className="font-semibold">Áudio da conversa</p><Button variant="ghost" disabled={busy} onClick={() => setSelected(null)}>Fechar</Button></div>
        <p>{transcript ? labels[transcript.status] ?? transcript.status : 'Carregando…'}</p>
        {transcript?.lastError && <p role="status" className="text-sm">{transcript.lastError}</p>}
        {transcript && ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'].includes(transcript.status) && (audio ? <audio controls preload="none" src={audio} className="w-full" /> : <Button disabled={busy} variant="outline" onClick={() => void action(async () => { const id = selected; const blob = await apiRequestBlob(`${base}/${id}/audio`); const url = URL.createObjectURL(blob); if (audioRef.current) URL.revokeObjectURL(audioRef.current); audioRef.current = url; setAudio(url); })}>Ouvir gravação</Button>)}
        {transcript?.segments.map((s, i) => <p key={`${s.startMs}-${i}`} className="text-sm leading-6"><span className="mr-2 font-mono text-muted-foreground">{Math.floor(s.startMs / 60000)}:{String(Math.floor(s.startMs / 1000) % 60).padStart(2, '0')}</span>{s.text}</p>)}
        {transcript?.status === 'COMPLETED' && transcript.segments.length === 0 && <p>Nenhuma fala reconhecida no áudio.</p>}
        {transcript?.status === 'FAILED' && <Button disabled={busy} variant="outline" onClick={() => void action(async () => { await apiRequest(`${base}/${selected}/retry`, { method: 'POST' }); setTranscript({ status: 'PENDING', segments: [], lastError: null }); })}>Tentar transcrição novamente</Button>}
        {confirmDelete ? <div className="space-y-2" role="alert"><p>Apagar permanentemente o áudio do Cloudinary e a transcrição? O histórico da ligação será mantido.</p><div className="flex gap-2"><Button disabled={busy} onClick={() => void action(async () => { await apiRequest(`${base}/${selected}`, { method: 'DELETE' }); setSelected(null); })}>Confirmar exclusão</Button><Button disabled={busy} variant="outline" onClick={() => setConfirmDelete(false)}>Cancelar</Button></div></div> : <Button disabled={busy || !transcript || transcript.status === 'UPLOADING'} variant="outline" onClick={() => setConfirmDelete(true)}>Apagar gravação e transcrição</Button>}
      </section>}
    </CardContent>
  </Card>;
}
