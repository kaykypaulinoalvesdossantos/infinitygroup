interface Field {
  key: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  type?: 'url' | 'email';
}

export const integrations = {
  evolution: {
    title: 'WhatsApp · Mensagens',
    description: 'Conecte a instância Evolution Go usada para enviar mensagens pelo CRM.',
    secretLabel: 'Token da instância',
    fields: [{ key: 'url', label: 'URL da Evolution Go', type: 'url', placeholder: 'https://evolution.seudominio.com' }],
  },
  wacalls: {
    title: 'WhatsApp · Ligações',
    description: 'Conecte uma sessão WaCalls pareada ao número comercial. Informe o identificador ou o nome da sessão.',
    secretLabel: 'Token da API WaCalls',
    fields: [
      { key: 'url', label: 'URL da API WaCalls', type: 'url', placeholder: 'https://voz.seudominio.com' },
      { key: 'sessionId', label: 'Identificador da sessão', optional: true },
      { key: 'sessionName', label: 'Nome da sessão', optional: true },
    ],
  },
  email: {
    title: 'E-mail',
    description: 'Configure o servidor SMTP e a identidade usada nos e-mails do sistema.',
    secretLabel: 'Senha SMTP ou senha de aplicativo',
    fields: [
      { key: 'host', label: 'Servidor SMTP', placeholder: 'smtp.hostinger.com' },
      { key: 'port', label: 'Porta SMTP com TLS', placeholder: '465, 587 ou 2525' },
      { key: 'username', label: 'Usuário SMTP' },
      { key: 'senderEmail', label: 'E-mail do remetente', type: 'email', optional: true },
      { key: 'senderName', label: 'Nome do remetente', optional: true },
    ],
  },
  'google-calendar': {
    title: 'Google Agenda',
    description: 'Configure o cliente OAuth do sistema e autorize sua conta para sincronizar reuniões.',
    secretLabel: 'Segredo do cliente OAuth',
    fields: [
      { key: 'clientId', label: 'ID do cliente OAuth' },
      { key: 'redirectUri', label: 'URL de callback autorizada', type: 'url', placeholder: 'https://api.seudominio.com/crm-leads/google-calendar/oauth/callback' },
    ],
  },
} satisfies Record<string, { title: string; description: string; secretLabel: string; fields: Field[] }>;

export type IntegrationKey = keyof typeof integrations;
