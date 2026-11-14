// Tipos compartilhados das Configurações WhatsApp (ver wa-v2/CONTRACT.md).

export type WaChannelStatus = 'PENDING' | 'QR_PENDING' | 'CONNECTED' | 'DISCONNECTED' | 'ERROR';

export interface WaChannel {
  id: number;
  name: string;
  instanceName: string;
  phoneNumber: string | null;
  status: WaChannelStatus;
  isDefault: boolean;
  paused: boolean;
  inboxEnabled: boolean;
  lastErrorCode: string | null;
  lastCheckedAt: string | null;
  connectedAt: string | null;
  exclusiveOwnerId: number | null;
  defaultQueueId: number | null;
  voiceEnabled: boolean;
}

export interface WaQrResult {
  channelId: number;
  qrCode: string | null;
  expiresAt: string | null;
  status: WaChannelStatus;
  phoneNumber: string | null;
}

export interface WaConnectionState {
  channelId: number;
  status: WaChannelStatus;
  connected: boolean;
  paused: boolean;
  phoneNumber: string | null;
  lastCheckedAt: string | null;
  lastErrorCode: string | null;
  checking?: boolean;
}

export interface EvolutionImportCandidate {
  instanceId: string;
  name: string;
  phoneNumber: string | null;
}

export interface EvolutionImportAvailability {
  items: EvolutionImportCandidate[];
  total: number;
  webhookProtectedCount: number;
  disconnectedCount: number;
  alreadyImportedCount: number;
}

export type VoiceReadinessReason =
  | 'PAIRING_REQUIRED'
  | 'PAIRING_PENDING'
  | 'SESSION_MISSING'
  | 'NUMBER_MISMATCH'
  | 'SESSION_OFFLINE'
  | 'PROVIDER_UNAVAILABLE'
  | 'VALIDATION_REQUIRED'
  | 'VOICE_DISABLED'
  | 'CHANNEL_PAUSED'
  | 'READY';

export interface VoicePairing {
  sessionCreated: boolean;
  ready: boolean;
  reason: VoiceReadinessReason;
  state: string;
  qrCode: string | null;
}

export interface VoiceCapacity {
  configured: number;
  verified: number;
  effective: number;
  occupied: number;
  available: number;
  voiceEnabled: boolean;
  paused: boolean;
  sessionState: string;
  readinessReason: VoiceReadinessReason;
}

export type WaScope = 'TENANT' | 'GROUP' | 'CHANNEL';

export interface WaScopeRef {
  scope: WaScope;
  channelId?: number | null;
  channelGroupId?: number | null;
}

export interface WaUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface WaChannelGroup {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  members: { channelId: number }[];
}

export type WaDistributionMethod = 'ROUND_ROBIN' | 'LEAST_BUSY' | 'RANDOM';

export interface WaQueue extends WaScopeRef {
  id: number;
  name: string;
  description: string | null;
  maxSimultaneous: number;
  enforceLimit: boolean;
  distributionMethod: WaDistributionMethod;
  position: number;
  active: boolean;
  agents: { userId: number; position: number; user: { id: number; name: string } }[];
}

export type WaRoutingCondition = 'KEYWORD' | 'DDD' | 'FIRST_CONTACT' | 'RETURNING' | 'ANY';

export interface WaRoutingRule extends WaScopeRef {
  id: number;
  name: string;
  priority: number;
  conditionType: WaRoutingCondition;
  conditionValue: string;
  queueId: number;
  returnToOriginalAgent: boolean;
  active: boolean;
}

export interface WaBusinessHour {
  weekday: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export type WaAutoMessageType = 'WELCOME' | 'RETURNING' | 'OUT_OF_HOURS' | 'IN_QUEUE' | 'CLOSING';

export interface WaAutoMessage {
  type: WaAutoMessageType;
  content: string;
  active: boolean;
}

export interface WaStage {
  id: number;
  name: string;
  position: number;
  color: string;
  isDefault: boolean;
  isFinal: boolean;
  finalType: 'WON' | 'LOST' | null;
}

export type WaAgentStatusType = 'ONLINE' | 'AWAY' | 'PAUSED' | 'OFFLINE';

export interface WaAgentStatus {
  userId: number;
  name: string;
  status: WaAgentStatusType;
  reason: string | null;
  lastStatusChange: string;
  openConversations: number;
}

export type WaFlowNodeType = 'START' | 'CONDITION' | 'WAIT' | 'TASK' | 'REVIEW' | 'END';

export interface WaFlowNode {
  id: string;
  type: WaFlowNodeType;
  label: string;
  config: Record<string, unknown>;
}

export interface WaFlowGraph {
  nodes: WaFlowNode[];
  edges: { from: string; to: string; label?: string }[];
}

export interface WaFlowVersion {
  id: number;
  name: string;
  graph: WaFlowGraph;
  publishedAt: string | null;
  createdAt: string;
}

export interface WaFlowRun {
  id: number;
  conversationId: number;
  versionId: number;
  ownerId: number;
  status: 'RUNNING' | 'WAITING' | 'DONE' | 'CANCELLED';
  currentNode: string;
  dueAt: string | null;
  history: { node: string; at: string; decision?: string; by?: number }[];
}
