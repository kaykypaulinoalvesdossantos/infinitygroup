import {
  LEVEL,
  LEVEL_NAMES,
  NODES,
  OBJECTIONS,
  OBJECTION_DATA,
  SEGMENT_SPEECH,
  STAGE_TARGETS,
  STAGES,
} from './script-data';
import type {
  BottleneckEntry,
  Calc,
  DiagnosisData,
  Effect,
  EvidenceLevel,
  Facts,
  HistoryEntry,
  LeadInfo,
  Quality,
  Script,
  ScriptNode,
  ScriptObjection,
  ScriptOverrides,
  SpeechContext,
  Temperature,
} from './types';

export const DEFAULT_MARCA = 'Grupo Infinity';

const HISTORY_CAP = 70;
const DEFAULT_STATUS = 'Em andamento';

const hasOwn = (obj: object, key: string): boolean => Object.prototype.hasOwnProperty.call(obj, key);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function iso(now: Date): string {
  return now.toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function finiteOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function recordsOf(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value.filter((x): x is Record<string, unknown> => isRecord(x)) : [];
}

function isLevel(value: unknown): value is EvidenceLevel {
  return typeof value === 'string' && hasOwn(LEVEL, value);
}

function isNodeKey(value: unknown): value is string {
  return typeof value === 'string' && hasOwn(NODES, value);
}

function nodeOf(script: Script, key: string): ScriptNode {
  return hasOwn(script.nodes, key) ? script.nodes[key] : script.nodes.opening;
}

const FACT_KEYS = [
  'leads',
  'qualified',
  'contacted',
  'sales',
  'conversion',
  'ticket',
  'sellers',
  'unattended',
  'pending',
  'marketing',
  'proposals',
  'accepted',
  'target',
  'acquisitionCost',
] as const satisfies ReadonlyArray<keyof Facts>;

const QUALITY_KEYS = [
  'priority',
  'authority',
  'timing',
  'budget',
  'impact',
  'desiredOutcome',
  'nextStep',
  'followUp',
] as const satisfies ReadonlyArray<keyof Quality>;

function blankFacts(): Facts {
  return {
    leads: null,
    qualified: null,
    contacted: null,
    sales: null,
    conversion: null,
    ticket: null,
    sellers: null,
    unattended: null,
    pending: null,
    marketing: null,
    proposals: null,
    accepted: null,
    target: null,
    acquisitionCost: null,
  };
}

function blankQuality(): Quality {
  return {
    priority: '',
    authority: '',
    timing: '',
    budget: '',
    impact: '',
    desiredOutcome: '',
    nextStep: '',
    followUp: '',
  };
}

// ---------------------------------------------------------------------------
// Script and state construction
// ---------------------------------------------------------------------------

export function buildScript(overrides?: ScriptOverrides | null): Script {
  const raw: unknown = overrides;
  const ov: Record<string, unknown> = isRecord(raw) ? raw : {};

  const nodes: Record<string, ScriptNode> = clone(NODES);
  if (isRecord(ov.nodes)) {
    for (const key of Object.keys(ov.nodes)) {
      if (!isNodeKey(key)) continue;
      const patch = ov.nodes[key];
      if (!isRecord(patch)) continue;
      if (typeof patch.speech === 'string' && patch.speech.trim()) nodes[key].speech = patch.speech.trim();
      if (typeof patch.goal === 'string' && patch.goal.trim()) nodes[key].goal = patch.goal.trim();
    }
  }

  let objectionNames: string[] = [...OBJECTIONS];
  let objections: Record<string, ScriptObjection> = clone(OBJECTION_DATA);
  if (Array.isArray(ov.objections) && ov.objections.length > 0) {
    const valid: Array<{ name: string; objection: ScriptObjection }> = [];
    for (const item of recordsOf(ov.objections)) {
      const name = str(item.name).trim();
      const speech = str(item.speech).trim();
      const goal = str(item.goal).trim();
      const choices = Array.isArray(item.choices)
        ? item.choices.filter((c): c is string => typeof c === 'string' && c.trim().length > 0).map((c) => c.trim())
        : [];
      if (!name || !speech || choices.length === 0) continue;
      valid.push({ name, objection: { speech, goal, choices } });
    }
    if (valid.length > 0) {
      objections = {};
      objectionNames = [];
      for (const { name, objection } of valid) {
        if (!hasOwn(objections, name)) objectionNames.push(name);
        objections[name] = objection;
      }
    }
  }

  const marca = typeof ov.marca === 'string' && ov.marca.trim() ? ov.marca.trim() : DEFAULT_MARCA;
  return { marca, nodes, objectionNames, objections };
}

export function blankDiagnosis(): DiagnosisData {
  return {
    schemaVersion: 1,
    node: 'opening',
    stage: NODES.opening.stage,
    status: DEFAULT_STATUS,
    answers: [],
    bottlenecks: {},
    facts: blankFacts(),
    quality: blankQuality(),
    objections: [],
    history: [],
    lastAnswer: '',
    pendingObjection: null,
    returnNode: null,
    notes: '',
    profile: { role: '', crm: '' },
  };
}

export function normalizeDiagnosis(raw: unknown): DiagnosisData {
  const base = blankDiagnosis();
  if (!isRecord(raw)) return base;

  const node = isNodeKey(raw.node) ? raw.node : 'opening';

  const bottlenecks: Record<string, BottleneckEntry> = {};
  if (isRecord(raw.bottlenecks)) {
    for (const [area, entry] of Object.entries(raw.bottlenecks)) {
      if (!isRecord(entry) || !isLevel(entry.level)) continue;
      bottlenecks[area] = {
        level: entry.level,
        evidence: str(entry.evidence),
        updated: str(entry.updated),
      };
    }
  }

  const facts = blankFacts();
  if (isRecord(raw.facts)) {
    for (const key of FACT_KEYS) facts[key] = finiteOrNull(raw.facts[key]);
  }

  const quality = blankQuality();
  if (isRecord(raw.quality)) {
    for (const key of QUALITY_KEYS) quality[key] = str(raw.quality[key]);
  }

  const history: HistoryEntry[] = recordsOf(raw.history).map((h) => ({
    when: str(h.when),
    kind: str(h.kind),
    note: str(h.note),
  }));

  return {
    schemaVersion: 1,
    node,
    stage: NODES[node].stage,
    status: str(raw.status) || DEFAULT_STATUS,
    answers: recordsOf(raw.answers).map((a) => ({
      when: str(a.when),
      answer: str(a.answer),
      node: str(a.node),
    })),
    bottlenecks,
    facts,
    quality,
    objections: recordsOf(raw.objections).map((o) => ({ when: str(o.when), name: str(o.name) })),
    history: history.slice(0, HISTORY_CAP),
    lastAnswer: str(raw.lastAnswer),
    pendingObjection: str(raw.pendingObjection) || null,
    returnNode: isNodeKey(raw.returnNode) ? raw.returnNode : null,
    notes: str(raw.notes),
    profile: isRecord(raw.profile)
      ? { role: str(raw.profile.role), crm: str(raw.profile.crm) }
      : { role: '', crm: '' },
  };
}

// ---------------------------------------------------------------------------
// Internal transitions (operate on an already-cloned state)
// ---------------------------------------------------------------------------

function pushHistory(s: DiagnosisData, kind: string, note: string, when: string): void {
  s.history.unshift({ when, kind, note });
  if (s.history.length > HISTORY_CAP) s.history.length = HISTORY_CAP;
}

function setNode(s: DiagnosisData, key: string): void {
  if (!isNodeKey(key)) return;
  s.node = key;
  s.stage = NODES[key].stage;
}

function evidence(
  s: DiagnosisData,
  key: string | undefined,
  level: EvidenceLevel | undefined,
  statement: string,
  when: string,
): void {
  if (!key || !isLevel(level)) return;
  const oldLevel: EvidenceLevel = hasOwn(s.bottlenecks, key) ? s.bottlenecks[key].level : 'none';
  if (LEVEL[level] >= LEVEL[oldLevel]) {
    s.bottlenecks[key] = { level, evidence: statement, updated: when };
  }
}

function record(
  s: DiagnosisData,
  label: string,
  target: string,
  area: string | undefined,
  level: EvidenceLevel | undefined,
  when: string,
): void {
  let dest = target;
  const note = label.trim();
  s.lastAnswer = note;
  s.answers.push({ when, answer: note, node: s.node });
  pushHistory(s, 'Resposta', note, when);
  if (area) evidence(s, area, level, note, when);

  if (s.node === 'qualification') {
    s.quality.priority = note;
    s.quality.timing = note;
  }
  if (s.node === 'stakeholders') s.quality.authority = note;
  if (s.node === 'value_check' || s.node === 'quick_context') s.quality.desiredOutcome = note;
  if (s.node === 'send_summary' && /autorizou envio/i.test(note)) {
    s.quality.nextStep = note;
    s.quality.followUp = note;
  }
  if (/follow.up|retorno|acompanhar os contatos/i.test(note) && (!area || area === 'Follow-up')) {
    evidence(s, 'Follow-up', level || 'hypothesis', note, when);
  }
  if (/decido|participo da decisão|decidimos em conjunto|outra pessoa conduz/i.test(note)) {
    s.quality.authority = note;
  }
  if (/não é prioridade|sem prazo|agora não/i.test(note)) {
    s.quality.priority = note;
    s.quality.timing = note;
  }
  if (/afeta.*meta|impacto.*receita|retrabalho|perdemos muitos/i.test(note)) s.quality.impact = note;
  if (/avaliando melhorias/i.test(note)) s.quality.timing = note;
  if (/não quero continuar|não tenho interesse|prefiro encerrar/i.test(note)) dest = 'end_no_interest';

  if (dest === 'meeting_form') {
    setNode(s, 'meeting');
    return;
  }
  if (dest === 'numbers' && s.node === 'numbers') return;

  setNode(s, dest);
  if (dest === 'end_no_interest') s.status = 'Sem interesse';
  else if (dest === 'end_followup') s.status = 'Próximo passo combinado';
  else if (dest === 'end_satisfied') s.status = 'Sem oportunidade no momento';
}

function handleObjectionChoice(
  s: DiagnosisData,
  index: number,
  script: Script,
  when: string,
): { state: DiagnosisData; effect: Effect } {
  const name = s.pendingObjection ?? '';
  const cfg = hasOwn(script.objections, name) ? script.objections[name] : undefined;
  if (!cfg) return { state: s, effect: null };
  const label = cfg.choices[index];
  if (!label) return { state: s, effect: null };

  s.lastAnswer = label;
  s.answers.push({ when, answer: label, node: 'objection:' + name });
  pushHistory(s, 'Objeção — resposta', label, when);
  s.pendingObjection = null;

  if (/não quero continuar|não tenho interesse|encerrar ligação/i.test(label)) {
    setNode(s, 'end_no_interest');
    s.status = 'Sem interesse';
  } else if (/marcar|nós dois|mapear/i.test(label)) {
    setNode(s, 'invite');
  } else if (/follow.up|acompanhamento|contatos/i.test(label)) {
    evidence(s, 'Follow-up', 'hypothesis', label, when);
    setNode(s, 'followup_process');
  } else if (/conversão/i.test(label)) {
    evidence(s, 'Conversão', 'hypothesis', label, when);
    setNode(s, 'conversion_process');
  } else if (/integraç|manual|falta treinamento/i.test(label)) {
    setNode(s, 'crm_integrations');
  } else if (/outro momento|retomar mais tarde|não é prioridade/i.test(label)) {
    setNode(s, 'not_now');
  } else if (/controle|organização|gestão/i.test(label)) {
    setNode(s, 'team_process');
  } else if (/enviar|envie|resumo|apresentação/i.test(label)) {
    setNode(s, 'send_summary');
  } else {
    setNode(s, s.returnNode || 'value_check');
  }
  s.returnNode = null;

  return { state: s, effect: effectFor(s) };
}

function effectFor(s: DiagnosisData): Effect {
  if (s.node === 'meeting') return 'open-meeting';
  if (s.node.startsWith('end_')) return 'call-ended';
  return null;
}

// ---------------------------------------------------------------------------
// Free text analysis
// ---------------------------------------------------------------------------

function normalizeText(s: string): string {
  return String(s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function ptNumber(raw: unknown): number | null {
  if (raw == null) return null;
  let s = String(raw).replace(/[\sR$%]/g, '').trim();
  if (!s) return null;
  if (s.includes('.') && s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (s.includes(',')) s = s.replace(',', '.');
  else if (/^\d{1,3}(?:\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

const FACT_PATTERNS: Array<[keyof Facts, RegExp]> = [
  ['leads', /(\d[\d.,]*)\s*(?:leads?|contatos?|oportunidades?)\s*(?:por mês|mensais?|\/mês|ao mês)?/i],
  ['sales', /(\d[\d.,]*)\s*(?:vendas|contratos?\s+fechados|clientes?\s+fechados)\s*(?:por mês|mensais?|\/mês)?/i],
  ['sellers', /(\d[\d.,]*)\s*(?:vendedores?|comerciais?|SDRs?)/i],
  ['qualified', /(\d[\d.,]*)\s*(?:leads? qualificados|contatos? qualificados)/i],
  ['contacted', /(\d[\d.,]*)\s*(?:leads? contatados|contatos? atendidos)/i],
  ['pending', /(\d[\d.,]*)\s*(?:follow.ups? pendentes|retornos? pendentes)/i],
  ['unattended', /(\d[\d.,]*)\s*(?:contatos? sem atendimento|leads? sem atendimento)/i],
  ['ticket', /(?:ticket\s+m[ée]dio\s*(?:de|:|é)?\s*|R\$\s*)(\d[\d.,]*)/i],
  ['conversion', /(?:convers[ãa]o\s*(?:de|:|é)?\s*)(\d[\d.,]*)\s*%/i],
];

export function extractFacts(text: string): Partial<Facts> {
  const t = String(text ?? '').normalize('NFKC');
  const out: Partial<Facts> = {};
  for (const [key, re] of FACT_PATTERNS) {
    const m = t.match(re);
    if (m) {
      const v = ptNumber(m[1]);
      if (v != null) out[key] = v;
    }
  }
  if (
    out.qualified != null &&
    out.leads === out.qualified &&
    /leads? qualificados/i.test(t) &&
    !/(?:total|recebemos|mensais).*?\d[\d.,]*\s+leads?/i.test(t)
  ) {
    delete out.leads;
  }
  return out;
}

export interface FreeTextAnalysis {
  found: Partial<Facts>;
  followup: boolean;
  crm: boolean;
  qualification: boolean;
  conversion: boolean;
  repudiation: boolean;
}

export function analyzeFreeText(text: string): FreeTextAnalysis {
  const normalized = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  const found = extractFacts(text);
  return {
    found,
    followup:
      /nao conseguim(os)? acompanh|nao fazemos (o )?retorno|perdem(os)? (muitos )?(contatos|leads)|follow.up.*(problema|dificuldade)|sem retorno|falta de retorno/.test(
        normalized,
      ),
    crm: /crm/.test(normalized),
    qualification: /lead(s)? qualificado|oportunidad(es)? qualificada/.test(normalized),
    conversion: /baixa conversao|nao convertem|convertem pouco/.test(normalized),
    repudiation: /nao tenho interesse|nao me ligue/.test(normalized),
  };
}

const NEXT_ON_FREE_TEXT: Record<string, string> = {
  opening: 'challenge',
  challenge: 'custom_challenge',
  custom_challenge: 'custom_impact',
  followup_process: 'followup_visibility',
  followup_visibility: 'followup_impact',
  followup_impact: 'followup_volume',
  followup_volume: 'qualification',
  lead_quality: 'qualification_process',
  acquisition: 'qualification_process',
  qualification_process: 'conversion_process',
  conversion_process: 'conversion_impact',
  conversion_impact: 'numbers',
  attendance: 'attendance_impact',
  attendance_impact: 'numbers',
  team_process: 'team_visibility',
  team_visibility: 'numbers',
  crm_usage: 'crm_adoption',
  crm_adoption: 'value_check',
  crm_integrations: 'value_check',
  healthy: 'challenge',
  custom_impact: 'value_check',
  numbers: 'qualification',
  not_now: 'call_back',
  talk_partner: 'send_summary',
};

function routeFreeText(
  s: DiagnosisData,
  value: string,
  normalized: string,
  parsed: FreeTextAnalysis,
  when: string,
): void {
  const fromNode = s.node;

  if (parsed.repudiation) {
    setNode(s, 'end_no_interest');
    s.status = 'Sem interesse';
    return;
  }

  // Melhoria sobre o legado: a dor relatada em texto livre vira evidencia em qualquer etapa
  // (o legado so registrava a partir da sondagem). A navegacao abaixo nao muda.
  if (parsed.followup) evidence(s, 'Follow-up', 'reported', value, when);
  if (parsed.conversion) evidence(s, 'Conversão', 'reported', value, when);
  if (parsed.qualification) evidence(s, 'Qualificação', 'reported', value, when);

  if (fromNode === 'quick_qualify') {
    if (/outra pessoa|nao sou|nao cuido|nao responsavel/.test(normalized)) setNode(s, 'referral');
    else if (
      /nao e prioridade|sem prioridade|nao esta na pauta|nao temos iniciativa|nao estamos avaliando|nada no momento|nao por agora|^nao[.! ]*$/.test(
        normalized,
      )
    )
      setNode(s, 'not_now');
    else if (/ja temos|fornecedor|solucao atual|crm|satisfeit/.test(normalized)) setNode(s, 'existing_solution');
    else setNode(s, 'quick_context');
    return;
  }

  if (fromNode === 'existing_solution') {
    if (/atende bem|funciona bem|satisfeit|resolvido|nao queremos mudar/.test(normalized)) setNode(s, 'end_satisfied');
    else setNode(s, 'quick_context');
    return;
  }

  if (fromNode === 'quick_context') {
    s.quality.desiredOutcome = value;
    const area = /site|presenca digital|pagina/.test(normalized)
      ? 'Presença digital e site'
      : /lead|oportunidade|captacao|atrair/.test(normalized)
        ? 'Geração de leads'
        : /atendimento|retorno|follow.up/.test(normalized)
          ? 'Atendimento'
          : /convers/.test(normalized)
            ? 'Conversão'
            : /automat/.test(normalized)
              ? 'Automação'
              : '';
    if (area) evidence(s, area, 'reported', value, when);
    setNode(s, /aprofund|detalh|exemplo/.test(normalized) ? 'custom_challenge' : 'invite');
    return;
  }

  if (fromNode === 'qualification') {
    s.quality.priority = value;
    s.quality.timing = value;
    setNode(s, /nao e prioridade|sem prazo|nao esta na pauta/.test(normalized) ? 'not_now' : 'stakeholders');
    return;
  }

  if (fromNode === 'stakeholders') {
    s.quality.authority = value;
    setNode(s, 'invite');
    return;
  }

  if (fromNode === 'value_check') {
    s.quality.desiredOutcome = value;
    setNode(s, 'qualification');
    return;
  }

  if (['call_back', 'followup_permission', 'referral'].includes(fromNode)) {
    s.quality.followUp = value;
    s.quality.nextStep = (fromNode === 'referral' ? 'Indicação registrada: ' : 'Retomada autorizada: ') + value;
    setNode(s, 'end_followup');
    return;
  }

  if (fromNode === 'send_summary') {
    s.quality.followUp = value;
    s.quality.nextStep = 'Resumo solicitado: ' + value;
    setNode(s, 'end_followup');
    return;
  }

  if (fromNode === 'invite') {
    if (/sim|agendar|marcar|vamos escolher/.test(normalized)) setNode(s, 'meeting');
    else if (/resumo|email|whatsapp/.test(normalized)) setNode(s, 'send_summary');
    else if (/socio|decisor|incluir/.test(normalized)) setNode(s, 'talk_partner');
    else if (/nao e o momento|depois|mais tarde/.test(normalized)) setNode(s, 'not_now');
    return;
  }

  const inFollowup = ['followup_process', 'followup_visibility', 'followup_impact', 'followup_volume'].includes(fromNode);
  const inConversion = ['conversion_process', 'conversion_impact'].includes(fromNode);

  if (parsed.followup && !inFollowup) {
    evidence(s, 'Follow-up', 'reported', value, when);
    setNode(s, 'followup_process');
    return;
  }
  if (parsed.conversion && !inConversion) {
    evidence(s, 'Conversão', 'reported', value, when);
    setNode(s, 'conversion_process');
    return;
  }
  if (parsed.qualification && !['lead_quality', 'qualification_process'].includes(fromNode)) {
    evidence(s, 'Qualificação', 'reported', value, when);
    setNode(s, 'lead_quality');
    return;
  }
  if (parsed.crm && !['crm_usage', 'crm_adoption', 'crm_integrations'].includes(fromNode)) {
    if (/nao|dificuld|manual|atualiz/.test(normalized)) evidence(s, 'Gestão comercial', 'reported', value, when);
    setNode(s, 'crm_usage');
    return;
  }

  if (
    Object.keys(parsed.found).length > 0 &&
    ['numbers', 'followup_volume', 'attendance_impact', 'conversion_impact', 'team_visibility'].includes(fromNode)
  ) {
    setNode(s, 'qualification');
  } else if (hasOwn(NEXT_ON_FREE_TEXT, fromNode)) {
    setNode(s, NEXT_ON_FREE_TEXT[fromNode]);
  }
}

// ---------------------------------------------------------------------------
// Public transitions
// ---------------------------------------------------------------------------

export function choose(
  state: DiagnosisData,
  index: number,
  script: Script,
  now: Date = new Date(),
): { state: DiagnosisData; effect: Effect } {
  const next = clone(state);
  const when = iso(now);
  if (next.pendingObjection) return handleObjectionChoice(next, index, script, when);

  const choice = nodeOf(script, next.node).choices[index];
  if (!choice) return { state: next, effect: null };

  const label = renderTemplate(choice.label, { marca: script.marca });
  record(next, label, choice.target, choice.area, choice.level, when);
  return { state: next, effect: effectFor(next) };
}

export function registerObjection(state: DiagnosisData, name: string, now: Date = new Date()): DiagnosisData {
  const s = clone(state);
  const when = iso(now);
  s.returnNode = s.node;
  s.pendingObjection = name;
  s.objections.push({ when, name });
  pushHistory(s, 'Objeção', name, when);
  if (name === 'Não tenho interesse') s.status = 'Sem interesse';
  return s;
}

export function submitFreeText(
  state: DiagnosisData,
  text: string,
  now: Date = new Date(),
): { state: DiagnosisData; factsFound: Partial<Facts> } {
  const s = clone(state);
  const value = String(text ?? '').trim();
  if (!value) return { state: s, factsFound: {} };

  const when = iso(now);
  const parsed = analyzeFreeText(value);
  const normalized = normalizeText(value);

  s.lastAnswer = value;
  s.answers.push({ when, answer: value, node: s.node });
  pushHistory(s, 'Resposta livre', value, when);

  for (const key of FACT_KEYS) {
    const v = parsed.found[key];
    if (v !== undefined) s.facts[key] = v;
  }

  routeFreeText(s, value, normalized, parsed, when);
  return { state: s, factsFound: parsed.found };
}

export function goToStage(state: DiagnosisData, stageIndex: number): DiagnosisData {
  const s = clone(state);
  const target = STAGE_TARGETS[stageIndex];
  if (typeof target === 'string') setNode(s, target);
  return s;
}

export function setQuality(state: DiagnosisData, key: keyof Quality, value: string): DiagnosisData {
  const s = clone(state);
  if ((QUALITY_KEYS as readonly string[]).includes(key)) s.quality[key] = String(value ?? '');
  return s;
}

export function setFact(state: DiagnosisData, key: keyof Facts, value: number | null): DiagnosisData {
  const s = clone(state);
  if ((FACT_KEYS as readonly string[]).includes(key)) s.facts[key] = finiteOrNull(value);
  return s;
}

/** Sets a bottleneck explicitly (manual edit). Level 'none' removes the entry. */
export function setBottleneck(
  state: DiagnosisData,
  area: string,
  level: EvidenceLevel,
  statement: string,
  now: Date = new Date(),
): DiagnosisData {
  const s = clone(state);
  const key = String(area ?? '').trim();
  if (!key || !isLevel(level)) return s;
  if (level === 'none') {
    delete s.bottlenecks[key];
  } else {
    s.bottlenecks[key] = { level, evidence: String(statement ?? '').trim(), updated: iso(now) };
  }
  return s;
}

export function removeBottleneck(state: DiagnosisData, area: string): DiagnosisData {
  const s = clone(state);
  delete s.bottlenecks[area];
  return s;
}

export function setNotes(state: DiagnosisData, text: string): DiagnosisData {
  const s = clone(state);
  s.notes = String(text ?? '');
  return s;
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

export function renderTemplate(text: string, values: Record<string, string | null | undefined>): string {
  return text.replace(/\{(\w+)\}/g, (match: string, key: string) => {
    const v = hasOwn(values, key) ? values[key] : undefined;
    return typeof v === 'string' ? v : match;
  });
}

export function spokenName(nome?: string | null, empresa?: string | null): string {
  const name = String(nome || '').trim();
  const company = String(empresa || '').trim();
  if (
    !name ||
    name.toLowerCase() === company.toLowerCase() ||
    /\b(?:ltda|eireli|s\.?a\.?|mei|me|epp|empresa|corretora|cl[ií]nica|imobili[aá]ria|escrit[oó]rio)\b/i.test(name)
  ) {
    return '';
  }
  return name.split(/\s+/)[0];
}

function templateValues(script: Script, ctx: SpeechContext): Record<string, string> {
  return {
    vendedor: ctx.vendedor?.trim() || 'nossa equipe',
    marca: ctx.marca?.trim() || script.marca,
  };
}

export function currentSpeech(state: DiagnosisData, script: Script, ctx: SpeechContext = {}): string {
  if (state.pendingObjection) {
    const obj = hasOwn(script.objections, state.pendingObjection) ? script.objections[state.pendingObjection] : undefined;
    return renderTemplate(obj ? obj.speech : '', templateValues(script, ctx));
  }

  const name = spokenName(ctx.nome, ctx.empresa);

  if (state.node === 'opening') {
    let text = nodeOf(script, 'opening').speech;
    if (!name) {
      text = text.replace('Olá, {nome}. ', 'Olá, tudo bem? ').replace('{nome}, ', '');
    }
    return renderTemplate(text, {
      ...templateValues(script, ctx),
      nome: name || 'tudo bem',
    });
  }

  const segmentSpeech =
    ctx.segmento && hasOwn(SEGMENT_SPEECH, ctx.segmento) && hasOwn(SEGMENT_SPEECH[ctx.segmento], state.node)
      ? SEGMENT_SPEECH[ctx.segmento][state.node]
      : undefined;
  const text = segmentSpeech ?? nodeOf(script, state.node).speech;

  const primary = primaryBottleneck(state);
  return renderTemplate(text, {
    ...templateValues(script, ctx),
    nome: name || 'tudo bem',
    empresa: String(ctx.empresa || '').trim() || 'empresa',
    desafio: primary ? primary[0] : 'esse ponto',
    proximo: state.quality.nextStep || 'nenhum novo contato ficou combinado',
  });
}

export function currentGoal(state: DiagnosisData, script: Script, ctx: SpeechContext = {}): string {
  const values = templateValues(script, ctx);
  if (state.pendingObjection) {
    const obj: ScriptObjection | undefined = hasOwn(script.objections, state.pendingObjection)
      ? script.objections[state.pendingObjection]
      : undefined;
    return renderTemplate(obj ? obj.goal : '', values);
  }
  return renderTemplate(nodeOf(script, state.node).goal, values);
}

export function currentChoices(state: DiagnosisData, script: Script, ctx: SpeechContext = {}): string[] {
  const values = templateValues(script, ctx);
  if (state.pendingObjection) {
    const obj = hasOwn(script.objections, state.pendingObjection) ? script.objections[state.pendingObjection] : undefined;
    return obj ? obj.choices.map((label) => renderTemplate(label, values)) : [];
  }
  return nodeOf(script, state.node).choices.map((c) => renderTemplate(c.label, values));
}

export function currentStep(state: DiagnosisData): string {
  if (state.pendingObjection) return 'OBJEÇÃO';
  return (STAGES[state.stage] ?? '').toUpperCase();
}

export function getCalc(f: Facts): Calc {
  const leads = f.leads != null ? Number(f.leads) : null;
  const sales = f.sales != null ? Number(f.sales) : null;
  const conversion =
    leads != null && leads > 0 && sales != null
      ? (sales / leads) * 100
      : f.conversion != null
        ? Number(f.conversion)
        : null;
  const estimated =
    sales == null && leads != null && conversion != null ? Math.round((leads * conversion) / 100) : sales;
  const unconverted = leads != null && estimated != null ? Math.max(0, leads - estimated) : null;
  return {
    leads,
    sales: estimated,
    conversion,
    unconverted,
    revenue: estimated != null && f.ticket != null ? estimated * f.ticket : null,
  };
}

export function primaryBottleneck(state: DiagnosisData): [string, BottleneckEntry] | null {
  const entries = Object.entries(state.bottlenecks);
  entries.sort((a, b) => LEVEL[b[1].level] - LEVEL[a[1].level]);
  return entries[0] ?? null;
}

export function confirmedProblems(state: DiagnosisData): string[] {
  return Object.keys(state.bottlenecks).filter((k) => state.bottlenecks[k].level === 'confirmed');
}

export function summaryText(state: DiagnosisData): string {
  if (state.pendingObjection) {
    return (
      'Objeção registrada: ' + state.pendingObjection + '. Investigue com uma pergunta curta, sem pressupor necessidades.'
    );
  }
  const b = primaryBottleneck(state);
  if (!b) {
    return 'Diagnóstico ainda em aberto. Investigue o processo atual antes de recomendar uma solução.';
  }
  const [name, info] = b;
  const descriptions: Record<string, string> = {
    'Follow-up': 'O prospect relatou dificuldade para acompanhar contatos e realizar retornos.',
    Conversão: 'Há sinais de que oportunidades não avançam em alguma etapa do funil.',
    'Gestão comercial': 'Há indícios de falta de visibilidade ou padronização comercial.',
    Qualificação: 'Pode existir desalinhamento entre quantidade de contatos e perfil dos leads.',
    Atendimento: 'Há dificuldades relatadas no primeiro contato com oportunidades.',
    Produtividade: 'A equipe pode estar gastando esforço com atividades pouco eficientes.',
    Automação: 'Algumas atividades parecem depender de ações manuais.',
    'Geração de leads': 'O volume de oportunidades pode estar abaixo da necessidade.',
    'Presença digital e site': 'O prospect quer avaliar o site ou a presença digital da empresa.',
  };
  const heading =
    info.level === 'confirmed'
      ? 'Problema confirmado'
      : info.level === 'hypothesis'
        ? 'Possível gargalo'
        : 'Evidência relatada';
  const impact =
    info.level === 'hypothesis'
      ? 'Ainda precisamos verificar o impacto.'
      : 'O impacto financeiro ainda não está comprovado.';
  return `${heading}: ${hasOwn(descriptions, name) ? descriptions[name] : name} ${impact}`;
}

export function qualityClass(state: DiagnosisData): { label: string; temperature: Temperature | null } {
  if (state.status === 'Sem interesse') return { label: 'Não qualificado', temperature: null };
  const ev = Object.values(state.bottlenecks).filter((v) => LEVEL[v.level] >= 2).length;
  const authority = !!state.quality.authority;
  const priority = /Alta|avalia/i.test(state.quality.priority || '');
  if (ev > 0 && authority && priority) return { label: 'Quente', temperature: 'HOT' };
  if (ev > 0 || state.answers.length >= 3) return { label: 'Morno', temperature: 'WARM' };
  return { label: 'Frio / em descoberta', temperature: 'COLD' };
}

export function stageProgress(state: DiagnosisData): number {
  const pct = Math.round(((state.stage + 1) / STAGES.length) * 100);
  return Math.max(0, Math.min(100, pct));
}

export function formatNumber(value: number | null | undefined, maxFractionDigits = 0): string {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: maxFractionDigits }).format(Number(value));
}

export function formatMoney(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(Number(value))) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function buildBrief(state: DiagnosisData, lead: LeadInfo, script: Script): string {
  const c = getCalc(state.facts);
  const diagnosis =
    Object.entries(state.bottlenecks)
      .map(([k, v]) => `${k}: ${LEVEL_NAMES[v.level]} — ${v.evidence}`)
      .join('\n') || 'Ainda não avaliado';
  const notes = state.notes || 'Nenhuma';
  const answers = state.answers.map((a) => '- ' + a.answer).join('\n') || 'Nenhuma';
  return `INFINITY SALES COPILOT — BRIEFING COMERCIAL
Empresa: ${lead.company || 'Não informado'}
Contato: ${lead.name || 'Não informado'}
Cargo: ${state.profile.role || 'Não informado'}
Segmento: ${lead.segment || 'Não informado'}
E-mail: ${lead.email || 'Não informado'}
Telefone: ${lead.phone || 'Não informado'}
Cidade: ${lead.city || 'Não informado'}
CRM: ${state.profile.crm || 'Não informado'}
Status: ${state.status}

DIAGNÓSTICO
${diagnosis}

INDICADORES
Leads mensais: ${formatNumber(c.leads)}
Vendas: ${formatNumber(c.sales)}
Conversão: ${c.conversion != null ? formatNumber(c.conversion, 2) + '%' : '—'}
Leads não convertidos: ${formatNumber(c.unconverted)}
Ticket: ${formatMoney(state.facts.ticket)}
Receita estimada: ${formatMoney(c.revenue)}

QUALIFICAÇÃO
Prioridade: ${state.quality.priority || '—'}
Autoridade: ${state.quality.authority || '—'}
Impacto: ${state.quality.impact || '—'}
Resultado desejado: ${state.quality.desiredOutcome || '—'}
Próximo passo autorizado: ${state.quality.nextStep || '—'}

RESPOSTAS
${answers}

NOTAS
${notes}

Todos os dados são declarados, estimados matematicamente ou classificados como hipótese; números não informados não foram inventados.`;
}
