'use client';

import { useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import type { CrmAppointment, CrmLead, CrmLeadActivity, TeamUser } from '@/services/crm-leads';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppointmentDialog } from '@/components/admin/crm/appointment-dialog';
import { WhatsAppDialog } from '@/components/admin/crm/whatsapp-dialog';
import { CrmEmailDialog, CrmFollowUpTaskDialog } from '@/components/admin/crm/crm-action-dialogs';
import { useMotionSafe } from '../motion';
import { ActivityComposer } from './ActivityComposer';
import { DrawerHeader } from './DrawerHeader';
import { StageStepper } from './StageStepper';
import { useAutosave } from './useAutosave';
import { ActivityTab } from './tabs/ActivityTab';
import { AgendaTab } from './tabs/AgendaTab';
import { ContactsTab } from './tabs/ContactsTab';
import { DataTab } from './tabs/DataTab';
import { OverviewTab } from './tabs/OverviewTab';
import { WhatsAppTab } from './tabs/WhatsAppTab';
import {
  isWhatsAppConsented,
  prependActivity,
  refreshLeadQueries,
  toCrmLead,
  toCrmLeadDetail,
  type DrawerLead,
  type DrawerTab,
} from './types';

const TABS: Array<{ value: DrawerTab; label: string }> = [
  { value: 'overview', label: 'Visão geral' },
  { value: 'activity', label: 'Atividades' },
  { value: 'agenda', label: 'Agenda' },
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
  const { tabSlide } = useMotionSafe();
  const autosave = useAutosave(lead.id);
  const [tab, setTab] = useState<DrawerTab>('overview');
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<CrmAppointment | undefined>();
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  const canWhatsApp = isWhatsAppConsented(lead) && Boolean(lead.phone || lead.phone2);
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
    <div className="flex min-h-0 flex-1 flex-col">
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

      <Tabs value={tab} onValueChange={(value) => setTab(value as DrawerTab)} className="flex min-h-0 flex-1 flex-col gap-0">
        <div className="border-y border-[hsl(var(--card-border))] px-3">
          <TabsList className="h-11 w-full justify-start overflow-x-auto bg-transparent p-0 pipeline-scrollbar sm:h-10">
            {TABS.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="h-full flex-none rounded-none border-0 border-b-2 border-transparent px-3 text-slate-500 data-[state=active]:border-[hsl(var(--brand))] data-[state=active]:bg-transparent data-[state=active]:text-slate-900 data-[state=active]:shadow-none dark:text-slate-400 dark:data-[state=active]:text-slate-50"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="pipeline-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={tab} variants={tabSlide} initial="hidden" animate="show" exit="exit">
              {content}
            </motion.div>
          </AnimatePresence>
        </div>
      </Tabs>

      <ActivityComposer lead={lead} autosave={autosave} callingId={callingId} onCall={onCall} />

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
