'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CheckCircle2, Loader2, MessageCircle, XCircle } from 'lucide-react';
import { crmLeadsApi } from '@/services/crm-leads';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { errorMessage, formatDateTime } from '@/components/admin/crm/format';
import { useMotionSafe } from '../../motion';
import { useStages } from '../../hooks/usePipelineData';
import { pipelineKeys } from '../../queryKeys';
import { CONSENT_SOURCE_OPTIONS, type ConsentSource } from '../labels';
import { ActivityRow } from './ActivityTab';
import { Section } from '../parts';
import { isWhatsAppConsented, type DrawerLead } from '../types';

interface WhatsAppTabProps {
  lead: DrawerLead;
  onOpenWhatsApp: () => void;
}

/** Autorizacao de WhatsApp (igual ao bloco da gaveta antiga) e historico de mensagens do lead. */
export function WhatsAppTab({ lead, onOpenWhatsApp }: WhatsAppTabProps) {
  const queryClient = useQueryClient();
  const { listStagger } = useMotionSafe();
  const { data: stages = [] } = useStages();
  const [checked, setChecked] = useState(false);
  const [source, setSource] = useState<ConsentSource>('VERBAL');
  const consented = isWhatsAppConsented(lead);
  const canOpen = consented && Boolean(lead.phone || lead.phone2);
  const messages = lead.activities.filter((activity) => activity.type === 'WHATSAPP');

  const consentMutation = useMutation({
    mutationFn: (value: boolean) => crmLeadsApi.setWhatsAppConsent(lead.id, value, value ? source : undefined),
    onSuccess: (_result, value) => {
      void queryClient.invalidateQueries({ queryKey: pipelineKeys.lead(lead.id) });
      toast.success(value ? 'Autorização de WhatsApp registrada.' : 'Contato pelo WhatsApp bloqueado.');
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível atualizar a autorização.')),
    onSettled: () => setChecked(false),
  });

  return (
    <div className="space-y-6">
      <Section title="Permissão de WhatsApp">
        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Autorização</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                {consented
                  ? `Autorizado${lead.whatsappOptInAt ? ` em ${formatDateTime(lead.whatsappOptInAt)}` : ''}.`
                  : 'Registre a autorização do lead antes de preparar uma mensagem.'}
              </p>
            </div>
            {consented && <CheckCircle2 aria-hidden className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />}
          </div>
          {consented ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 text-red-700 hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950"
              onClick={() => consentMutation.mutate(false)}
              disabled={consentMutation.isPending}
            >
              {consentMutation.isPending && <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />}
              <XCircle aria-hidden className="mr-2 h-4 w-4" />
              Revogar autorização
            </Button>
          ) : (
            <div className="mt-3 space-y-3">
              <label className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => setChecked(event.target.checked)}
                  className="mt-0.5"
                />
                <span>O lead autorizou receber contato pelo WhatsApp.</span>
              </label>
              <Select value={source} onValueChange={(value) => setSource(value as ConsentSource)}>
                <SelectTrigger aria-label="Origem da autorização" className="h-9 bg-white dark:bg-slate-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONSENT_SOURCE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={() => consentMutation.mutate(true)}
                disabled={!checked || consentMutation.isPending}
              >
                {consentMutation.isPending && <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />}
                Registrar autorização
              </Button>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onOpenWhatsApp}
          disabled={!canOpen}
          className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-950"
        >
          <MessageCircle aria-hidden className="mr-2 h-4 w-4" />
          {canOpen ? 'Abrir conversa' : 'Conversa disponível após autorização e telefone'}
        </Button>
      </Section>

      <Section title="Mensagens">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Nenhuma mensagem de WhatsApp ainda.
          </p>
        ) : (
          <motion.ol
            variants={listStagger}
            initial="hidden"
            animate="show"
            className="relative before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-slate-200 dark:before:bg-slate-700"
          >
            {messages.map((activity) => (
              <ActivityRow key={activity.id} activity={activity} stages={stages} />
            ))}
          </motion.ol>
        )}
      </Section>
    </div>
  );
}
