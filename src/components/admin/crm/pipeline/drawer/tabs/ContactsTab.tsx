'use client';

import { useQueryClient } from '@tanstack/react-query';
import { LeadContactsPanel } from '@/components/admin/crm/lead-contacts-panel';
import { refreshLeadQueries, type DrawerLead } from '../types';

export function ContactsTab({ lead }: { lead: DrawerLead }) {
  const queryClient = useQueryClient();

  return (
    <LeadContactsPanel
      leadId={lead.id}
      contacts={lead.contacts}
      onChanged={() => refreshLeadQueries(queryClient, lead.id)}
    />
  );
}
