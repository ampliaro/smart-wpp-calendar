# Smart WhatsApp Appointments

Sistema demonstrativo de agendamento inteligente via WhatsApp com gestão automatizada de consultas, lembretes e confirmações.

## Visão Geral

Esta aplicação simula um sistema completo de agendamento automatizado, demonstrando como clínicas, consultórios e estúdios podem reduzir no-shows, otimizar agenda e melhorar a experiência do paciente através da automação via WhatsApp.

O sistema foi desenvolvido como prova de conceito (PoC) para demonstrar capabilities técnicas e valor de negócio, executando 100% no navegador sem necessidade de backend.

## Funcionalidades Principais

### 1. Landing Page

Página inicial com apresentação do sistema e seleção de verticais:
- Odontologia (Clínica Clean)
- Barbearia (Barbearia Classic)  
- Pilates (Pilates Zen)

Cada vertical possui tema visual próprio e dados contextualizados para o segmento.

_(Adicionar GIF de demonstração da navegação entre perfis na landing page)_

### 2. Dashboard Executivo

Painel principal com métricas em tempo real:
- Taxa de confirmação de agendamentos
- Taxa de no-show
- Utilização da agenda
- Tempo médio de resposta do bot
- Economia estimada mensal (baseada em parâmetros financeiros configuráveis)

Inclui visualizações gráficas:
- Gráfico de tendência dos últimos 14 dias (agendados, confirmados, concluídos)
- Distribuição de status atual dos agendamentos

_(Adicionar GIF de demonstração dos gráficos e card de economia)_

### 3. Central de Agendamentos

Interface de simulação do fluxo completo de agendamento:
- Busca de pacientes por nome ou telefone
- Seleção de serviço e profissional
- Validação de conflitos de horário
- Confirmação visual com badges de status
- Sincronização automática com todos os módulos

O sistema valida:
- Conflitos de horário do profissional
- Limite de um agendamento por paciente por dia
- Disponibilidade de slots

_(Adicionar GIF de demonstração do processo de agendamento com validações)_

### 4. Agenda Semanal

Visualização estilo calendário com:
- Cards individuais por agendamento
- Nome completo do paciente
- Serviço e profissional responsável
- Destaque visual do dia atual
- Navegação entre semanas

### 5. Fila WhatsApp

Simulação realista de conversas automatizadas:
- Mensagens com variações naturais de linguagem
- Templates com placeholders dinâmicos
- Fluxo completo: convite, confirmação, lembretes D-1 e H-3
- Indicadores visuais de mensagens automáticas vs. manuais
- Sistema de priorização e ordenação por horário

_(Adicionar GIF de demonstração do fluxo de mensagens e interação)_

### 6. Relatórios

Análise de performance com:
- Seção "Antes vs Depois" comparando métricas pré e pós-automação
- Agendamentos por dia da semana
- Desempenho por profissional
- Taxa de confirmação e no-show
- Cálculos de receita recuperada e tempo economizado

### 7. Preferências

Painel de configuração com três abas:

**Perfil e Aparência:**
- Seleção entre 3 perfis fixos (Odonto, Barbearia, Pilates)
- 6 temas visuais pré-configurados
- Toggle modo claro/escuro
- Tema personalizado com editor de cor de destaque

**Parâmetros Financeiros:**
- Ticket médio por atendimento
- Taxa de no-show atual
- Redução esperada com automação
- Custo operacional por hora
- Duração média de atendimento

Estes parâmetros alimentam os cálculos de ROI exibidos no Dashboard e Relatórios.

**Ações:**
- Regenerar mensagens simuladas
- Reset completo da demonstração

## Sistema de Temas

A aplicação utiliza um sistema de temas dinâmico baseado em CSS Variables:

```
Arquitetura: JSON → CSS Variables → Tailwind Classes
```

Cada tema é definido em um arquivo JSON em `/public/themes/` contendo paletas para modo claro e escuro. O sistema carrega o JSON, injeta as variáveis CSS na tag `<html>` e as classes Tailwind reagem automaticamente.

Temas disponíveis:
- Clínica Clean (azul profissional)
- Barbearia Classic (âmbar vintage)
- Pilates Zen (roxo calmo)
- Consultório Azul (azul corporativo)
- Neon Pro (ciano tecnológico)
- Custom (personalizável)

## Máquina de Estados

Os agendamentos seguem uma máquina de estados rigorosa:

```
disponível → reservado_pendente → confirmado → lembrado → concluído
                 ↓                     ↓            ↓
             cancelado            cancelado     no_show
```

Regras de negócio implementadas:
- TTL de 10 minutos para reservas pendentes
- Antecedência mínima de 2 horas para novos agendamentos
- Reagendamento permitido até 24 horas antes
- Marcação automática de no-show após 10 minutos do horário
- Prevenção de conflitos através de validação cruzada

## Geração de Mensagens

Sistema de templates inteligentes para simular conversas naturais:

**Estrutura:**
- 3 a 5 variações por tipo de mensagem
- Placeholders automáticos: `{nome}`, `{servico}`, `{profissional}`, `{hora}`, `{data}`
- Horários randomizados (±5-7 minutos) para realismo
- Tom e linguagem contextuais ao perfil selecionado

**Tipos de mensagem:**
- Convite para agendamento
- Confirmação
- Lembrete D-1 (um dia antes às 18h)
- Lembrete H-3 (três horas antes)
- Pesquisa de satisfação (CSAT)
- Tentativa de reagendamento pós no-show
- Confirmação de cancelamento

## Tecnologias Utilizadas

**Frontend:**
- React 18 com TypeScript
- Vite (build tool)
- Tailwind CSS (estilização)
- Framer Motion (animações)

**State Management:**
- Zustand com middleware de persistência
- LocalStorage para dados simulados

**Bibliotecas:**
- date-fns (manipulação de datas)
- Recharts (visualizações)
- Lucide React (ícones)
- Faker.js (geração de dados)

**Qualidade de Código:**
- ESLint (linting)
- Prettier (formatação)
- TypeScript strict mode

## Instalação e Execução

**Pré-requisitos:**
- Node.js 18+ 
- npm ou yarn

**Comandos:**

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Formatação e linting
npm run format
npm run lint:fix
```

## Acessar Direto no Navegador

O sistema pode ser acessado via URL com parâmetros:

```
# App direto no perfil Odonto
http://localhost:5173/?app=true&profile=odonto&theme=clinicaClean

# App no perfil Barbearia
http://localhost:5173/?app=true&profile=barbearia&theme=barbeariaClassic

# App no perfil Pilates
http://localhost:5173/?app=true&profile=pilates&theme=pilatesZen
```

## Estrutura de Pastas

```
smart-wpp-appointments/
├── public/
│   ├── themes/                    # Arquivos JSON dos temas visuais
│   └── favicon.svg                # Ícone da aplicação
├── src/
│   ├── components/                # Componentes React organizados por feature
│   │   ├── Dashboard/
│   │   ├── WeeklyCalendar/
│   │   ├── WhatsAppQueue/
│   │   ├── PatientSimulator/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   ├── Landing/
│   │   └── Footer/
│   ├── config/
│   │   ├── profiles.ts            # Configurações dos 3 perfis verticais
│   │   └── seeds.ts               # Geração de dados simulados
│   ├── hooks/                     # React Hooks customizados
│   │   ├── useTheme.ts
│   │   ├── useReminders.ts
│   │   ├── useNoShow.ts
│   │   └── useInitializeData.ts
│   ├── stores/                    # Zustand stores (state global)
│   │   ├── themeStore.ts
│   │   ├── settingsStore.ts
│   │   ├── appointmentStore.ts
│   │   ├── messageStore.ts
│   │   └── financialStore.ts
│   ├── types/                     # TypeScript interfaces e types
│   ├── utils/                     # Funções auxiliares
│   │   ├── appointmentValidation.ts
│   │   ├── messageGenerator.ts
│   │   └── debug.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/
│   ├── onepager.md                # Documento comercial PT
│   └── onepager.en.md             # Documento comercial EN
└── README.md
```

## Cálculos de ROI

A aplicação implementa fórmulas de cálculo de retorno sobre investimento baseadas em parâmetros configuráveis:

**Fórmula da Economia Estimada:**
```
noShowsEvitados = (totalAgendamentos × taxaNoShowAtual × reducaoEsperada) / 100
receitaRecuperada = noShowsEvitados × ticketMedio
horasRecuperadas = (noShowsEvitados × duracaoMedia) / 60
custoEvitado = horasRecuperadas × custoPorHora
economiaTotal = receitaRecuperada + custoEvitado
```

Os valores são exibidos no Dashboard (card de Economia Estimada) e Relatórios (seção Antes vs Depois).

## Conformidade e Boas Práticas

**Acessibilidade:**
- Labels ARIA em elementos interativos
- Suporte a `prefers-reduced-motion`
- Navegação por teclado
- Classes `.sr-only` para leitores de tela

**LGPD (Simulado):**
- Dados armazenados apenas em LocalStorage
- Função de reset/exclusão total
- Logs de consentimento (simulados)

**Performance:**
- Lazy loading de temas
- Debounce em buscas
- Memoização de cálculos pesados
- Build otimizado com Vite

## Limitações (PoC)

Esta é uma aplicação demonstrativa. Para ambiente de produção, seria necessário:

- Backend com API REST
- Integração oficial WhatsApp Business API
- Banco de dados relacional (PostgreSQL)
- Sistema de autenticação e autorização
- Multi-tenancy (suporte a múltiplos clientes)
- Criptografia de dados sensíveis
- Backup automatizado
- Monitoramento e observabilidade (logs, métricas, traces)
- Testes automatizados (unitários, integração, E2E)
- CI/CD pipeline

## Licença

MIT License - Veja arquivo [LICENSE](LICENSE) para detalhes.

## Contato

Ampliaro Studio - contato@ampliaro.com.br

Repositório: [https://github.com/ampliaro/smart-wpp-calendar](https://github.com/ampliaro/smart-wpp-calendar)
