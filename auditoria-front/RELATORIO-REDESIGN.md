# Auditoria e proposta de redesign — Infinity Groups

## Resumo executivo

O front atual transmite capacidade técnica, mas ainda não constrói uma percepção única de marca. A principal causa não é falta de elementos visuais: é o excesso de linguagens diferentes convivendo no mesmo produto.

A proposta recomenda posicionar a Infinity como uma parceira de tecnologia que transforma complexidade operacional em clareza, controle e escala. O conceito visual usa o próprio símbolo do infinito como um mapa de arquitetura: operações, dados e experiência conectados em um fluxo contínuo.

## Diagnóstico do front atual

### 1. Identidade fragmentada

- Home, produtos, portfólio, orçamento, login e dashboards usam composições que parecem pertencer a produtos diferentes.
- O código mistura vocabulários de design antigos (`corporate-*`, `premium`, cores hexadecimais diretas e estilos específicos por página).
- Existem aproximadamente 250 ocorrências de estilos locais ou sistemas concorrentes somente nas jornadas principais analisadas.
- A marca depende de fotos corporativas e GIFs genéricos, reduzindo diferenciação e percepção de produto próprio.

### 2. Hierarquia e narrativa

- O site alterna mensagens como “enterprise”, “transformação digital”, “obras-primas” e “ecossistema” sem uma tese comercial única.
- Dois CTAs concorrentes aparecem no cabeçalho (`Área do Cliente` e `Falar conosco`) com o mesmo peso visual.
- Os resultados existentes no portfólio são fortes, mas ficam distantes da primeira decisão do visitante.
- Páginas de conversão usam muito espaço vazio antes de entregar contexto ou prova de confiança.

### 3. Qualidade visual e experiência

- O hero atual usa imagem/GIF de baixa definição aparente em telas grandes.
- Ondas decorativas e grandes fotos de banco ocupam espaço sem explicar o produto ou processo.
- Inter é usada como solução tipográfica praticamente universal, sem criar personalidade própria.
- O login é funcional, porém não dá continuidade à promessa de marca do site público.
- O painel atual prioriza cartões genéricos; falta hierarquia entre situação, ação necessária e histórico.

### 4. Estrutura técnica

- Algumas páginas concentram entre 500 e 800 linhas, tornando evolução e padronização mais caras.
- Tokens globais convivem com centenas de valores de cor e espaçamento hardcoded.
- Componentes de home antigos permanecem no repositório mesmo quando não fazem parte da rota atual.
- Há links para rotas que precisam ser revisadas durante a refatoração, como carreiras, termos, privacidade e nomes antigos de serviços.
- A validação TypeScript geral já apresenta erros anteriores ao conceito, principalmente em formulários administrativos e integração de PIX.

## Direção visual proposta

### Posicionamento

**Assunto:** tecnologia aplicada a operações empresariais complexas.

**Público:** decisores, gestores comerciais e líderes de operação de empresas em crescimento.

**Trabalho principal da home:** provar que a Infinity entende o problema operacional e converter o visitante em uma conversa de diagnóstico.

### Sistema de identidade

- `Navy operacional` — `#07182F`: base de autoridade e profundidade.
- `Azul de ação` — `#2878FF`: decisões, CTAs e estados ativos.
- `Ciano de fluxo` — `#4AE3F4`: conexões, inteligência e assinatura visual.
- `Gelo estrutural` — `#F3F7FB`: superfícies e áreas de leitura.
- `Ink` — `#10243A`: texto e dados.
- `Linha` — `#DBE5EF`: divisores e estrutura.

Tipografia proposta:

- Display: **Bahnschrift**, condensada e técnica, usada em títulos.
- Texto: **Segoe UI Variable**, neutra e muito legível.
- Dados e microcopy: **Consolas**, trazendo linguagem de sistema sem comprometer leitura.

### Elemento memorável

O “Fluxo Infinity” transforma o símbolo da marca em um diagrama vivo que conecta operações, dados e experiência. Ele aparece no hero, nos mapas de produto, em estados de carregamento e em visualizações do painel.

## Propostas por página

### Home

- Hero sem fotografia genérica, com uma arquitetura visual própria.
- Mensagem orientada ao problema: “Complexidade operacional, transformada em vantagem.”
- Resultados reais do portfólio já na primeira dobra.
- Soluções apresentadas por impacto operacional, não por stack.
- Case em destaque conectando serviço e evidência.

### Produtos

- Infinity CRM tratado como produto, não como mais um card de serviço.
- Demonstração visual do painel dentro da página.
- Benefícios organizados em visibilidade, consistência, escala e segurança.
- CTA de demonstração com maior protagonismo.

### Portfólio

- Cases em escala maior, com imagem real, setor e impacto mensurável.
- Menos filtros decorativos e mais leitura editorial.
- Resultados incorporados ao card, evitando exigir abertura para provar valor.

### Contato/orçamento

- O formulário passa a ser um diagnóstico inicial, reduzindo sensação de pedido genérico de orçamento.
- Explica tempo de retorno, confidencialidade e quem atende.
- Formulário dividido mentalmente em “Sobre você” e “O desafio”.

### Login

- Tela dividida entre continuidade de marca e ação de acesso.
- Pequeno resumo do que existe no portal: serviço ativo e próxima fatura.
- Linguagem de segurança mais clara e menos decorativa.

### Portal do cliente

- Primeiro mostra o que requer atenção, depois histórico.
- Serviços ativos, próxima fatura e solicitações no mesmo nível de decisão.
- Atividade recente e suporte passam a ser facilmente encontráveis.

## Estratégia de implementação

1. Consolidar tokens, tipografia, grids, botões, campos, estados e shells público/autenticado.
2. Refatorar primeiro Navbar, Footer, Home, Contato e Login — maior impacto de percepção e conversão.
3. Migrar Produtos, Portfólio e páginas de serviço para componentes comuns.
4. Refatorar Portal e Admin com o mesmo sistema, mantendo densidades diferentes.
5. Revisar acessibilidade, performance de imagens, rotas internas, metadata e responsividade.
6. Remover componentes e estilos antigos somente depois de todas as rotas migrarem.

## Artefatos gerados

As rotas de conceito estão isoladas em `/conceito/*` e não substituem o front atual.

- `/conceito/home`
- `/conceito/produtos`
- `/conceito/portfolio`
- `/conceito/contato`
- `/conceito/login`
- `/conceito/dashboard`

As capturas desktop e mobile estão nesta mesma pasta.
