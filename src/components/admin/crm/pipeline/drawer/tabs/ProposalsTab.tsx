'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProposalEditorDialog } from '@/components/admin/crm/proposals/ProposalEditorDialog';
import { ProposalList } from '@/components/admin/crm/proposals/ProposalList';
import { Section } from '../parts';
import type { DrawerLead } from '../types';

interface ProposalsTabProps {
  lead: DrawerLead;
}

/** Propostas do lead aberto na gaveta do pipeline. */
export function ProposalsTab({ lead }: ProposalsTabProps) {
  const [creating, setCreating] = useState(false);

  const openCreate = () => setCreating(true);

  return (
    <Section
      title="Propostas"
      action={
        <Button type="button" size="sm" onClick={openCreate}>
          <Plus aria-hidden className="mr-1.5 h-4 w-4" />
          Nova proposta
        </Button>
      }
    >
      <ProposalList leadId={lead.id} onCreate={openCreate} />
      <ProposalEditorDialog open={creating} onOpenChange={setCreating} leadId={lead.id} />
    </Section>
  );
}
