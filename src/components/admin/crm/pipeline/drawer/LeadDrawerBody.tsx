'use client';

import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { CrmAppointment, CrmLead, CrmLeadActivity, TeamUser } from '@/services/crm-leads';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentDialog } from '@/components/admin/crm/appointment-dialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { isWhatsAppBlocked } from '@/components/admin/crm/format';
import { CrmEmailDialog, CrmFollowUpTaskDialog } from '@/components/admin/crm/crm-action-dialogs';
import { ActivityComposer } from './ActivityComposer';
import { DrawerHeader } from './DrawerHeader';
import { StageStepper } from './StageStepper';
import { useAutosave } from './useAutosave';
import { ActivityTab } from './tabs/ActivityTab';
import { AgendaTab } from './tabs/AgendaTab';
import { ContactsTab } from './tabs/ContactsTab';
import { DataTab } from './tabs/DataTab';
import { DiagnosisTab } from './tabs/DiagnosisTab';
import { ProposalsTab } from './tabs/ProposalsTab';
import { OverviewTab } from './tabs/OverviewTab';
import { WhatsAppTab } from './tabs/WhatsAppTab';
import {
  prependActivity,
  refreshLeadQueries,
  toCrmLead,
  toCrmLeadDetail,
  type DrawerLead,
  type DrawerTab,
} from './types';

const TABS: Array<{ value: DrawerTab; label: string }> = [
  { value: 'overview', label: 'Visão geral' },
  { value: 'diagnosis', label: 'Diagnóstico' },
  { value: 'activity', label: 'Atividades' },
  { value: 'agenda', label: 'Agenda' },
  { value: 'proposals', label: 'Propostas' },
  { value: 'contacts', label: 'Contatos' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'data', label: 'Dados' },
];

export interface LeadDrawerBodyProps {
  lead: DrawerLead;
  appointments: CrmAppointment[];
  isSupervisor: boolean;
  owners: TeamUser[];
  callingId: number | null;
  onCall: (lead: CrmLead) => void;
  onRequestOutcome?: (lead: CrmLead, kind: 'WON' | 'LOST') => void;
  onClose: () => void;
}

/** Conteudo da gaveta para um lead. Keyed por id: trocar de lead desmonta e envia o autosave pendente. */
export function LeadDrawerBody({
  lead,
  appointments,
  isSupervisor,
  owners,
  callingId,
  onCall,
  onRequestOutcome,
  onClose,
}: LeadDrawerBodyProps) {
  const queryClient = useQueryClient();
  const autosave = useAutosave(lead.id);
  const [requestedTab, setRequestedTab] = useState<DrawerTab | null>(null);
  const tab = requestedTab ?? 'overview';
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<CrmAppointment | undefined>();
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const scroll = scrollRef.current;
    const sections = sectionsRef.current;
    if (!scroll || !sections || requestedTab === null) return;
    const frame = requestAnimationFrame(() => {
      scroll.scrollTop += sections.getBoundingClientRect().top - scroll.getBoundingClientRect().top;
    });
    return () => cancelAnimationFrame(frame);
  }, [requestedTab]);

  const canWhatsApp = !isWhatsAppBlocked(lead) && Boolean(lead.phone || lead.phone2);
  /** Como em produção, o agendamento novo nasce ligado ao contato principal, quando existe. */
  const primaryContactId = lead.contacts.find((contact) => contact.isPrimary)?.id;

  const openAppointment = (appointment?: CrmAppointment) => {
    setEditingAppointment(appointment);
    setAppointmentOpen(true);
  };

  const handleAppointmentSaved = () => {
    setEditingAppointment(undefined);
    void refreshLeadQueries(queryClient, lead.id);
  };

  const handleWhatsAppActivity = useCallback(
    (activity: CrmLeadActivity) => prependActivity(queryClient, lead.id, activity),
    [lead.id, queryClient],
  );

  const sharedTabProps = {
    lead,
    autosave,
    appointments,
    isSupervisor,
    owners,
    onEditAppointment: openAppointment,
    onOpenWhatsApp: () => setWhatsAppOpen(true),
  };

  let content: React.ReactNode;
  switch (tab) {
    case 'overview':
      content = <OverviewTab {...sharedTabProps} />;
      break;
    case 'diagnosis':
      content = <DiagnosisTab lead={lead} />;
      break;
    case 'proposals':
      content = <ProposalsTab lead={lead} />;
      break;
    case 'activity':
      content = <ActivityTab lead={lead} />;
      break;
    case 'agenda':
      content = <AgendaTab lead={lead} appointments={appointments} onEditAppointment={openAppointment} />;
      break;
    case 'contacts':
      content = <ContactsTab lead={lead} />;
      break;
    case 'whatsapp':
      content = <WhatsAppTab lead={lead} onOpenWhatsApp={() => setWhatsAppOpen(true)} />;
      break;
    case 'data':
      content = <DataTab lead={lead} autosave={autosave} onArchived={onClose} />;
      break;
  }

  return (
    <div ref={scrollRef} className="pipeline-scrollbar min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain [overflow-anchor:none] [overflow-wrap:anywhere] pb-[env(safe-area-inset-bottom)]">
      <DrawerHeader
        lead={lead}
        autosave={autosave}
        isSupervisor={isSupervisor}
        owners={owners}
        callingId={callingId}
        canWhatsApp={canWhatsApp}
        onCall={onCall}
        onOpenWhatsApp={() => setWhatsAppOpen(true)}
        onSchedule={() => openAppointment(undefined)}
        onSendEmail={() => setEmailOpen(true)}
        onCreateTask={() => setTaskOpen(true)}
        onRequestOutcome={onRequestOutcome}
      />
      <StageStepper lead={lead} autosave={autosave} />

      <div ref={sectionsRef}>
        <Tabs value={tab} onValueChange={(value) => setRequestedTab(value as DrawerTab)} className="min-w-0 gap-0">
          <div className="sticky top-0 z-10 min-w-0 border-y border-border bg-card px-3 py-1 sm:px-5">
            <TabsList aria-label="Seções do lead" className="grid h-auto w-full grid-cols-4 gap-0.5 bg-transparent p-0 md:grid-cols-8">
              {TABS.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="min-h-11 min-w-0 whitespace-normal px-1.5 py-1 text-center text-xs leading-tight text-muted-foreground hover:bg-muted data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10 data-[state=active]:text-foreground data-[state=active]:shadow-none"
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {TABS.map(({ value }) => (
            <TabsContent key={value} value={value} forceMount={value === 'activity' ? true : undefined} className="min-w-0 px-4 py-5 data-[state=inactive]:hidden sm:px-6">
              {value === 'activity' && (
                <ActivityComposer lead={lead} autosave={autosave} callingId={callingId} onCall={onCall} />
              )}
              {value === tab ? content : null}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <AppointmentDialog
        lead={toCrmLead(lead)}
        appointment={editingAppointment}
        contactId={editingAppointment ? undefined : primaryContactId}
        open={appointmentOpen}
        onOpenChange={(open) => {
          setAppointmentOpen(open);
          if (!open) setEditingAppointment(undefined);
        }}
        onSaved={handleAppointmentSaved}
      />
      <WhatsAppDialog
        lead={toCrmLead(lead)}
        open={whatsAppOpen}
        onOpenChange={setWhatsAppOpen}
        onActivity={handleWhatsAppActivity}
      />
      <CrmEmailDialog
        lead={toCrmLeadDetail(lead)}
        open={emailOpen}
        onOpenChange={setEmailOpen}
        onSent={() => void refreshLeadQueries(queryClient, lead.id)}
      />
      <CrmFollowUpTaskDialog
        leadId={lead.id}
        leadLabel={lead.company || lead.name}
        open={taskOpen}
        onOpenChange={setTaskOpen}
        onCreated={() => void refreshLeadQueries(queryClient, lead.id)}
      />
    </div>
  );
}
