/** Dados do lead usados pelo copiloto (subconjunto do lead do CRM). */
export interface CopilotLead {
  id: number;
  name: string;
  company?: string | null;
  segment?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  temperature?: string | null;
}

/** 'call' = tela do discador (3 colunas no desktop); 'drawer' = gaveta do pipeline; 'compact' = celular (/ramal). */
export type CopilotVariant = 'call' | 'drawer' | 'compact';
