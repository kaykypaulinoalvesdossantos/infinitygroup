'use client';

import { useId, useState } from 'react';
import { formatMoney, formatNumber, getCalc, type Facts } from '@/components/sales-copilot/engine';
import { Label } from '@/components/ui/label';

const CONVERSION_STEPS = [0, 1, 2, 3, 4];

/**
 * Simulador local: parte dos indicadores informados e nao e salvo no diagnostico.
 * Quem usa precisa ter o componente recriado (key) para voltar aos valores do lead.
 */
export function FunnelSimulator({ facts }: { facts: Facts }) {
  const base = getCalc(facts);
  const [leads, setLeads] = useState(facts.leads ?? 0);
  const [conversion, setConversion] = useState(base.conversion ?? 0);
  const [ticket, setTicket] = useState(facts.ticket ?? 0);

  const leadsMax = Math.max(1000, Math.ceil(((facts.leads ?? 0) * 2) / 100) * 100);
  const ticketMax = Math.max(5000, Math.ceil(((facts.ticket ?? 0) * 2) / 50) * 50);

  const sales = Math.round((leads * conversion) / 100);
  const unconverted = Math.max(0, leads - sales);
  const revenue = sales * ticket;

  const rows = CONVERSION_STEPS.map((delta) => {
    const rate = conversion + delta;
    const rowSales = Math.round((leads * rate) / 100);
    return { delta, rate, sales: rowSales, revenue: rowSales * ticket };
  });
  const maxRevenue = Math.max(0, ...rows.map((row) => row.revenue));

  const leadsId = useId();
  const conversionId = useId();
  const ticketId = useId();

  return (
    <div className="space-y-5">
      <p className="text-xs text-slate-500">Simulação local. Os valores não são salvos no diagnóstico.</p>

      <div className="space-y-4">
        <SliderField
          id={leadsId}
          label="Leads por mês"
          value={leads}
          display={formatNumber(leads)}
          min={0}
          max={leadsMax}
          step={10}
          onChange={setLeads}
        />
        <SliderField
          id={conversionId}
          label="Conversão"
          value={conversion}
          display={`${formatNumber(conversion, 1)}%`}
          min={0}
          max={100}
          step={0.5}
          onChange={setConversion}
        />
        <SliderField
          id={ticketId}
          label="Ticket médio"
          value={ticket}
          display={formatMoney(ticket)}
          min={0}
          max={ticketMax}
          step={50}
          onChange={setTicket}
        />
      </div>

      <dl className="grid grid-cols-3 gap-3">
        <Result label="Vendas estimadas" value={formatNumber(sales)} />
        <Result label="Não convertidos" value={formatNumber(unconverted)} />
        <Result label="Receita" value={formatMoney(revenue)} />
      </dl>

      <section aria-labelledby={`${conversionId}-steps`} className="space-y-2">
        <h3 id={`${conversionId}-steps`} className="text-sm font-semibold text-slate-900">
          Ganho com conversão maior
        </h3>
        <ul className="space-y-2">
          {rows.map((row) => {
            const width = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0;
            return (
              <li key={row.delta} className="space-y-1">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    {row.delta === 0 ? 'Atual' : `+${row.delta} p.p.`} ({formatNumber(row.rate, 1)}%)
                  </span>
                  <span className="tabular-nums">
                    {formatNumber(row.sales)} vendas · {formatMoney(row.revenue)}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-[#0076FF]" style={{ width: `${width}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function SliderField({
  id,
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs text-slate-600">
          {label}
        </Label>
        <span className="text-sm font-semibold tabular-nums text-slate-900">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[#0076FF]"
      />
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 truncate text-base font-bold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
