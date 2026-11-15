// Generated from the legacy diagnostico-integrado script. Do not edit by hand:
// text is copied verbatim, except the placeholders {vendedor} (seller name) and {marca} (company brand).
import type { EvidenceLevel, ScriptNode } from './types';

export const STAGES: string[] = ['Abertura', 'Pergunta objetiva', 'Contexto e sondagem', 'Diagnóstico', 'Impacto relatado', 'Prioridade e valor', 'Próximo passo', 'Confirmação'];

export const SEGMENTS: string[] = ['Empresas B2B', 'Clínicas médicas e odontológicas', 'Academias', 'Corretoras de seguros', 'Imobiliárias', 'Escritórios de serviços', 'Operações SDR / Closer'];

export const BOTTLENECKS: string[] = ['Presença digital e site', 'Geração de leads', 'Qualificação', 'Atendimento', 'Conversão', 'Follow-up', 'Gestão comercial', 'Produtividade', 'Automação'];

export const OBJECTIONS: string[] = ['Já temos CRM', 'Estamos satisfeitos', 'Não temos orçamento', 'Não é prioridade', 'Não tenho tempo', 'Manda por e-mail', 'Manda no WhatsApp', 'Já tentamos automação', 'Nossa equipe não utiliza CRM', 'Não queremos trocar de fornecedor', 'Preciso falar com meu sócio', 'Não acredito que isso aumente nossas vendas', 'Estamos com muitos projetos', 'Nosso processo já funciona', 'Não tenho interesse'];

export const OBJECTION_DATA: Record<string, { speech: string; goal: string; choices: string[] }> = {
  'Já temos CRM': {
    speech: 'Perfeito, então vocês já possuem uma estrutura. Hoje o CRM acompanha bem todo o processo ou existem etapas que a equipe ainda controla manualmente?',
    goal: 'Entender utilização e eventuais lacunas sem presumir necessidade de troca.',
    choices: ['Funciona muito bem', 'Temos dificuldades', 'A equipe não utiliza', 'Faltam integrações', 'Não sei responder'],
  },
  'Estamos satisfeitos': {
    speech: 'Que bom. Para eu entender: o que hoje funciona melhor na operação comercial de vocês?',
    goal: 'Descobrir se existe alguma necessidade real sem criar um problema artificial.',
    choices: ['Estamos bem estruturados', 'O processo ainda é manual', 'Fazemos tudo internamente', 'Não quero continuar'],
  },
  'Não temos orçamento': {
    speech: 'Entendo. Antes de falar de investimento, faria sentido entender se existe algum gargalo com impacto relevante ou hoje isso realmente não é uma prioridade?',
    goal: 'Diferenciar falta de orçamento de ausência de valor ou urgência.',
    choices: ['Temos uma dor, mas sem verba', 'Não é prioridade', 'Podemos avaliar depois', 'Não quero continuar'],
  },
  'Não é prioridade': {
    speech: 'Claro. O que está recebendo mais atenção da equipe comercial neste momento?',
    goal: 'Compreender prioridades atuais e respeitar o momento.',
    choices: ['Estamos focados em aquisição', 'Estamos focados em operação', 'Podemos conversar depois', 'Não quero continuar'],
  },
  'Não tenho tempo': {
    speech: 'Sem problema, respeito seu tempo. Prefere que eu envie um resumo curto ou existe um momento melhor para conversarmos?',
    goal: 'Buscar permissão para um próximo contato, sem insistência.',
    choices: ['Enviar resumo', 'Falar em outro momento', 'Não quero continuar'],
  },
  'Manda por e-mail': {
    speech: 'Com certeza. Para não te enviar algo genérico, qual tema seria mais útil: acompanhamento dos leads, organização do time ou conversão?',
    goal: 'Personalizar o conteúdo solicitado e evitar uma apresentação irrelevante.',
    choices: ['Acompanhamento de leads', 'Organização do time', 'Conversão', 'Só envie uma apresentação', 'Não quero continuar'],
  },
  'Manda no WhatsApp': {
    speech: 'Posso enviar, sim. Que parte faz mais sentido eu resumir: o processo comercial ou formas de acompanhar os contatos?',
    goal: 'Confirmar interesse e tema relevante para a mensagem.',
    choices: ['Processo comercial', 'Acompanhamento de contatos', 'Só envie um resumo', 'Não quero continuar'],
  },
  'Já tentamos automação': {
    speech: 'Entendi. O que não funcionou naquela experiência: implantação, adesão do time ou resultados esperados?',
    goal: 'Compreender o fracasso anterior antes de apresentar qualquer proposta.',
    choices: ['Implantação', 'Adesão da equipe', 'Resultados', 'Não quero continuar'],
  },
  'Nossa equipe não utiliza CRM': {
    speech: 'Isso acontece. Vocês chegaram a entender por que a equipe evita o CRM: excesso de tarefas, treinamento ou falta de encaixe no processo?',
    goal: 'Investigar adesão e atrito operacional.',
    choices: ['Muito trabalho manual', 'Falta treinamento', 'Não se encaixa na rotina', 'Não sei responder'],
  },
  'Não queremos trocar de fornecedor': {
    speech: 'Entendo, e não estou propondo nenhuma troca agora. Existe algum processo ao redor da solução atual que vocês gostariam de melhorar?',
    goal: 'Investigar necessidades complementares sem induzir substituição.',
    choices: ['Não, estamos bem', 'Follow-up', 'Integrações', 'Gestão da equipe', 'Não quero continuar'],
  },
  'Preciso falar com meu sócio': {
    speech: 'Claro, faz sentido alinhar com ele. O que você acha importante levar para essa conversa para avaliarem se vale uma reunião?',
    goal: 'Entender critérios e participantes da decisão.',
    choices: ['Mostrar números', 'Explicar o processo', 'Pode marcar com nós dois', 'Não é prioridade'],
  },
  'Não acredito que isso aumente nossas vendas': {
    speech: 'É justo questionar. Não tenho como prometer crescimento. Podemos primeiro mapear o processo e verificar se há alguma oportunidade mensurável?',
    goal: 'Evitar promessas e propor uma análise verificável.',
    choices: ['Podemos mapear', 'Quero entender como', 'Não tenho interesse'],
  },
  'Estamos com muitos projetos': {
    speech: 'Imagino. Há alguma iniciativa comercial em andamento que já esteja tentando resolver esse problema?',
    goal: 'Identificar sobreposição e oportunidade sem criar mais carga.',
    choices: ['Já temos projeto parecido', 'Estamos reorganizando o time', 'Retomar mais tarde', 'Não quero continuar'],
  },
  'Nosso processo já funciona': {
    speech: 'Ótimo. O que vocês usam hoje para acompanhar a qualidade dos atendimentos e os retornos aos contatos?',
    goal: 'Verificar se existe espaço real para melhoria.',
    choices: ['Temos indicadores e controle', 'Não medimos tudo', 'Fazemos manualmente', 'Não quero continuar'],
  },
  'Não tenho interesse': {
    speech: 'Tudo bem, agradeço pela atenção. Desejo ótimos resultados para a equipe de vocês.',
    goal: 'Respeitar a recusa e encerrar cordialmente.',
    choices: ['Encerrar ligação'],
  },
};

export const NODES: Record<string, ScriptNode> = {
  'followup_permission': {
    stage: 6,
    goal: 'Registrar data, canal e autorização exatamente como combinados; não criar lembrete sem dados.',
    speech: 'Qual data ou período e qual canal você autoriza para eu retomar o contato?',
    choices: [
      { label: 'Registrar o combinado no campo abaixo', target: 'followup_permission' },
      { label: 'Não quero combinar uma retomada', target: 'end_no_interest' },
    ],
  },
  'stakeholders': {
    stage: 5,
    goal: 'Entender quem participa da decisão e convidar as pessoas certas para a próxima conversa.',
    speech: 'Além de você, quem precisaria participar para avaliar se vale avançar?',
    choices: [
      { label: 'Eu participo da decisão', target: 'invite' },
      { label: 'Decidimos em conjunto', target: 'talk_partner' },
      { label: 'Outra pessoa conduz essa decisão', target: 'talk_partner' },
      { label: 'Ainda não sei quem participaria', target: 'invite' },
    ],
  },
  'custom_impact': {
    stage: 4,
    goal: 'Explorar a consequência prática da situação que o prospect descreveu.',
    speech: 'Quando esse exemplo acontece, qual é a consequência mais importante para a equipe ou para o cliente?',
    choices: [
      { label: 'Atrasa o trabalho', target: 'value_check', area: 'Produtividade', level: 'reported' },
      { label: 'Afeta uma meta ou resultado', target: 'numbers', area: 'Conversão', level: 'reported' },
      { label: 'Gera retrabalho', target: 'value_check', area: 'Produtividade', level: 'reported' },
      { label: 'Ainda não conseguimos avaliar', target: 'value_check' },
      { label: 'Não tem impacto relevante', target: 'value_check' },
    ],
  },
  'call_back': {
    stage: 6,
    goal: 'Respeitar a disponibilidade e pedir autorização para uma nova tentativa.',
    speech: 'Sem problema. Se for conveniente, posso tentar novamente em outro momento? Qual dia ou período costuma ser melhor?',
    choices: [
      { label: 'Pode retornar; vou informar quando no campo abaixo', target: 'followup_permission' },
      { label: 'Prefiro receber um resumo', target: 'send_summary' },
      { label: 'Prefiro encerrar por aqui', target: 'end_no_interest' },
    ],
  },
  'referral': {
    stage: 1,
    goal: 'Encontrar o contato responsável sem pressionar e registrar apenas a indicação recebida.',
    speech: 'Claro. Quem é a pessoa mais indicada para conversar sobre o processo comercial? Se preferir, pode me passar só o nome ou o melhor canal para encontrá-la.',
    choices: [
      { label: 'A pessoa está disponível agora', target: 'quick_qualify' },
      { label: 'Vou registrar a indicação e encerrar por aqui', target: 'end_followup' },
      { label: 'Não consigo indicar alguém', target: 'end_followup' },
    ],
  },
  'opening': {
    stage: 0,
    goal: 'Apresentar {vendedor} e o {marca}, explicar o motivo do contato e pedir permissão para uma pergunta objetiva.',
    speech: 'Olá, {nome}. Me chamo {vendedor}, do time comercial do {marca}. Estou entrando em contato porque apoiamos operações comerciais com automação, inteligência de dados e soluções digitais para organizar processos e buscar mais conversão. {nome}, antes de explicar melhor, posso te fazer uma pergunta bem objetiva sobre o processo comercial de vocês?',
    choices: [
      { label: 'Pode perguntar', target: 'quick_qualify' },
      { label: 'Quero entender melhor o que o {marca} faz', target: 'about_infinity' },
      { label: 'Outra pessoa cuida desse tema', target: 'referral' },
      { label: 'Agora não consigo falar', target: 'call_back' },
      { label: 'Não tenho interesse', target: 'end_no_interest' },
    ],
  },
  'about_infinity': {
    stage: 1,
    goal: 'Explicar a oferta de forma breve e voltar à pergunta de qualificação.',
    speech: 'O {marca} desenvolve sites e software e também trabalha com automação e inteligência artificial. Estou ligando para entender se alguma dessas frentes pode ser relevante para o processo comercial de vocês. Posso fazer uma pergunta rápida?',
    choices: [
      { label: 'Pode perguntar', target: 'quick_qualify' },
      { label: 'Prefiro receber um resumo', target: 'send_summary' },
      { label: 'Não, obrigado', target: 'end_no_interest' },
    ],
  },
  'quick_qualify': {
    stage: 1,
    goal: 'Qualificar interesse com uma pergunta curta; na ligação fria, buscar uma conversa seguinte em vez de fazer uma descoberta longa.',
    speech: 'Hoje vocês têm alguma iniciativa ou ponto a melhorar na presença digital, na entrada de oportunidades ou no atendimento comercial?',
    choices: [
      { label: 'Sim, estamos avaliando uma melhoria', target: 'quick_context' },
      { label: 'Temos um desafio e posso explicar', target: 'custom_challenge' },
      { label: 'Já temos uma solução nessa área', target: 'existing_solution' },
      { label: 'Isso não é prioridade agora', target: 'not_now' },
      { label: 'Prefiro receber informações por e-mail ou WhatsApp', target: 'send_summary' },
      { label: 'Outra pessoa cuida desse tema', target: 'referral' },
      { label: 'Não tenho interesse', target: 'end_no_interest' },
    ],
  },
  'quick_context': {
    stage: 2,
    goal: 'Deixar o prospect escolher o tema que quer melhorar e propor a conversa de diagnóstico; aprofundar somente se ele estiver disponível.',
    speech: 'Entendi. O que vocês gostariam de melhorar primeiro?',
    choices: [
      { label: 'Site ou presença digital', target: 'invite', area: 'Presença digital e site', level: 'reported' },
      { label: 'Atrair e qualificar oportunidades', target: 'invite', area: 'Geração de leads', level: 'reported' },
      { label: 'Organizar o atendimento e os retornos', target: 'invite', area: 'Atendimento', level: 'reported' },
      { label: 'Acompanhar oportunidades e conversão', target: 'invite', area: 'Conversão', level: 'reported' },
      { label: 'Automatizar tarefas comerciais', target: 'invite', area: 'Automação', level: 'reported' },
      { label: 'Tenho alguns minutos para aprofundar agora', target: 'custom_challenge' },
      { label: 'Prefiro detalhar isso em uma reunião', target: 'invite' },
    ],
  },
  'existing_solution': {
    stage: 2,
    goal: 'Entender se a solução atual atende, sem sugerir troca de fornecedor.',
    speech: 'Ótimo. A solução que vocês usam atende bem ao que precisam ou há algum ponto que ainda gostariam de aprimorar?',
    choices: [
      { label: 'Atende bem; podemos encerrar', target: 'end_satisfied' },
      { label: 'Há algo que queremos aprimorar', target: 'quick_context' },
      { label: 'Prefiro não continuar a conversa', target: 'end_no_interest' },
    ],
  },
  'challenge': {
    stage: 3,
    goal: 'Se o prospect tiver disponibilidade para aprofundar, deixá-lo nomear a etapa prioritária antes de investigar causas ou apresentar soluções.',
    speech: 'Pensando no processo comercial atual, qual etapa mereceria mais atenção hoje?',
    choices: [
      { label: 'Atrair oportunidades com o perfil certo', target: 'lead_quality', area: 'Geração de leads', level: 'hypothesis' },
      { label: 'Fazer o primeiro atendimento', target: 'attendance', area: 'Atendimento', level: 'hypothesis' },
      { label: 'Acompanhar e retomar contatos', target: 'followup_process', area: 'Follow-up', level: 'hypothesis' },
      { label: 'Avançar de proposta para venda', target: 'conversion_process', area: 'Conversão', level: 'hypothesis' },
      { label: 'Organizar processo, equipe ou CRM', target: 'team_process', area: 'Gestão comercial', level: 'hypothesis' },
      { label: 'Nenhum ponto prioritário agora', target: 'healthy' },
      { label: 'Outro tema', target: 'custom_challenge' },
    ],
  },
  'followup_process': {
    stage: 2,
    goal: 'Entender o processo atual de retorno sem sugerir que oportunidades estão sendo perdidas.',
    speech: 'Quando alguém demonstra interesse e não avança na primeira conversa, como vocês registram e organizam o próximo contato?',
    choices: [
      { label: 'Planilhas ou agenda individual', target: 'followup_visibility', area: 'Follow-up', level: 'reported' },
      { label: 'Cada vendedor organiza à sua maneira', target: 'followup_visibility', area: 'Gestão comercial', level: 'reported' },
      { label: 'CRM, mas com atualizações irregulares', target: 'crm_adoption', area: 'Automação', level: 'reported' },
      { label: 'Não existe um fluxo definido', target: 'followup_visibility', area: 'Follow-up', level: 'confirmed' },
      { label: 'Há contatos sem retorno no prazo', target: 'followup_impact', area: 'Follow-up', level: 'confirmed' },
      { label: 'Temos um fluxo claro e acompanhado', target: 'healthy' },
    ],
  },
  'followup_visibility': {
    stage: 3,
    goal: 'Verificar como a operação percebe retornos vencidos e quem consegue agir.',
    speech: 'Como vocês percebem que um retorno combinado ficou pendente?',
    choices: [
      { label: 'O sistema avisa o responsável', target: 'followup_impact', area: 'Follow-up', level: 'reported' },
      { label: 'A gestão consulta manualmente', target: 'followup_impact', area: 'Gestão comercial', level: 'reported' },
      { label: 'Só percebemos depois, caso a caso', target: 'followup_impact', area: 'Gestão comercial', level: 'confirmed' },
      { label: 'Não conseguimos acompanhar', target: 'followup_impact', area: 'Follow-up', level: 'confirmed' },
      { label: 'Não sei informar', target: 'followup_impact' },
    ],
  },
  'followup_impact': {
    stage: 4,
    goal: 'Explorar a consequência descrita pelo prospect; aceitar também que não haja impacto relevante.',
    speech: 'Quando um retorno atrasa ou não acontece, o que muda na rotina ou no resultado da equipe?',
    choices: [
      { label: 'A oportunidade fica parada ou esfria', target: 'followup_volume', area: 'Conversão', level: 'reported' },
      { label: 'A equipe refaz tarefas', target: 'followup_volume', area: 'Produtividade', level: 'reported' },
      { label: 'A gestão perde visibilidade', target: 'followup_volume', area: 'Gestão comercial', level: 'reported' },
      { label: 'Ainda não medimos a consequência', target: 'followup_volume' },
      { label: 'Não percebemos impacto relevante', target: 'value_check' },
    ],
  },
  'followup_volume': {
    stage: 4,
    goal: 'Perguntar por uma medida somente se ela existir; não pressionar por estimativas.',
    speech: 'Vocês acompanham algum indicador de retornos pendentes ou oportunidades sem resposta?',
    choices: [
      { label: 'Sim, temos esse indicador', target: 'numbers' },
      { label: 'Temos uma estimativa, mas preciso consultar', target: 'qualification' },
      { label: 'Não acompanhamos esse dado', target: 'qualification', area: 'Gestão comercial', level: 'reported' },
      { label: 'Não tenho essa informação agora', target: 'qualification' },
    ],
  },
  'lead_quality': {
    stage: 2,
    goal: 'Separar falta de volume de falta de aderência, sem concluir que os leads são ruins.',
    speech: 'O principal desafio é ter poucas oportunidades ou receber contatos que não combinam com o perfil que vocês atendem?',
    choices: [
      { label: 'O volume de oportunidades é baixo', target: 'acquisition', area: 'Geração de leads', level: 'reported' },
      { label: 'Chegam contatos fora do perfil', target: 'qualification_process', area: 'Qualificação', level: 'reported' },
      { label: 'O perfil é adequado, mas avançam pouco', target: 'conversion_process', area: 'Conversão', level: 'reported' },
      { label: 'Não sabemos medir aderência', target: 'numbers', area: 'Gestão comercial', level: 'hypothesis' },
    ],
  },
  'acquisition': {
    stage: 3,
    goal: 'Identificar os canais que já geram oportunidades e o que o prospect considera útil.',
    speech: 'Quais canais trazem oportunidades para vocês hoje?',
    choices: [
      { label: 'Indicações', target: 'qualification_process' },
      { label: 'Anúncios ou campanhas', target: 'qualification_process' },
      { label: 'Prospecção ativa', target: 'qualification_process' },
      { label: 'Parcerias ou conteúdo', target: 'qualification_process' },
      { label: 'Não sabemos comparar os canais', target: 'qualification_process', area: 'Gestão comercial', level: 'reported' },
    ],
  },
  'qualification_process': {
    stage: 3,
    goal: 'Verificar se há critérios de qualificação bem definidos.',
    speech: 'Antes de passar um contato ao vendedor, vocês têm critérios claros para dizer se ele está pronto para uma conversa comercial?',
    choices: [
      { label: 'Temos critérios definidos.', target: 'conversion_process' },
      { label: 'Cada vendedor avalia de um jeito.', target: 'conversion_process', area: 'Qualificação', level: 'reported' },
      { label: 'Ainda não qualificamos.', target: 'conversion_process', area: 'Qualificação', level: 'confirmed' },
      { label: 'Não sei como é feito.', target: 'conversion_process' },
    ],
  },
  'conversion_process': {
    stage: 3,
    goal: 'Localizar a etapa em que o avanço diminui, de acordo com a experiência do prospect.',
    speech: 'Em qual etapa vocês percebem mais dificuldade para avançar uma oportunidade?',
    choices: [
      { label: 'Primeiro atendimento', target: 'attendance', area: 'Atendimento', level: 'reported' },
      { label: 'Qualificação', target: 'qualification_process', area: 'Qualificação', level: 'reported' },
      { label: 'Apresentação ou proposta', target: 'conversion_impact', area: 'Conversão', level: 'reported' },
      { label: 'Acompanhamento depois da proposta', target: 'followup_process', area: 'Follow-up', level: 'reported' },
      { label: 'Não conseguimos localizar a etapa', target: 'numbers', area: 'Gestão comercial', level: 'reported' },
      { label: 'A conversão atende ao que buscamos', target: 'healthy' },
    ],
  },
  'conversion_impact': {
    stage: 4,
    goal: 'Entender a consequência comercial real, sem projetar receita ou perdas.',
    speech: 'Como essa dificuldade aparece nas metas ou na previsão comercial de vocês?',
    choices: [
      { label: 'Afeta uma meta acompanhada', target: 'numbers', area: 'Conversão', level: 'confirmed' },
      { label: 'Torna a previsão menos confiável', target: 'numbers', area: 'Gestão comercial', level: 'reported' },
      { label: 'Ainda não temos esse dado', target: 'numbers' },
      { label: 'Não percebemos impacto importante', target: 'value_check' },
    ],
  },
  'attendance': {
    stage: 3,
    goal: 'Mapear como o primeiro atendimento acontece antes de propor automação.',
    speech: 'Como funciona hoje o primeiro atendimento quando chega uma nova oportunidade?',
    choices: [
      { label: 'Uma pessoa distribui manualmente', target: 'attendance_impact', area: 'Atendimento', level: 'reported' },
      { label: 'Cada vendedor assume seus contatos', target: 'attendance_impact', area: 'Gestão comercial', level: 'reported' },
      { label: 'Há uma fila ou distribuição automática', target: 'attendance_impact' },
      { label: 'Alguns contatos aguardam atendimento', target: 'attendance_impact', area: 'Atendimento', level: 'confirmed' },
    ],
  },
  'attendance_impact': {
    stage: 4,
    goal: 'Verificar tempo de resposta e atendimento perdido apenas se o prospect souber.',
    speech: 'Vocês acompanham quanto tempo costuma levar até a primeira resposta?',
    choices: [
      { label: 'Sim, temos um tempo médio', target: 'numbers' },
      { label: 'Varia e ainda não medimos', target: 'qualification', area: 'Gestão comercial', level: 'reported' },
      { label: 'Há casos sem resposta', target: 'numbers', area: 'Atendimento', level: 'confirmed' },
      { label: 'Não tenho esse dado agora', target: 'qualification' },
    ],
  },
  'team_process': {
    stage: 2,
    goal: 'Identificar padrões de execução e acompanhamento do time.',
    speech: 'A equipe segue um processo comercial padronizado ou cada vendedor costuma trabalhar à sua maneira?',
    choices: [
      { label: 'Cada vendedor atua de um jeito.', target: 'team_visibility', area: 'Gestão comercial', level: 'reported' },
      { label: 'Temos um padrão, mas nem todos seguem.', target: 'team_visibility', area: 'Produtividade', level: 'reported' },
      { label: 'Temos um processo bem definido.', target: 'crm_usage' },
      { label: 'Não acompanhamos a execução.', target: 'team_visibility', area: 'Gestão comercial', level: 'confirmed' },
    ],
  },
  'team_visibility': {
    stage: 3,
    goal: 'Verificar quais indicadores a liderança acompanha.',
    speech: 'Quais indicadores vocês conseguem acompanhar hoje por vendedor: atividades, oportunidades em andamento, conversão ou apenas as vendas fechadas?',
    choices: [
      { label: 'Apenas as vendas fechadas.', target: 'numbers', area: 'Gestão comercial', level: 'reported' },
      { label: 'Atividades e conversões.', target: 'value_check' },
      { label: 'Temos dados, mas são pouco confiáveis.', target: 'numbers', area: 'Gestão comercial', level: 'reported' },
      { label: 'Não temos indicadores definidos.', target: 'numbers', area: 'Gestão comercial', level: 'confirmed' },
    ],
  },
  'crm_usage': {
    stage: 2,
    goal: 'Entender funcionamento do CRM existente, sem pressupor substituição.',
    speech: 'Que bom que vocês já têm CRM. Ele acompanha bem o processo ou ainda existem etapas que o time precisa fazer manualmente?',
    choices: [
      { label: 'Funciona muito bem.', target: 'healthy' },
      { label: 'O time não atualiza os registros.', target: 'crm_adoption', area: 'Gestão comercial', level: 'reported' },
      { label: 'Faltam integrações.', target: 'crm_integrations', area: 'Automação', level: 'reported' },
      { label: 'Há muitos processos manuais.', target: 'crm_integrations', area: 'Automação', level: 'reported' },
      { label: 'Não sei responder.', target: 'qualification' },
    ],
  },
  'crm_adoption': {
    stage: 3,
    goal: 'Entender por que o time não utiliza o CRM.',
    speech: 'O que costuma impedir a equipe de atualizar o CRM: falta de tempo, treinamento ou dificuldade no próprio processo?',
    choices: [
      { label: 'Toma muito tempo.', target: 'value_check', area: 'Produtividade', level: 'reported' },
      { label: 'Falta treinamento.', target: 'value_check', area: 'Gestão comercial', level: 'reported' },
      { label: 'A ferramenta não atende ao fluxo.', target: 'value_check', area: 'Automação', level: 'reported' },
      { label: 'Não sabemos a causa.', target: 'value_check' },
    ],
  },
  'crm_integrations': {
    stage: 3,
    goal: 'Identificar atividades manuais e impacto operacional.',
    speech: 'Qual atividade manual mais consome tempo hoje: registrar contatos, acompanhar retornos ou consolidar indicadores?',
    choices: [
      { label: 'Registro de contatos.', target: 'value_check', area: 'Automação', level: 'reported' },
      { label: 'Acompanhamento de follow-up.', target: 'followup_process', area: 'Follow-up', level: 'reported' },
      { label: 'Relatórios gerenciais.', target: 'value_check', area: 'Gestão comercial', level: 'reported' },
      { label: 'Não é algo que nos afeta muito.', target: 'healthy' },
    ],
  },
  'healthy': {
    stage: 3,
    goal: 'Reconhecer quando o processo já atende bem e encerrar sem inventar uma dor.',
    speech: 'Que bom. Se a solução atual atende bem, não vou insistir. Quer encerrar por aqui ou existe alguma melhoria específica que vocês queiram avaliar?',
    choices: [
      { label: 'Está bem resolvido; podemos encerrar', target: 'end_satisfied' },
      { label: 'Há um ponto que queremos aprimorar', target: 'quick_context' },
      { label: 'Prefiro encerrar por aqui', target: 'end_no_interest' },
    ],
  },
  'value_check': {
    stage: 5,
    goal: 'Fazer o prospect definir o resultado que teria valor antes de relacionar qualquer oferta.',
    speech: 'Você mencionou {desafio}. Se esse ponto melhorasse, o que vocês gostariam de perceber primeiro na operação?',
    choices: [
      { label: 'Mais previsibilidade', target: 'qualification', area: 'Gestão comercial', level: 'reported' },
      { label: 'Menos trabalho manual', target: 'qualification', area: 'Produtividade', level: 'reported' },
      { label: 'Mais avanço entre etapas', target: 'qualification', area: 'Conversão', level: 'reported' },
      { label: 'Ainda não sabemos qual resultado priorizar', target: 'qualification' },
      { label: 'Quero avaliar isso com mais detalhe', target: 'invite' },
    ],
  },
  'numbers': {
    stage: 3,
    goal: 'Registrar apenas indicadores conhecidos; deixe campos sem informação em branco.',
    speech: 'Qual indicador vocês já usam para acompanhar esse processo? Pode ser volume, tempo de resposta, conversão ou outro que faça sentido.',
    choices: [
      { label: 'Vou registrar um número conhecido no campo abaixo', target: 'numbers' },
      { label: 'Temos os dados, mas preciso consultar', target: 'qualification' },
      { label: 'Não acompanhamos esse indicador', target: 'qualification', area: 'Gestão comercial', level: 'reported' },
      { label: 'Prefiro seguir sem números agora', target: 'qualification' },
    ],
  },
  'qualification': {
    stage: 5,
    goal: 'Qualificar prioridade e horizonte; orçamento não é necessário nesta ligação fria.',
    speech: 'Esse tema está entre as prioridades para os próximos meses? Qual horizonte vocês consideram realista?',
    choices: [
      { label: 'É prioridade agora ou nas próximas semanas', target: 'stakeholders' },
      { label: 'Está nos planos para os próximos 3 a 6 meses', target: 'stakeholders' },
      { label: 'Ainda não há prazo definido', target: 'not_now' },
      { label: 'Não é prioridade neste momento', target: 'not_now' },
      { label: 'Prefiro não informar', target: 'stakeholders' },
    ],
  },
  'invite': {
    stage: 6,
    goal: 'Convidar para uma conversa breve de diagnóstico, sem tentar fechar contrato nesta ligação.',
    speech: 'Pelo ponto que você comentou, podemos marcar uma conversa de 20 minutos para entender o cenário e avaliar se alguma solução do {marca} faz sentido? Sem compromisso. Podemos escolher um horário?',
    choices: [
      { label: 'Sim, vamos escolher um horário', target: 'meeting' },
      { label: 'Prefiro receber um resumo primeiro', target: 'send_summary' },
      { label: 'Quero incluir outra pessoa', target: 'talk_partner' },
      { label: 'Não é o momento', target: 'not_now' },
      { label: 'Não tenho interesse', target: 'end_no_interest' },
    ],
  },
  'meeting': {
    stage: 7,
    goal: 'Confirmar data, horário, participantes, canal e objetivo com o prospect antes de registrar.',
    speech: 'Ótimo. Vamos confirmar uma data, horário, quem participa e o e-mail correto. O objetivo será revisar o cenário que você descreveu, sem compromisso de contratação.',
    choices: [
      { label: 'Abrir formulário de reunião confirmada', target: 'meeting_form' },
      { label: 'Preciso conferir minha agenda', target: 'call_back' },
      { label: 'Prefiro receber um resumo', target: 'send_summary' },
    ],
  },
  'send_summary': {
    stage: 6,
    goal: 'Confirmar o canal autorizado e o tema solicitado; o copiloto não envia a mensagem sozinho.',
    speech: 'Claro. Qual canal você autoriza para receber o resumo: e-mail ou WhatsApp? E qual ponto da conversa devo destacar?',
    choices: [
      { label: 'Autorizou envio por e-mail', target: 'end_followup' },
      { label: 'Autorizou envio por WhatsApp', target: 'end_followup' },
      { label: 'Prefere não receber mensagem', target: 'end_no_interest' },
    ],
  },
  'talk_partner': {
    stage: 6,
    goal: 'Trazer as pessoas relevantes para a conversa, sem transformar o contato em obstáculo.',
    speech: 'Faz sentido incluir essa pessoa na conversa para que todos possam avaliar o cenário juntos?',
    choices: [
      { label: 'Sim, podemos agendar com todos', target: 'meeting' },
      { label: 'Preciso alinhar com essa pessoa primeiro', target: 'send_summary' },
      { label: 'Prefiro não avançar agora', target: 'not_now' },
    ],
  },
  'not_now': {
    stage: 6,
    goal: 'Respeitar o momento e solicitar autorização explícita para qualquer retomada.',
    speech: 'Entendo. Prefere encerrar por aqui, receber o resumo que pediu ou combinar uma retomada em uma data que funcione para você?',
    choices: [
      { label: 'Pode retomar; vou informar a data no campo abaixo', target: 'followup_permission' },
      { label: 'Pode enviar o resumo solicitado', target: 'send_summary' },
      { label: 'Prefiro encerrar por aqui', target: 'end_no_interest' },
    ],
  },
  'custom_challenge': {
    stage: 2,
    goal: 'Ouvir um exemplo real antes de sugerir causa, produto ou resultado.',
    speech: 'Pode me contar um exemplo recente de quando esse desafio aparece na rotina?',
    choices: [
      { label: 'Vou descrever o exemplo no campo abaixo', target: 'custom_impact' },
      { label: 'Tem relação com retorno de contatos', target: 'followup_process', area: 'Follow-up', level: 'hypothesis' },
      { label: 'Tem relação com avanço das oportunidades', target: 'conversion_process', area: 'Conversão', level: 'hypothesis' },
      { label: 'Tem relação com o processo da equipe', target: 'team_process', area: 'Gestão comercial', level: 'hypothesis' },
    ],
  },
  'end_no_interest': {
    stage: 7,
    goal: 'Encerramento cordial.',
    speech: 'Tudo bem. Agradeço seu tempo e desejo ótimos resultados para vocês.',
    choices: [
      { label: 'Encerrar ligação', target: 'end_no_interest' },
    ],
  },
  'end_satisfied': {
    stage: 7,
    goal: 'Encerrar cordialmente quando o prospect diz que está bem atendido.',
    speech: 'Perfeito. Obrigado pela franqueza. Se surgir uma iniciativa no futuro, o {marca} fica à disposição. Tenha um ótimo dia!',
    choices: [
      { label: 'Encerrar ligação', target: 'end_satisfied' },
    ],
  },
  'end_followup': {
    stage: 7,
    goal: 'Encerrar cordialmente e manter apenas o próximo passo autorizado pelo prospect.',
    speech: 'Combinado: {proximo}. Obrigado pelo seu tempo. Tenha um excelente dia!',
    choices: [
      { label: 'Encerrar ligação', target: 'end_followup' },
    ],
  },
};

export const LEVEL: Record<EvidenceLevel, number> = {
  none: 0,
  hypothesis: 1,
  reported: 2,
  confirmed: 3,
};

export const LEVEL_NAMES: Record<EvidenceLevel, string> = {
  none: 'Não avaliado',
  hypothesis: 'Hipótese',
  reported: 'Evidência relatada',
  confirmed: 'Confirmado pelo prospect',
};

export const SEGMENT_SPEECH: Record<string, Record<string, string>> = {
  'Clínicas médicas e odontológicas': {
    'opening': 'Olá, {nome}. Aqui é do {marca}. Não quero presumir como vocês trabalham. Posso fazer uma pergunta rápida sobre o atendimento comercial da clínica?',
    'quick_qualify': 'Hoje vocês têm alguma iniciativa para melhorar a presença digital da clínica, o primeiro atendimento ou o acompanhamento de novos pacientes?',
    'challenge': 'Qual etapa do atendimento a novos pacientes merece mais atenção hoje?',
    'followup_process': 'Quando alguém demonstra interesse e não agenda, como vocês registram o próximo contato?',
    'conversion_process': 'Em qual etapa pessoas interessadas mais deixam de avançar, pelo que vocês observam?',
  },
  'Academias': {
    'opening': 'Olá, {nome}. Aqui é do {marca}. Não quero presumir como vocês trabalham. Posso fazer uma pergunta rápida sobre o processo comercial da academia?',
    'quick_qualify': 'Hoje vocês têm alguma iniciativa para melhorar a presença digital, captar matrículas ou organizar o atendimento a interessados?',
    'challenge': 'Qual etapa do processo para novas matrículas merece mais atenção hoje?',
    'followup_process': 'Quando alguém pede informações e não se matricula, como vocês registram o próximo contato?',
    'conversion_process': 'Em qual etapa interessados mais deixam de avançar, segundo o que vocês observam?',
  },
  'Corretoras de seguros': {
    'opening': 'Olá, {nome}. Aqui é do {marca}. Não quero presumir como vocês trabalham. Posso fazer uma pergunta breve sobre o processo comercial da corretora?',
    'quick_qualify': 'Hoje vocês têm alguma iniciativa para melhorar a presença digital, a entrada de cotações ou o acompanhamento das oportunidades?',
    'challenge': 'Qual etapa do processo de cotação e venda merece mais atenção hoje?',
    'followup_process': 'Quando uma cotação é enviada e a pessoa ainda não decide, como vocês registram o próximo contato?',
    'conversion_process': 'Em qual etapa oportunidades mais deixam de avançar, pelo que vocês acompanham?',
  },
  'Imobiliárias': {
    'opening': 'Olá, {nome}. Aqui é do {marca}. Não quero presumir como vocês trabalham. Posso fazer uma pergunta rápida sobre o processo comercial da imobiliária?',
    'quick_qualify': 'Hoje vocês têm alguma iniciativa para melhorar o site, captar interessados ou organizar o atendimento e os retornos?',
    'challenge': 'Qual etapa do atendimento a interessados merece mais atenção hoje?',
    'followup_process': 'Quando alguém demonstra interesse e não agenda visita, como vocês registram o próximo contato?',
    'conversion_process': 'Em qual etapa interessados mais deixam de avançar, pelo que vocês observam?',
  },
  'Escritórios de serviços': {
    'opening': 'Olá, {nome}. Aqui é do {marca}. Não quero presumir como vocês trabalham. Posso fazer uma pergunta breve sobre o processo comercial do escritório?',
    'quick_qualify': 'Hoje há alguma iniciativa para melhorar a presença digital, o atendimento ou o acompanhamento comercial?',
    'challenge': 'Qual etapa para conquistar e atender novos clientes merece mais atenção hoje?',
    'followup_process': 'Quando alguém pede informações e não decide, como vocês registram o próximo contato?',
  },
  'Operações SDR / Closer': {
    'opening': 'Olá, {nome}. Aqui é do {marca}. Não quero presumir como o time trabalha. Posso fazer uma pergunta rápida sobre o fluxo comercial?',
    'quick_qualify': 'Hoje o time busca melhorar a entrada e qualificação de oportunidades, a cadência ou a visibilidade do processo comercial?',
    'challenge': 'Qual etapa do fluxo comercial merece mais atenção hoje?',
    'followup_process': 'Quando uma oportunidade não avança após a reunião, como vocês registram o próximo contato?',
  },
};

export const STAGE_TARGETS: string[] = ['opening', 'quick_qualify', 'quick_context', 'challenge', 'custom_impact', 'qualification', 'invite', 'meeting'];
