export type EvidenceLevel = 'none' | 'hypothesis' | 'reported' | 'confirmed';

export type Effect = 'open-meeting' | 'call-ended' | null;

export type Temperature = 'COLD' | 'WARM' | 'HOT';

export interface ScriptChoice {
  label: string;
  target: string;
  area?: string;
  level?: EvidenceLevel;
}

export interface ScriptNode {
  stage: number;
  goal: string;
  speech: string;
  choices: ScriptChoice[];
}

export interface Facts {
  leads: number | null;
  qualified: number | null;
  contacted: number | null;
  sales: number | null;
  conversion: number | null;
  ticket: number | null;
  sellers: number | null;
  unattended: number | null;
  pending: number | null;
  marketing: number | null;
  proposals: number | null;
  accepted: number | null;
  target: number | null;
  acquisitionCost: number | null;
}

export interface Quality {
  priority: string;
  authority: string;
  timing: string;
  budget: string;
  impact: string;
  desiredOutcome: string;
  nextStep: string;
  followUp: string;
}

export interface HistoryEntry {
  when: string;
  kind: string;
  note: string;
}

export interface BottleneckEntry {
  level: EvidenceLevel;
  evidence: string;
  updated: string;
}

export interface DiagnosisData {
  schemaVersion: 1;
  node: string;
  stage: number;
  status: string;
  answers: Array<{ when: string; answer: string; node: string }>;
  bottlenecks: Record<string, BottleneckEntry>;
  facts: Facts;
  quality: Quality;
  objections: Array<{ when: string; name: string }>;
  history: HistoryEntry[];
  lastAnswer: string;
  pendingObjection: string | null;
  returnNode: string | null;
  notes: string;
  profile: { role: string; crm: string };
}

export interface ScriptOverrides {
  marca?: string;
  nodes?: Record<string, { speech?: string; goal?: string }>;
  objections?: Array<{ name: string; speech: string; goal: string; choices: string[] }>;
}

export interface ScriptObjection {
  speech: string;
  goal: string;
  choices: string[];
}

export interface Script {
  marca: string;
  nodes: Record<string, ScriptNode>;
  objectionNames: string[];
  objections: Record<string, ScriptObjection>;
}

export interface SpeechContext {
  nome?: string | null;
  empresa?: string | null;
  segmento?: string | null;
  vendedor?: string | null;
  marca?: string | null;
}

export interface LeadInfo {
  name: string;
  company?: string;
  segment?: string;
  email?: string;
  phone?: string;
  city?: string;
}

export interface Calc {
  leads: number | null;
  sales: number | null;
  conversion: number | null;
  unconverted: number | null;
  revenue: number | null;
}
