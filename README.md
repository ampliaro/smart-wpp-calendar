# 📅 Agenda Inteligente para Clínicas via WhatsApp

> Sistema de demonstração de agendamento inteligente com perfis multi-verticais (Odontologia, Barbearia, Pilates) e **sistema de temas completo com modos claro/escuro**.

---

## 🎨 **NOVO: Sistema de Temas Refatorado**

Cada tema agora suporta **modo claro E escuro** independentemente, com tokens de design consistentes.

### Temas Disponíveis

1. **🦷 Clínica Clean** - Verde menta, ideal para odontologia
2. **💈 Barbearia Classic** - Marrom clássico, tradicional
3. **🧘 Pilates Zen** - Roxo suave, relaxante
4. **🏥 Consultório Azul** - Azul corporativo, profissional
5. **⚡ Neon Pro** - Rosa neon, moderno e vibrante
6. **🎨 Personalizado** - Escolha sua própria cor de destaque

### Teste os Temas via URL

```
# Clínica Clean - Modo Claro
http://localhost:5173?theme=clinicaClean&mode=light

# Clínica Clean - Modo Escuro
http://localhost:5173?theme=clinicaClean&mode=dark

# Barbearia Classic - Modo Claro
http://localhost:5173?theme=barbeariaClassic&mode=light

# Pilates Zen - Modo Escuro
http://localhost:5173?theme=pilatesZen&mode=dark

# Neon Pro - Modo Claro
http://localhost:5173?theme=neonPro&mode=light

# Consultório Azul - Modo Escuro
http://localhost:5173?theme=consultorioAzul&mode=dark
```

---

## 🎯 Visão Geral

Sistema demonstrativo de agenda inteligente que simula agendamentos via WhatsApp com:

- 🦷 **3 Perfis Verticais**: Odontologia, Barbearia e Pilates
- 🎨 **6 Temas com Modos Claro/Escuro**: Cada preset funciona perfeitamente em ambos os modos
- 📊 **Dashboard em Tempo Real**: Métricas, no-show, utilização
- 📅 **Agenda Semanal Visual**: Visualização completa de horários
- 💬 **Simulador WhatsApp**: Fila de mensagens automáticas
- 🤖 **Simulador de Paciente**: Fluxo completo de agendamento
- 📈 **Relatórios**: Análise de desempenho
- ⚙️ **Preferências**: Toggle claro/escuro + seletor de temas

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Acessar o Sistema

**Landing Page (inicial):**
```
http://localhost:5173/
```

**Dashboard (direto):**
```
http://localhost:5173/?app=true
```

**Com perfil específico:**
```
http://localhost:5173/?profile=barbearia&theme=barbeariaClassic&mode=light&app=true
```

---

## 🎨 Sistema de Temas

### Arquitetura

O sistema de temas é baseado em:

1. **Arquivos JSON** em `/public/themes/` definindo cores para cada modo
2. **CSS Variables** aplicadas dinamicamente no `<html>`
3. **Tailwind Classes** customizadas usando as variáveis
4. **Store Zustand** gerenciando tema + modo separadamente
5. **LocalStorage** persistindo preferências em `ampliaro.theme`

### Tokens de Design

Cada tema define os seguintes tokens para ambos os modos:

```json
{
  "bg": "#F7FAF9",           // Fundo principal
  "surface": "#FFFFFF",       // Superfícies (cards, sidebar)
  "text": "#0B1020",         // Texto principal
  "muted": "#6B7280",        // Texto secundário
  "border": "#E6E9EC",       // Bordas
  "accent": "#2CB67D",       // Cor de destaque
  "accentContrast": "#FFFFFF" // Texto sobre accent
}
```

### Usando no Código

```tsx
// Classes Tailwind customizadas
<div className="bg-surface text-theme border-theme rounded-theme">
  <button className="bg-accent text-accent-contrast">
    Botão com cor de destaque
  </button>
</div>

// CSS Variables diretas
<div style={{ color: 'var(--accent)' }}>
  Texto com cor de destaque
</div>
```

---

## ✨ Principais Funcionalidades

### 1. 🏠 Landing Page
- Hero minimalista com animações ricas
- Gradiente dinâmico que segue o mouse
- Chat mockup com conversa realista animada
- Botões com gradiente rotativo e efeito hover
- CTAs para cada perfil (Odonto, Barbearia, Pilates)
- Footer minimalista adaptável aos temas

### 2. 📊 Dashboard Hoje
- **💰 Card de Economia Estimada** - Cálculo financeiro baseado em parâmetros
- Cards com métricas principais
- **📈 Gráfico de Tendência** (últimos 14 dias)
- **📊 Gráfico de Distribuição** por status
- Próximos agendamentos
- Resumo geral (total, confirmados, no-shows)
- Estatísticas de profissionais e pacientes

### 3. 📅 Agenda Semanal
- Grid visual 7 dias × horários
- Slots de 30 em 30 minutos
- Cores por status do agendamento
- **Destaque visual do dia atual**
- Nome do paciente em cada agendamento
- Navegação semanal

### 4. 💬 Fila WhatsApp
- Lista de conversas por paciente
- Interface estilo WhatsApp
- Mensagens automáticas por tipo
- Contador de não lidas
- Sistema de mensagens realistas (15+ variações)

### 5. 🗓️ Central de Agendamentos
- Fluxo completo em 6 etapas
- Validações em tempo real
- **Prevenção de conflitos** (paciente e profissional)
- Busca de pacientes por nome/telefone
- Badge "Agendado" para pacientes com consultas futuras
- Slots disponíveis calculados dinamicamente
- Toast de confirmação com detalhes
- Sincronização automática com todas as views

### 6. 📈 Relatórios
- **Seção "Antes vs Depois"** com impacto da automação
- Métricas gerais
- Gráficos de agendamentos por dia
- Distribuição por status
- Desempenho por profissional
- Cálculos de economia e ROI

### 7. ⚙️ Preferências
- **3 perfis fixos + 1 personalizável**
  - Nome validado (apenas nomes de clínica)
  - Emoji OU upload de logo próprio
  - Descrição customizável
- **Toggle Claro/Escuro** para cada tema
- Seletor de 6 presets de tema
- Editor de cor de destaque (tema personalizado)
- **💰 Parâmetros Financeiros** (ticket médio, no-show, custo/hora, etc.)
- Regenerar mensagens
- Reset da demonstração
- Visualização de configuração atual

---

## 🔄 Estados de Agendamento

Sistema com máquina de estados robusta:

```
disponível → reservado_pendente → confirmado → lembrado → concluído
                 ↓                     ↓            ↓
             cancelado            cancelado     no_show
```

### Regras de Negócio

- ⏱️ **TTL de 10 minutos** para reservas pendentes
- 🕐 **Antecedência mínima de 2 horas** para agendamento
- 📅 **Reagendamento até 24 horas antes**
- ⚠️ **No-show após 10 minutos** sem check-in
- 🔒 **Prevenção de conflitos** de horário

---

## 💬 Sistema de Mensagens Realistas

### Linguagem Natural com Variações

O sistema usa **templates inteligentes** com variações aleatórias para simular conversas reais:

- **3-5 variações** por tipo de mensagem
- **Placeholders automáticos**: `{nome}`, `{servico}`, `{profissional}`, `{hora}`, `{data}`
- **Horários variados**: ±5-7 minutos para parecer mais humano
- **Emojis contextuais**: 😊 👍 ✅ ⏰ 🧠
- **Tom apropriado**: Cada mensagem soa natural e diferente

### Exemplos de Variações

**Convite (5 variações):**
- "Oi Maria! 😊 Temos horários para Limpeza com Dra. Ana. Quer agendar?"
- "Maria, posso te encaixar para Limpeza amanhã às 14:30. Serve?"
- "Olá Maria! 💬 Há vagas para Limpeza. Deseja reservar agora?"

**Confirmação (5 variações):**
- "Perfeito, Maria! ✔ Sua Limpeza está marcada para 10/11 às 14:30."
- "Tudo certo! Consulta confirmada 👍 Limpeza em 10/11 às 14:30."
- "Maria, confirmamos seu horário. Te esperamos!"

**Respostas de Pacientes (12 variações):**
- "Sim, confirmo!"
- "Tudo certo 👍"
- "Pode deixar, estarei lá!"
- "Sim! Até lá 😊"

### Fluxo de Lembretes

1. **Convite** 📧 - Ao criar reserva (variação aleatória)
2. **Confirmação** ✅ - Quando paciente aceita (tom variado)
3. **Lembrete D-1** ⏰ - Um dia antes às 18h (±5min)
4. **Lembrete H-3** ⏰ - 3 horas antes (±7min)
5. **CSAT** ⭐ - Após conclusão (se aplicável)
6. **No-Show** 😢 - Tentativa de reagendamento (40% dos casos)
7. **Cancelamento** ❌ - Confirmação de cancelamento

### Ícones de Mensagens

- 🧠 **Mensagens automáticas** (bot)
- 💬 **Mensagens de pacientes** (humano)
- Cada tipo tem emoji específico na fila WhatsApp

---

## 📂 Estrutura do Projeto

```
smart-wpp-appointments/
├── public/
│   └── themes/              # Arquivos JSON dos temas
│       ├── clinicaClean.json
│       ├── barbeariaClassic.json
│       ├── pilatesZen.json
│       ├── consultorioAzul.json
│       ├── neonPro.json
│       └── custom.json
├── src/
│   ├── components/          # Componentes React
│   │   ├── Dashboard/
│   │   ├── WeeklyCalendar/
│   │   ├── WhatsAppQueue/
│   │   ├── PatientSimulator/
│   │   ├── Reports/
│   │   └── Settings/        # UI de preferências com toggle
│   ├── config/              # Configurações
│   │   ├── profiles.ts      # 3 perfis verticais
│   │   └── seeds.ts         # Dados simulados
│   ├── hooks/               # React Hooks
│   │   ├── useTheme.ts      # Hook principal do tema
│   │   ├── useReminders.ts
│   │   ├── useNoShow.ts
│   │   └── ...
│   ├── stores/              # Zustand State
│   │   ├── themeStore.ts    # Gerenciamento de temas
│   │   ├── settingsStore.ts # Perfis
│   │   ├── appointmentStore.ts
│   │   └── messageStore.ts
│   ├── types/               # TypeScript types
│   │   ├── theme.ts         # Tipos do sistema de temas
│   │   └── index.ts
│   ├── utils/               # Utilitários
│   ├── App.tsx              # App principal
│   └── main.tsx             # Entry point
└── README.md
```

---

## 🔧 Stack Tecnológica

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling com classes customizadas
- **Zustand** - State management
- **date-fns** - Manipulação de datas
- **Lucide React** - Ícones
- **Faker.js** - Dados simulados

---

## 🎯 Teste Manual de Aceitação

✅ **Tema padrão**: Clínica Clean em modo Light (fundo claro, cards brancos)  
✅ **Toggle claro/escuro**: Alterna mantendo o mesmo preset  
✅ **Trocar preset**: Muda cores mantendo o modo selecionado  
✅ **URL params**: `?theme=X&mode=Y` aplica imediatamente  
✅ **Personalizado**: Muda apenas accent, resto segue preset base  
✅ **Persistência**: Recarregar mantém tema + modo  
✅ **Contraste**: Texto legível em ambos os modos  

---

## 💰 Sistema Financeiro

### Parâmetros Configuráveis

Configure em **Preferências → Parâmetros Financeiros**:

- **Ticket Médio:** Valor médio por consulta/serviço
- **Taxa de No-Show Atual:** Percentual de faltas sem aviso
- **Redução Esperada:** Redução de no-show com automação (%)
- **Custo/Hora:** Custo operacional por hora de trabalho
- **Duração Média:** Tempo médio de cada atendimento

### Cálculos Automáticos

**Dashboard:**
- Card "Economia Estimada Este Mês"
- Breakdown de no-shows evitados
- Horas recuperadas
- Tooltip explicativo da fórmula

**Relatórios:**
- Seção "Antes vs Depois"
- Comparativo de métricas
- Receita recuperada
- Tempo economizado

**Fórmula:**
```
Economia = (No-shows evitados × Ticket médio) + (Horas recuperadas × Custo/hora)
```

---

## 📊 Gráficos e Visualizações

### Dashboard

1. **Tendência (14 dias)** - Linha do tempo com:
   - Agendamentos totais
   - Confirmados
   - Concluídos

2. **Distribuição por Status** - Barras horizontais:
   - Confirmado
   - Concluído
   - No-Show
   - Cancelado

### Relatórios

- Agendamentos por dia da semana
- Desempenho por profissional
- Tabela "Antes vs Depois"

Todos os gráficos usam **dados reais do app** (sem mock).

---

## 📄 One-Pager Comercial

Documentos executivos em `/docs/`:

- **`onepager.md`** - Versão em Português
- **`onepager.en.md`** - English version

**Conteúdo:**
- Problema e solução
- ROI e payback
- Casos de uso
- FAQ completo
- Preços e planos
- Tecnologia utilizada

**Uso:** Apresentação comercial para prospects e clientes.

---

## 🛡️ LGPD Simulada

- ✅ Opt-in/opt-out de pacientes
- 📝 Logs locais de consentimento
- 🔒 Dados apenas em localStorage
- 🗑️ Função de exclusão (reset)

---

## 📝 Licença

Projeto de demonstração.

---

## 🚀 Próximos Passos

Para produção, seria necessário:

- Backend com API REST
- Integração WhatsApp Business API oficial
- Banco de dados (PostgreSQL)
- Autenticação e multi-tenancy
- Criptografia de dados
- Backup automatizado
- Monitoramento (Sentry, DataDog)

---

**Desenvolvido com ❤️ para demonstrar conceitos modernos de agendamento inteligente**
