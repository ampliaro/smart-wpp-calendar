/**
 * Sistema de Mensagens Realistas
 *
 * Cada tipo de mensagem tem 3-5 variações com linguagem natural.
 * Placeholders automáticos: {nome}, {servico}, {profissional}, {hora}, {data}
 */

export const MESSAGE_TEMPLATES = {
  invite: [
    'Oi {nome}! 😊 Temos horários para {servico} com {profissional}. Quer agendar ainda esta semana?',
    '{nome}, posso te encaixar para {servico} com {profissional} amanhã às {hora}. Serve pra você?',
    'Olá {nome}! 💬 Há vagas para {servico} com {profissional}. Deseja reservar agora?',
    'Oi {nome}! Temos um horário disponível para {servico}. Gostaria de agendar?',
    '{nome}, que tal marcar sua {servico}? Temos disponibilidade com {profissional} essa semana! 📅',
  ],

  confirm: [
    'Perfeito, {nome}! ✔ Sua {servico} está marcada para {data} às {hora} com {profissional}.',
    'Tudo certo, {nome}! Consulta confirmada 👍 {servico} com {profissional} em {data} às {hora}.',
    '{nome}, confirmamos seu horário para {servico} com {profissional}. Te esperamos!',
    'Agendamento confirmado! ✅ {servico} dia {data} às {hora} com {profissional}. Nos vemos lá, {nome}!',
    'Fechado, {nome}! 🎯 {data} às {hora} - {servico} com {profissional}. Anota aí!',
  ],

  reminderD1: [
    'Lembrete: sua consulta é amanhã às {hora}. Responda SIM para confirmar presença 🦷',
    'Oi {nome}! Só lembrando: amanhã às {hora} é sua {servico} com {profissional}.',
    'Olá {nome}, amanhã te esperamos para {servico}! Horário: {hora}. Tudo certo?',
    '{nome}, amanhã você tem {servico} às {hora}. Confirma presença? 📅',
    'Oi! Consulta amanhã às {hora} com {profissional}. Consegue vir? Responda SIM pra confirmar 😊',
  ],

  reminderH3: [
    'Oi {nome}! Faltam 3h para sua {servico}. Pode vir tranquilo 😄',
    'Lembrete rápido: sua consulta hoje às {hora} com {profissional}.',
    'Te esperamos daqui a pouco! ⏰ {servico} às {hora}.',
    '{nome}, só um lembrete: daqui 3 horas é sua {servico}! Até logo 👋',
    'Preparado(a)? Em 3h você tem {servico} com {profissional}! 🕐',
  ],

  noshow: [
    'Sentimos sua falta hoje, {nome} 😢 Quer reagendar? Temos horários ainda esta semana.',
    'Oi {nome}, não conseguimos te atender hoje. Posso remarcar {servico} com {profissional}?',
    '{nome}, vimos que você não compareceu. Quer reagendar? 😊',
    'Oi {nome}! Você tinha consulta hoje mas não veio. Tá tudo bem? Quer remarcar?',
    'Olá {nome}, esperamos você hoje mas não conseguimos contato. Pode reagendar quando quiser! 📞',
  ],

  csat: [
    'Como foi seu atendimento com {profissional}? Avalie de 0 a 5 ⭐',
    'Oi {nome}! Ficamos felizes em te atender. Que nota de 0 a 5 você daria à consulta?',
    'Sua opinião importa! Avalie seu atendimento com {profissional} de 0 a 5.',
    '{nome}, como foi sua experiência hoje? De 0 a 5, como você avalia? 🌟',
    'Conte pra gente: como foi sua {servico} com {profissional}? Nota de 0 a 5? ⭐',
  ],

  cancel: [
    'Cancelamento confirmado, {nome}. Quando quiser remarcar, estamos à disposição!',
    'Tudo certo, {nome}. Sua {servico} foi cancelada. 😊 Pode agendar novamente quando preferir.',
    '{nome}, cancelamento registrado. Esperamos te ver em breve!',
    'Ok, {nome}! {servico} cancelada. Qualquer coisa, é só chamar de novo! 👍',
    'Cancelado com sucesso! Quando precisar remarcar, {nome}, estamos aqui. 📅',
  ],

  reschedule: [
    'Pronto! Remarcamos para {data} às {hora}. {servico} com {profissional}. Até lá, {nome}! 👋',
    '{nome}, tudo ajustado! Nova data: {data} às {hora}. {profissional} te aguarda!',
    'Reagendamento feito ✅ {data} às {hora} - {servico} com {profissional}.',
    'Fechado, {nome}! Seu novo horário é {data} às {hora}. Nos vemos lá! 😊',
    'Tudo certo! Remarcamos sua {servico} para {data} às {hora} com {profissional}. 📅',
  ],

  patientReplies: {
    M: [
      'Sim, confirmo!',
      'Tudo certo 👍',
      'Confirmado 👌',
      'Pode deixar, estarei lá!',
      'Sim, obrigado!',
      'Confirmo sim!',
      'Sim! Até lá 😊',
      'Combinado!',
      'Ok, confirmo presença',
      'Sim 👍',
      'Perfeito!',
      'Beleza, confirmo!',
    ],
    F: [
      'Sim, confirmo!',
      'Tudo certo 👍',
      'Confirmado 👌',
      'Pode deixar, estarei lá!',
      'Sim, obrigada!',
      'Confirmo sim!',
      'Sim! Até lá 😊',
      'Combinado!',
      'Ok, confirmo presença',
      'Sim 👍',
      'Perfeito!',
      'Beleza, confirmo!',
    ],
  },

  patientCancellation: [
    'Preciso cancelar 😔',
    'Não vou conseguir ir, pode cancelar?',
    'Infelizmente preciso desmarcar',
    'Pode cancelar meu horário? Surgiu um imprevisto',
    'Não poderei comparecer, desculpa!',
  ],

  patientReschedule: [
    'Posso remarcar?',
    'Será que tem outro horário?',
    'Preciso mudar o dia, pode?',
    'Consegue me encaixar em outro dia?',
    'Dá pra remarcar? Surgiu algo aqui',
  ],
}

/**
 * Pega uma mensagem aleatória de um tipo e substitui placeholders
 */
export function getRandomMessage(
  type: keyof typeof MESSAGE_TEMPLATES,
  context: Record<string, string>,
  gender?: 'M' | 'F'
): string {
  const templates = MESSAGE_TEMPLATES[type]

  // Se for patientReplies e tiver gender, usar o array correto
  if (
    type === 'patientReplies' &&
    gender &&
    typeof templates === 'object' &&
    !Array.isArray(templates)
  ) {
    const genderTemplates = templates[gender] || templates.M
    const randomTemplate =
      genderTemplates[Math.floor(Math.random() * genderTemplates.length)]
    return randomTemplate.replace(/{(\w+)}/g, (_, key) => context[key] || `{${key}}`)
  }

  // Para outros tipos
  if (Array.isArray(templates)) {
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)]
    return randomTemplate.replace(/{(\w+)}/g, (_, key) => context[key] || `{${key}}`)
  }

  return ''
}

/**
 * Adiciona variação aleatória no horário (visual apenas, para parecer mais humano)
 */
export function addTimeVariation(
  timestamp: string,
  minMinutes: number = -5,
  maxMinutes: number = 7
): string {
  const date = new Date(timestamp)
  const variation = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes
  date.setMinutes(date.getMinutes() + variation)
  return date.toISOString()
}

/**
 * Determina se a mensagem deve ter ícone de bot ou humano
 */
export function getMessageIcon(direction: 'inbound' | 'outbound', type: string): string {
  if (direction === 'inbound') {
    return '💬' // Paciente
  }

  // Mensagens automáticas
  if (['invite', 'confirm', 'reminderD1', 'reminderH3', 'csat'].includes(type)) {
    return '🧠' // Bot
  }

  return '💬' // Padrão
}
