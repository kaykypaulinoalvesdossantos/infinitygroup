interface Field {
  key: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  type?: 'url' | 'email';
}

export const integrations = {
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
