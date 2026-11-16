import { jsPDF } from 'jspdf';
import { autoTable, type RowInput } from 'jspdf-autotable';
import { LEAD_SOURCES, type CrmAppointment, type CrmLeadDetail } from '@/services/crm-leads';
import { formatDateTime, formatPhone, stageLabel } from './format';
import { ACTIVITY_TITLE, GOOGLE_SYNC_LABEL, OUTCOME_LABEL } from './pipeline/drawer/labels';

const colors = {
  background: '#0D0C14',
  panel: '#171520',
  accentPanel: '#211A30',
  border: '#393448',
  accent: '#C0A1FF',
  text: '#F2EFF8',
  muted: '#AAA5B6',
};

// Helvetica in PDF supports WinAnsi, including the accents and punctuation used in Portuguese.
function pdfText(value: string) {
  return value.normalize('NFC').replace(/\r\n?/g, '\n').replace(/\t/g, '    ')
    .replace(/[^\n\x20-\x7e\xa0-\xff€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ]/gu, '?');
}

function section(title: string): RowInput {
  return [{ content: title, colSpan: 2, styles: { fillColor: colors.accentPanel, textColor: colors.accent, fontStyle: 'bold' } }];
}

function field(label: string, value?: string | null) {
  return { content: `${label.toUpperCase()}\n${pdfText(value?.trim() || 'Não informado')}` };
}

export function createLeadPdf(lead: CrmLeadDetail, appointments: CrmAppointment[], now = new Date()) {
  const document = new jsPDF({ format: 'a4', unit: 'mm', compress: true });
  document.setProperties({ title: `Ficha de ${pdfText(lead.name)}`, author: 'Infinity Groups' });

  const meeting = appointments
    .filter((item) => item.status === 'SCHEDULED' && Date.parse(item.endsAt) >= now.getTime())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))[0];
  const source = LEAD_SOURCES.find((item) => item.id === lead.source)?.label ?? lead.source;
  const history = lead.activities.map((activity): RowInput => {
    const title = ACTIVITY_TITLE[activity.type] ?? activity.type;
    const outcome = activity.outcome ? OUTCOME_LABEL[activity.outcome] ?? stageLabel(activity.outcome) : null;
    return [
      { content: `${formatDateTime(activity.occurredAt)}\n${pdfText(title)}`, styles: { fontStyle: 'bold' } },
      { content: pdfText([outcome, activity.summary].filter(Boolean).join('\n') || 'Sem observação nesta atividade.') },
    ];
  });

  const body: RowInput[] = [
    [{ content: pdfText(lead.name), colSpan: 2, styles: { fontSize: 18, fontStyle: 'bold', fillColor: colors.background } }],
    section('DADOS DO CLIENTE'),
    [field('Empresa', lead.company), field('Responsável comercial', lead.owner?.name)],
    [field('Telefone', formatPhone(lead.phone)), field('Telefone alternativo', formatPhone(lead.phone2))],
    [field('E-mail', lead.email), field('Cidade', lead.city)],
    [field('Segmento', lead.segment), field('Origem', source)],
    [field('Etapa', lead.funnelStage?.name ?? stageLabel(lead.status)), field('Próxima ação', formatDateTime(lead.nextActionAt))],
    [field('Cadastrado em', formatDateTime(lead.createdAt)), field('Última atualização', formatDateTime(lead.updatedAt))],
    section('REUNIÃO'),
    ...(meeting ? [
      [field('Compromisso', meeting.title), field('Agenda Google', GOOGLE_SYNC_LABEL[meeting.googleSyncStatus])],
      [field('Início', formatDateTime(meeting.startsAt)), field('Término', formatDateTime(meeting.endsAt))],
      [field('E-mail do convite', meeting.guestEmail || meeting.attendees?.join(', ')), field('Local', meeting.location)],
      [{ ...field('Link', meeting.meetUrl || meeting.externalHtmlLink), colSpan: 2 }],
    ] : [[{ content: 'Nenhuma reunião agendada.', colSpan: 2 }]]),
    section('OBSERVAÇÕES DO CLIENTE'),
    [{ content: pdfText(lead.notes?.trim() || 'Nenhuma observação registrada.'), colSpan: 2 }],
    section(`HISTÓRICO RECENTE DE ATENDIMENTO · ${history.length}`),
    ...(history.length ? history : [[{ content: 'Nenhuma atividade registrada.', colSpan: 2 }]]),
  ];

  autoTable(document, {
    body,
    theme: 'plain',
    margin: { top: 23, left: 14, right: 14, bottom: 17 },
    columnStyles: { 0: { cellWidth: 91 }, 1: { cellWidth: 91 } },
    styles: {
      fillColor: colors.panel,
      textColor: colors.text,
      lineColor: colors.border,
      lineWidth: 0.2,
      cellPadding: 2.8,
      fontSize: 9,
      overflow: 'linebreak',
    },
    rowPageBreak: 'avoid',
    willDrawPage: ({ pageNumber }) => {
      document.setFillColor(colors.background).rect(0, 0, 210, 297, 'F');
      document.setFillColor(colors.panel).rect(0, 0, 210, 18, 'F');
      document.setTextColor(colors.text).setFont('helvetica', 'bold').setFontSize(12).text('INFINITY GROUPS', 14, 12);
      document.setTextColor(colors.accent).setFontSize(9).text(`FICHA DO CLIENTE #${lead.id}`, 196, 12, { align: 'right' });
      document.setDrawColor(colors.border).line(14, 284, 196, 284);
      document.setTextColor(colors.muted).setFont('helvetica', 'normal').setFontSize(8);
      document.text(`Gerada em ${formatDateTime(now.toISOString())}`, 14, 290);
      document.text(`Página ${pageNumber}`, 196, 290, { align: 'right' });
    },
  });

  return document;
}
