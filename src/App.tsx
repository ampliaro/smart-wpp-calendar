import { useState, useEffect } from 'react'
import { useSettingsStore } from './stores/settingsStore'
import { useTheme } from './hooks/useTheme'
import { useToast } from './hooks/useToast'
import { useInitializeData } from './hooks/useInitializeData'
import { useReminders } from './hooks/useReminders'
import { useNoShow } from './hooks/useNoShow'
import { useExpiredReservations } from './hooks/useExpiredReservations'
import Dashboard from './components/Dashboard/Dashboard'
import WeeklyCalendar from './components/WeeklyCalendar/WeeklyCalendar'
import WhatsAppQueue from './components/WhatsAppQueue/WhatsAppQueue'
import PatientSimulator from './components/PatientSimulator/PatientSimulator'
import Reports from './components/Reports/Reports'
import Settings from './components/Settings/Settings'
import Hero from './components/Landing/Hero'
import Footer from './components/Footer/Footer'
import { Toast } from './components/Toast/Toast'
import { Menu } from 'lucide-react'

// Create a toast context
import { createContext } from 'react'
export const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

function App() {
  const [currentPage, setCurrentPage] = useState<
    'dashboard' | 'calendar' | 'whatsapp' | 'simulator' | 'reports' | 'settings'
  >('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showLanding, setShowLanding] = useState(true)
  const { profile, customProfile, isCustomProfile, setProfile } = useSettingsStore()
  useTheme() // Initialize theme
  const toast = useToast()

  // Check if we should show the landing page and apply profile from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const isAppMode = params.get('app') === 'true'
    const profileParam = params.get('profile')

    setShowLanding(!isAppMode)

    // Apply profile from URL if provided
    if (
      profileParam &&
      (profileParam === 'odonto' ||
        profileParam === 'barbearia' ||
        profileParam === 'pilates')
    ) {
      setProfile(profileParam)

      // Also update theme to match profile (if not explicitly set in URL)
      if (!params.get('theme')) {
        const themeMap: Record<string, string> = {
          odonto: 'clinicaClean',
          barbearia: 'barbeariaClassic',
          pilates: 'pilatesZen',
        }
        // Update URL to include theme
        const newUrl = new URL(window.location.href)
        newUrl.searchParams.set('theme', themeMap[profileParam])
        window.history.replaceState({}, '', newUrl.toString())
      }
    }
  }, [setProfile])

  // Initialize data and automations
  useInitializeData()
  useReminders()
  useNoShow()
  useExpiredReservations()

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'calendar':
        return <WeeklyCalendar />
      case 'whatsapp':
        return <WhatsAppQueue />
      case 'simulator':
        return <PatientSimulator />
      case 'reports':
        return <Reports />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'calendar', label: 'Agenda Semanal', icon: '📅' },
    { id: 'whatsapp', label: 'Fila WhatsApp', icon: '💬' },
    { id: 'simulator', label: 'Agendamentos', icon: '🗓️' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
    { id: 'settings', label: 'Preferências', icon: '⚙️' },
  ]

  // Show landing page if not in app mode
  if (showLanding) {
    return (
      <ToastContext.Provider value={toast}>
        <Hero />
      </ToastContext.Provider>
    )
  }

  return (
    <ToastContext.Provider value={toast}>
      {/* Toast Container */}
      {toast.toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          message={t.message}
          onClose={() => toast.removeToast(t.id)}
        />
      ))}

      <div className="flex h-screen overflow-hidden bg-theme">
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Fechar menu"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } transition-all duration-300 bg-surface border-r border-theme overflow-hidden relative z-50`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2">
              {isCustomProfile && customProfile?.logoUrl ? (
                <img
                  src={customProfile.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
              ) : (
                <span className="text-2xl">{profile.icon}</span>
              )}
              <h1
                className="h2 text-accent mb-0"
                style={{ fontSize: '1.1rem', fontWeight: 600 }}
              >
                {profile.name}
              </h1>
            </div>
            <p className="text-small mb-8" style={{ fontSize: '0.8rem' }}>
              {profile.description}
            </p>

            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id as typeof currentPage)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all rounded-theme relative ${
                    currentPage === item.id
                      ? 'bg-accent text-accent-contrast'
                      : 'hover:bg-theme text-theme'
                  }`}
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: currentPage === item.id ? 500 : 400,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {currentPage === item.id && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3/5 bg-accent-contrast rounded-r-full" />
                  )}
                  <span className="text-lg">{item.icon}</span>
                  <span className="label mb-0">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-theme">
          <header className="bg-surface border-b border-theme px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-theme rounded-theme text-theme transition-colors"
                  aria-label={sidebarOpen ? 'Fechar menu lateral' : 'Abrir menu lateral'}
                >
                  <Menu size={22} />
                </button>
                <h2 className="h1 mb-0" style={{ fontSize: '1.5rem' }}>
                  {menuItems.find((item) => item.id === currentPage)?.label}
                </h2>
              </div>
              <div className="text-small uppercase tracking-wide">Modo Demo</div>
            </div>
          </header>

          <div className="p-8 min-h-screen">{renderPage()}</div>

          {/* Footer */}
          <Footer />
        </main>
      </div>
    </ToastContext.Provider>
  )
}

export default App
