'use client';

import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, MessageCircle } from 'lucide-react';
import { crmLeadsApi } from '@/services/crm-leads';
import { Button } from '@/components/ui/button';
import { errorMessage, isWhatsAppBlocked } from '@/components/admin/crm/format';
import { useMotionSafe } from '../../motion';
import { useStages } from '../../hooks/usePipelineData';
import { pipelineKeys } from '../../queryKeys';
import { ActivityRow } from './ActivityTab';
import { Section } from '../parts';
import type { DrawerLead } from '../types';

interface WhatsAppTabProps {
  lead: DrawerLead;
  onOpenWhatsApp: () => void;
}

export function WhatsAppTab({ lead, onOpenWhatsApp }: WhatsAppTabProps) {
  const queryClient = useQueryClient();
  const { listStagger } = useMotionSafe();
  const { data: stages = [] } = useStages();
  const blocked = isWhatsAppBlocked(lead);
  const canOpen = !blocked && Boolean(lead.phone || lead.phone2);
  const messages = lead.activities.filter((activity) => activity.type === 'WHATSAPP');

  const blockMutation = useMutation({
    mutationFn: (value: boolean) => crmLeadsApi.setWhatsAppBlocked(lead.id, value),
    onSuccess: (_result, value) => {
      void queryClient.invalidateQueries({ queryKey: pipelineKeys.lead(lead.id) });
      toast.success(value ? 'Contato pelo WhatsApp bloqueado.' : 'Contato pelo WhatsApp desbloqueado.');
    },
    onError: (err) => toast.error(errorMessage(err, 'Não foi possível atualizar o bloqueio.')),
  });

  return (
    <div className="space-y-6">
      <Section title="WhatsApp">
        <Button
          type="button"
          variant="outline"
          onClick={onOpenWhatsApp}
          disabled={!canOpen}
          className="w-full border-success-border text-success-foreground hover:bg-success   "
        >
          <MessageCircle aria-hidden className="mr-2 h-4 w-4" />
          {blocked ? 'WhatsApp bloqueado' : canOpen ? 'Abrir conversa' : 'Cadastre um telefone'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => blockMutation.mutate(!blocked)} disabled={blockMutation.isPending}>
          {blockMutation.isPending && <Loader2 aria-hidden className="mr-2 h-4 w-4 animate-spin" />}
          {blocked ? 'Desbloquear WhatsApp' : 'Bloquear WhatsApp'}
        </Button>
      </Section>

      <Section title="Mensagens">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground  ">
            Nenhuma mensagem de WhatsApp ainda.
          </p>
        ) : (
          <motion.ol
            variants={listStagger}
            initial="hidden"
            animate="show"
            className="relative before:absolute before:bottom-2 before:left-4 before:top-2 before:w-px before:bg-muted "
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
