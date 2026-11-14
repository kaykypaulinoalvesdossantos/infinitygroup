import { redirect } from 'next/navigation';

/** Compatibilidade com links antigos; o funil agora fica na área única de Leads. */
export default function LegacyOpportunitiesPage() {
  redirect('/admin/crm/leads');
}
