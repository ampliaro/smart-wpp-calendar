import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FinancialParams {
  ticketMedio: number
  noShowAtual: number
  reducaoEsperada: number
  custoPorHora: number
  duracaoMedia: number
}

interface FinancialState extends FinancialParams {
  setParams: (params: Partial<FinancialParams>) => void
  calculateEconomia: (
    totalAppointments: number,
    noShowCount: number
  ) => {
    economia: number
    noShowEvitados: number
    horasRecuperadas: number
  }
}

const DEFAULT_PARAMS: FinancialParams = {
  ticketMedio: 200,
  noShowAtual: 25,
  reducaoEsperada: 70,
  custoPorHora: 100,
  duracaoMedia: 60,
}

export const useFinancialStore = create<FinancialState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PARAMS,

      setParams: (params) => {
        set((state) => ({ ...state, ...params }))
      },

      calculateEconomia: (totalAppointments, noShowCount) => {
        const { ticketMedio, noShowAtual, reducaoEsperada, custoPorHora, duracaoMedia } =
          get()

        // Calcular no-shows evitados
        const noShowEvitados = Math.round((noShowCount * reducaoEsperada) / 100)

        // Receita recuperada dos no-shows evitados
        const receitaRecuperada = noShowEvitados * ticketMedio

        // Tempo recuperado (em horas)
        const horasRecuperadas = (noShowEvitados * duracaoMedia) / 60

        // Custo de tempo economizado
        const custoTempoEconomizado = horasRecuperadas * custoPorHora

        // Economia total
        const economia = receitaRecuperada + custoTempoEconomizado

        return {
          economia: Math.round(economia),
          noShowEvitados,
          horasRecuperadas: Math.round(horasRecuperadas * 10) / 10,
        }
      },
    }),
    {
      name: 'ampliaro.financial',
    }
  )
)
