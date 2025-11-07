import { useState, useEffect } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'
import { useThemeStore } from '../../stores/themeStore'
import { useFinancialStore } from '../../stores/financialStore'
import { PROFILES, validateClinicName } from '../../config/profiles'
import { THEME_PRESETS } from '../../types/theme'
import { RegenerateMessagesButton } from './RegenerateMessages'
import {
  Settings as SettingsIcon,
  Palette,
  Sun,
  Moon,
  RotateCcw,
  Info,
  Upload,
  Smile,
  DollarSign,
} from 'lucide-react'

export default function Settings() {
  const {
    profile,
    customProfile,
    isCustomProfile,
    setProfile,
    setCustomProfile,
    resetDemo,
  } = useSettingsStore()
  const {
    theme,
    mode,
    themes,
    setTheme,
    setMode,
    setCustomAccent,
    customAccent,
    loadTheme,
  } = useThemeStore()
  const {
    ticketMedio,
    noShowAtual,
    reducaoEsperada,
    custoPorHora,
    duracaoMedia,
    setParams,
  } = useFinancialStore()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [customAccentInput, setCustomAccentInput] = useState(customAccent || '#6366F1')

  // Load all themes on mount
  useEffect(() => {
    THEME_PRESETS.forEach((themeId) => {
      if (!themes[themeId]) {
        loadTheme(themeId)
      }
    })
  }, [themes, loadTheme])

  // Custom profile editor
  const [showCustomEditor, setShowCustomEditor] = useState(false)
  const [customName, setCustomName] = useState(customProfile?.name || '')
  const [customDescription, setCustomDescription] = useState(
    customProfile?.description || ''
  )
  const [customIcon, setCustomIcon] = useState(customProfile?.icon || '🏥')
  const [useEmoji, setUseEmoji] = useState(true)
  const [logoFile, setLogoFile] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleReset = () => {
    resetDemo()
    setShowResetConfirm(false)
  }

  const handleCustomAccentChange = () => {
    setCustomAccent(customAccentInput)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoFile(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveCustomProfile = () => {
    // Validar nome
    const validation = validateClinicName(customName)
    if (!validation.valid) {
      setValidationError(validation.error || 'Nome inválido')
      return
    }

    setValidationError(null)

    // Salvar perfil customizado
    setCustomProfile({
      name: customName.trim(),
      description: customDescription.trim() || 'Clínica personalizada',
      icon: useEmoji ? customIcon : '🏥',
      logoUrl: useEmoji ? undefined : logoFile || undefined,
    })

    setShowCustomEditor(false)
  }

  const currentTheme = themes[theme]

  const commonEmojis = [
    '🏥',
    '⚕️',
    '💊',
    '🦷',
    '💈',
    '✂️',
    '🧘',
    '💆',
    '🏃',
    '🤸',
    '🩺',
    '💉',
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-accent" />
        <div>
          <h1 className="text-2xl font-bold text-theme">Preferências</h1>
          <p className="text-sm text-muted">Configure perfis e temas da demonstração</p>
        </div>
      </div>

      {/* Profile Selection */}
      <div className="bg-surface rounded-theme shadow p-6 border border-theme">
        <h2 className="card-title text-theme mb-4">Perfil da Clínica</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(PROFILES).map((prof) => (
            <button
              key={prof.id}
              onClick={() => setProfile(prof.id)}
              className={`p-6 border-2 rounded-theme transition-all text-center ${
                profile.id === prof.id && !isCustomProfile
                  ? 'border-accent bg-accent/5'
                  : 'border-theme hover:border-muted'
              }`}
              aria-label={`Perfil ${prof.name}`}
              aria-pressed={profile.id === prof.id && !isCustomProfile}
            >
              <div className="text-4xl mb-3">{prof.icon}</div>
              <div className="font-semibold text-lg text-theme mb-1">{prof.name}</div>
              <div className="text-small text-muted">{prof.description}</div>
              <div className="mt-3 text-xs text-muted">
                {prof.services.length} serviços disponíveis
              </div>
            </button>
          ))}

          {/* Custom Profile Card */}
          <button
            onClick={() => {
              setProfile('custom')
              setShowCustomEditor(true)
            }}
            className={`p-6 border-2 rounded-theme transition-all text-center ${
              isCustomProfile
                ? 'border-accent bg-accent/5'
                : 'border-theme hover:border-muted border-dashed'
            }`}
            aria-label="Perfil personalizado"
          >
            <div className="text-4xl mb-3">
              {isCustomProfile && customProfile ? (
                customProfile.logoUrl ? (
                  <img
                    src={customProfile.logoUrl}
                    alt="Logo"
                    className="w-12 h-12 mx-auto object-contain"
                  />
                ) : (
                  customProfile.icon
                )
              ) : (
                '🎨'
              )}
            </div>
            <div className="font-semibold text-lg text-theme mb-1">
              {isCustomProfile && customProfile ? customProfile.name : 'Personalizar'}
            </div>
            <div className="text-small text-muted">
              {isCustomProfile && customProfile
                ? customProfile.description
                : 'Crie seu próprio perfil'}
            </div>
            <div className="mt-3 text-xs text-accent font-medium">
              {isCustomProfile ? '✓ Ativo' : '+ Adicionar'}
            </div>
          </button>
        </div>

        {/* Custom Profile Editor */}
        {showCustomEditor && (
          <div className="mt-6 pt-6 border-t border-theme">
            <div className="flex items-center justify-between mb-4">
              <h3 className="card-title text-theme">Personalizar Perfil da Clínica</h3>
              <button
                onClick={() => setShowCustomEditor(false)}
                className="text-muted hover:text-theme text-small"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-4 bg-theme rounded-theme p-5">
              {/* Nome da Clínica */}
              <div>
                <label className="label text-theme mb-2 block">Nome da Clínica *</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => {
                    setCustomName(e.target.value)
                    setValidationError(null)
                  }}
                  placeholder="Ex: Clínica São José, Studio Pilates Vida, Consultório Dr. Silva"
                  className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
                />
                <p className="text-xs text-muted mt-1">
                  Deve conter palavras como "Clínica", "Consultório", "Studio", "Centro",
                  etc.
                </p>
                {validationError && (
                  <p className="text-xs text-red-600 mt-1">⚠️ {validationError}</p>
                )}
              </div>

              {/* Descrição */}
              <div>
                <label className="label text-theme mb-2 block">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Ex: Cuidando da sua saúde com excelência"
                  className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
                />
              </div>

              {/* Escolher Emoji ou Logo */}
              <div>
                <label className="label text-theme mb-2 block">Ícone ou Logo</label>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setUseEmoji(true)}
                    className={`flex-1 px-4 py-2 border-2 rounded-theme transition-all flex items-center justify-center gap-2 ${
                      useEmoji
                        ? 'border-accent bg-accent text-accent-contrast'
                        : 'border-theme text-theme hover:border-muted'
                    }`}
                  >
                    <Smile className="w-4 h-4" />
                    <span className="text-small font-medium">Emoji</span>
                  </button>
                  <button
                    onClick={() => setUseEmoji(false)}
                    className={`flex-1 px-4 py-2 border-2 rounded-theme transition-all flex items-center justify-center gap-2 ${
                      !useEmoji
                        ? 'border-accent bg-accent text-accent-contrast'
                        : 'border-theme text-theme hover:border-muted'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span className="text-small font-medium">Logo</span>
                  </button>
                </div>

                {useEmoji ? (
                  <div>
                    <div className="grid grid-cols-6 gap-2 mb-3">
                      {commonEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => setCustomIcon(emoji)}
                          className={`p-3 text-2xl border-2 rounded-theme transition-all ${
                            customIcon === emoji
                              ? 'border-accent bg-accent/10'
                              : 'border-theme hover:border-muted'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={customIcon}
                      onChange={(e) => setCustomIcon(e.target.value)}
                      placeholder="Ou digite qualquer emoji"
                      className="w-full px-4 py-2 rounded-theme border border-theme bg-surface text-theme text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block w-full cursor-pointer">
                      <div className="border-2 border-dashed border-theme rounded-theme p-6 text-center hover:border-accent transition-colors bg-theme">
                        {logoFile ? (
                          <img
                            src={logoFile}
                            alt="Logo preview"
                            className="w-20 h-20 mx-auto object-contain mb-2"
                          />
                        ) : (
                          <Upload className="w-12 h-12 mx-auto mb-2 text-muted" />
                        )}
                        <p className="text-small text-theme font-medium">
                          {logoFile
                            ? 'Clique para trocar logo'
                            : 'Clique para fazer upload do logo'}
                        </p>
                        <p className="text-xs text-muted mt-1">PNG, JPG ou SVG até 2MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div className="bg-surface rounded-theme p-4 border border-theme">
                <p className="text-xs text-muted mb-2 uppercase tracking-wide">Preview</p>
                <div className="flex items-center gap-3">
                  {useEmoji ? (
                    <span className="text-3xl">{customIcon}</span>
                  ) : logoFile ? (
                    <img src={logoFile} alt="Logo" className="w-10 h-10 object-contain" />
                  ) : (
                    <span className="text-3xl">🏥</span>
                  )}
                  <div>
                    <p className="font-semibold text-theme">
                      {customName || 'Nome da Clínica'}
                    </p>
                    <p className="text-small text-muted">
                      {customDescription || 'Descrição da clínica'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCustomProfile}
                  className="flex-1 btn btn-primary"
                >
                  Salvar Perfil Personalizado
                </button>
                <button
                  onClick={() => setShowCustomEditor(false)}
                  className="px-6 py-2 border-2 border-theme rounded-theme font-medium hover:bg-theme text-theme transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Theme and Mode Selection */}
      <div className="bg-surface rounded-theme shadow p-6 border border-theme">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-theme flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Tema Visual
          </h2>

          {/* Light/Dark Toggle */}
          <div className="flex items-center gap-2 bg-theme rounded-theme p-1">
            <button
              onClick={() => setMode('light')}
              className={`px-3 py-1.5 rounded-theme flex items-center gap-2 transition-colors ${
                mode === 'light'
                  ? 'bg-accent text-accent-contrast'
                  : 'text-muted hover:text-theme'
              }`}
              aria-label="Modo claro"
              aria-pressed={mode === 'light'}
            >
              <Sun className="w-4 h-4" />
              <span className="text-sm font-medium">Claro</span>
            </button>
            <button
              onClick={() => setMode('dark')}
              className={`px-3 py-1.5 rounded-theme flex items-center gap-2 transition-colors ${
                mode === 'dark'
                  ? 'bg-accent text-accent-contrast'
                  : 'text-muted hover:text-theme'
              }`}
              aria-label="Modo escuro"
              aria-pressed={mode === 'dark'}
            >
              <Moon className="w-4 h-4" />
              <span className="text-sm font-medium">Escuro</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {THEME_PRESETS.map((themeId) => {
            const themeData = themes[themeId]
            const isSelected = theme === themeId

            return (
              <button
                key={themeId}
                onClick={() => setTheme(themeId)}
                className={`p-4 border-2 rounded-theme transition-all ${
                  isSelected
                    ? 'border-accent bg-accent/5'
                    : 'border-theme hover:border-muted'
                }`}
                aria-label={`Tema ${themeData?.label || themeId}`}
                aria-pressed={isSelected}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">{themeData?.emoji || '🎨'}</div>
                  <div className="text-left flex-1">
                    <div className="font-semibold text-sm text-theme">
                      {themeData?.label || themeId}
                    </div>
                  </div>
                </div>

                {/* Color Preview */}
                {themeData && (
                  <div className="flex gap-1 mt-2">
                    <div
                      className="w-6 h-6 rounded-full border border-theme"
                      style={{ backgroundColor: themeData.modes[mode].accent }}
                      title="Accent"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-theme"
                      style={{ backgroundColor: themeData.modes[mode].surface }}
                      title="Surface"
                    />
                    <div
                      className="w-6 h-6 rounded-full border border-theme"
                      style={{ backgroundColor: themeData.modes[mode].bg }}
                      title="Background"
                    />
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Custom Theme Accent Editor */}
        {theme === 'custom' && (
          <div className="border-t border-theme pt-6 mt-6">
            <h3 className="font-semibold text-theme mb-4">
              Personalizar Cor de Destaque
            </h3>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-theme mb-2">
                  Cor de Destaque (Accent)
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customAccentInput}
                    onChange={(e) => setCustomAccentInput(e.target.value)}
                    className="w-16 h-10 rounded-theme border border-theme cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customAccentInput}
                    onChange={(e) => setCustomAccentInput(e.target.value)}
                    placeholder="#6366F1"
                    className="flex-1 px-4 py-2 rounded-theme border border-theme bg-surface text-theme"
                  />
                </div>
              </div>
              <button
                onClick={handleCustomAccentChange}
                className="mt-6 px-6 py-2 bg-accent text-accent-contrast rounded-theme font-semibold hover:opacity-90 transition-opacity"
              >
                Aplicar
              </button>
            </div>
            <p className="text-xs text-muted mt-2">
              💡 Os outros tokens (fundo, superfície, texto, etc.) seguem o preset base
              conforme o modo selecionado.
            </p>
          </div>
        )}
      </div>

      {/* URL Parameters Info */}
      <div className="bg-accent/10 rounded-theme p-6 border border-accent/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-theme mb-2">Parâmetros de URL</h3>
            <p className="text-sm text-muted mb-3">
              Você pode carregar temas e modos específicos usando parâmetros na URL:
            </p>
            <div className="space-y-2 text-sm font-mono bg-surface p-3 rounded-theme border border-theme">
              <div className="text-accent">?theme=clinicaClean&mode=light</div>
              <div className="text-accent">?theme=barbeariaClassic&mode=dark</div>
              <div className="text-accent">?theme=pilatesZen&mode=light</div>
              <div className="text-accent">?theme=consultorioAzul&mode=dark</div>
              <div className="text-accent">?theme=neonPro&mode=light</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Parameters */}
      <div className="bg-surface rounded-theme shadow p-6 border border-theme">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-theme">
          <DollarSign className="w-5 h-5 text-accent" />
          Parâmetros Financeiros
        </h2>

        <p className="text-sm text-muted mb-6">
          Configure os parâmetros para calcular a economia estimada com automação.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ticket Médio */}
          <div>
            <label className="label text-theme mb-2 block">Ticket Médio (R$)</label>
            <input
              type="number"
              value={ticketMedio}
              onChange={(e) => setParams({ ticketMedio: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
              min="0"
              step="10"
            />
            <p className="text-xs text-muted mt-1">Valor médio por consulta/serviço</p>
          </div>

          {/* No-Show Atual */}
          <div>
            <label className="label text-theme mb-2 block">
              Taxa de No-Show Atual (%)
            </label>
            <input
              type="number"
              value={noShowAtual}
              onChange={(e) => setParams({ noShowAtual: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-muted mt-1">
              Percentual atual de faltas sem avisar
            </p>
          </div>

          {/* Redução Esperada */}
          <div>
            <label className="label text-theme mb-2 block">
              Redução Esperada com Automação (%)
            </label>
            <input
              type="number"
              value={reducaoEsperada}
              onChange={(e) => setParams({ reducaoEsperada: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
              min="0"
              max="100"
              step="5"
            />
            <p className="text-xs text-muted mt-1">
              Redução de no-show com lembretes automáticos
            </p>
          </div>

          {/* Custo/Hora */}
          <div>
            <label className="label text-theme mb-2 block">
              Custo/Hora Profissional (R$)
            </label>
            <input
              type="number"
              value={custoPorHora}
              onChange={(e) => setParams({ custoPorHora: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
              min="0"
              step="10"
            />
            <p className="text-xs text-muted mt-1">
              Custo operacional por hora de trabalho
            </p>
          </div>

          {/* Duração Média */}
          <div>
            <label className="label text-theme mb-2 block">Duração Média (minutos)</label>
            <input
              type="number"
              value={duracaoMedia}
              onChange={(e) => setParams({ duracaoMedia: Number(e.target.value) })}
              className="w-full px-4 py-2.5 rounded-theme border border-theme bg-surface text-theme"
              min="0"
              step="5"
            />
            <p className="text-xs text-muted mt-1">Tempo médio de cada atendimento</p>
          </div>
        </div>

        <div className="mt-6 bg-accent/10 rounded-theme p-4 border border-accent/20">
          <p className="text-sm text-theme">
            💡 <strong>Dica:</strong> Ajuste esses valores conforme a realidade do seu
            negócio para ver estimativas mais precisas.
          </p>
        </div>
      </div>

      {/* Regenerate Messages */}
      <RegenerateMessagesButton />

      {/* Reset Demo */}
      <div className="bg-surface rounded-theme shadow p-6 border border-theme">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-accent">
          <RotateCcw className="w-5 h-5" />
          Resetar Demonstração
        </h2>

        <p className="text-muted mb-4">
          Isso irá limpar todos os dados locais, incluindo agendamentos, mensagens e
          preferências. A página será recarregada com os dados padrão.
        </p>

        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-6 py-2 border-2 border-accent/50 text-accent rounded-theme font-semibold hover:bg-accent/10 transition-colors"
          >
            Resetar Demo
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-accent text-accent-contrast rounded-theme font-semibold hover:opacity-90"
            >
              Confirmar Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-6 py-2 border-2 border-theme rounded-theme font-semibold hover:bg-theme transition-colors text-theme"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Current Configuration */}
      <div className="bg-surface rounded-theme shadow p-6 border border-theme">
        <h2 className="text-xl font-semibold text-theme mb-4">Configuração Atual</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-theme rounded-theme">
            <div className="text-sm text-muted mb-1">Perfil Ativo</div>
            <div className="font-semibold text-lg text-theme">
              {profile.icon} {profile.name}
            </div>
          </div>

          <div className="p-4 bg-theme rounded-theme">
            <div className="text-sm text-muted mb-1">Tema Ativo</div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{currentTheme?.emoji}</span>
              <span className="font-semibold text-lg text-theme">
                {currentTheme?.label}
              </span>
            </div>
          </div>

          <div className="p-4 bg-theme rounded-theme">
            <div className="text-sm text-muted mb-1">Modo</div>
            <div className="flex items-center gap-2">
              {mode === 'light' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
              <span className="font-semibold text-lg text-theme capitalize">{mode}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
