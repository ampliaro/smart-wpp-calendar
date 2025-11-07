import { Patient } from '../types'

export interface LGPDLog {
  id: string
  patientId: string
  action: 'consent_given' | 'consent_revoked' | 'data_accessed' | 'data_deleted'
  timestamp: string
  details?: string
}

class LGPDService {
  private logs: LGPDLog[] = []

  /**
   * Registra consentimento do paciente
   */
  recordConsent(patientId: string, consented: boolean): LGPDLog {
    const log: LGPDLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      action: consented ? 'consent_given' : 'consent_revoked',
      timestamp: new Date().toISOString(),
    }

    this.logs.push(log)
    this.saveToLocalStorage()

    return log
  }

  /**
   * Registra acesso a dados
   */
  recordDataAccess(patientId: string, details: string): LGPDLog {
    const log: LGPDLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      action: 'data_accessed',
      timestamp: new Date().toISOString(),
      details,
    }

    this.logs.push(log)
    this.saveToLocalStorage()

    return log
  }

  /**
   * Registra exclusão de dados
   */
  recordDataDeletion(patientId: string): LGPDLog {
    const log: LGPDLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      action: 'data_deleted',
      timestamp: new Date().toISOString(),
    }

    this.logs.push(log)
    this.saveToLocalStorage()

    return log
  }

  /**
   * Obtém logs de um paciente
   */
  getPatientLogs(patientId: string): LGPDLog[] {
    return this.logs.filter((log) => log.patientId === patientId)
  }

  /**
   * Obtém todos os logs
   */
  getAllLogs(): LGPDLog[] {
    return [...this.logs]
  }

  /**
   * Verifica se paciente deu consentimento
   */
  hasConsent(patient: Patient): boolean {
    return patient.lgpdConsent === true
  }

  /**
   * Salva logs no localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('lgpd-logs', JSON.stringify(this.logs))
    } catch (error) {
      console.error('Erro ao salvar logs LGPD:', error)
    }
  }

  /**
   * Carrega logs do localStorage
   */
  loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('lgpd-logs')
      if (stored) {
        this.logs = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Erro ao carregar logs LGPD:', error)
    }
  }

  /**
   * Limpa todos os logs (apenas para demo)
   */
  clearAllLogs(): void {
    this.logs = []
    localStorage.removeItem('lgpd-logs')
  }
}

export const lgpdService = new LGPDService()

// Carrega logs ao inicializar
if (typeof window !== 'undefined') {
  lgpdService.loadFromLocalStorage()
}
