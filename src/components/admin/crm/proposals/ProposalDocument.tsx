import { formatDay } from '@/components/atendimento/helpers';
import { formatCents, type Proposal } from '@/services/sales-copilot';
import { formatValidUntil, lineTotalCents } from './ProposalEditorDialog';

const quantityFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

interface ProposalDocumentProps {
  proposal: Proposal;
}

/** Documento da proposta em folha A4 (preto no branco), usado na tela de impressao. */
export function ProposalDocument({ proposal }: ProposalDocumentProps) {
  const issuedAt = formatDay(proposal.createdAt);
  const sellerName = proposal.createdBy?.name ?? 'Vendedor responsável';

  const clientRows: Array<{ label: string; value: string }> = [
    { label: 'Nome', value: proposal.lead.name },
    { label: 'Empresa', value: proposal.lead.company ?? '' },
    { label: 'E-mail', value: proposal.lead.email ?? '' },
    { label: 'Telefone', value: proposal.lead.phone ?? '' },
    { label: 'Cidade', value: proposal.lead.city ?? '' },
    { label: 'Segmento', value: proposal.lead.segment ?? '' },
  ].filter((row) => row.value.trim() !== '');

  return (
    <article className="mx-auto w-full max-w-[210mm] bg-white text-black p-6 text-[13px] leading-relaxed sm:p-10 print:bg-white print:text-black print:p-0">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-black pb-4">
        <div>
          <p className="text-2xl font-bold tracking-tight">Grupo Infinity</p>
          <p className="text-xs uppercase tracking-widest">Proposta comercial</p>
        </div>
        <dl className="space-y-0.5 text-right text-xs">
          <div>
            <dt className="inline font-semibold">Número: </dt>
            <dd className="inline">{proposal.number ?? '-'}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Data: </dt>
            <dd className="inline">{issuedAt}</dd>
          </div>
          {proposal.validUntil && (
            <div>
              <dt className="inline font-semibold">Válida até: </dt>
              <dd className="inline">{formatValidUntil(proposal.validUntil)}</dd>
            </div>
          )}
        </dl>
      </header>

      {clientRows.length > 0 && (
        <section className="mt-6" aria-labelledby="proposal-client-title">
          <h2 id="proposal-client-title" className="text-xs font-semibold uppercase tracking-wider">
            Cliente
          </h2>
          <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            {clientRows.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="inline font-semibold">{row.label}: </dt>
                <dd className="inline break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="mt-6" aria-labelledby="proposal-title">
        <h1 id="proposal-title" className="text-xl font-bold">
          {proposal.title}
        </h1>
        {proposal.scope && (
          <div className="mt-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider">Escopo</h2>
            <p className="mt-1 whitespace-pre-line">{proposal.scope}</p>
          </div>
        )}
      </section>

      <section className="mt-6" aria-labelledby="proposal-items-title">
        <h2 id="proposal-items-title" className="text-xs font-semibold uppercase tracking-wider">
          Itens
        </h2>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-black text-left">
                <th scope="col" className="py-2 pr-2 font-semibold">
                  Descrição
                </th>
                <th scope="col" className="w-16 py-2 text-right font-semibold">
                  Qtd.
                </th>
                <th scope="col" className="w-28 py-2 text-right font-semibold">
                  Valor unit.
                </th>
                <th scope="col" className="w-28 py-2 text-right font-semibold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {proposal.items.map((item, index) => (
                <tr key={index} className="break-inside-avoid border-b border-input align-top">
                  <td className="py-2 pr-2">{item.description}</td>
                  <td className="py-2 text-right tabular-nums">{quantityFormatter.format(item.quantity)}</td>
                  <td className="py-2 text-right tabular-nums whitespace-nowrap">
                    {formatCents(item.unitPriceCents)}
                  </td>
                  <td className="py-2 text-right tabular-nums whitespace-nowrap">
                    {formatCents(lineTotalCents(item.quantity, item.unitPriceCents))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="ml-auto mt-4 w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between gap-3">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCents(proposal.subtotalCents)}</span>
          </div>
          {proposal.discountCents > 0 && (
            <div className="flex justify-between gap-3">
              <span>Desconto</span>
              <span className="tabular-nums">- {formatCents(proposal.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between gap-3 border-t-2 border-black pt-2 text-base font-bold">
            <span>Total</span>
            <span className="tabular-nums">{formatCents(proposal.totalCents)}</span>
          </div>
        </div>
      </section>

      {proposal.conditions && (
        <section className="mt-6" aria-labelledby="proposal-conditions-title">
          <h2 id="proposal-conditions-title" className="text-xs font-semibold uppercase tracking-wider">
            Condições
          </h2>
          <p className="mt-1 whitespace-pre-line">{proposal.conditions}</p>
        </section>
      )}

      {proposal.validUntil && (
        <p className="mt-4 text-sm">Esta proposta é válida até {formatValidUntil(proposal.validUntil)}.</p>
      )}

      <footer className="mt-16 break-inside-avoid">
        <div className="mx-auto w-2/3 border-t border-black pt-2 text-center text-sm">
          <p className="font-semibold">{sellerName}</p>
          <p className="text-xs">Grupo Infinity</p>
        </div>
      </footer>
    </article>
  );
}
