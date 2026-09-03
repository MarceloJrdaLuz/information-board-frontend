import { Button } from "@/Components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/Components/ui/popover"
import { IPublisher } from "@/types/types"
import dayjs from "dayjs"
import {
    AlertCircle,
    AlertTriangle,
    Calendar,
    Check,
    ChevronsUpDown,
    Search,
    SlidersHorizontal,
    Sparkles,
    User,
    Users2,
    X
} from "lucide-react"
import { useMemo, useState } from "react"

interface Props {
  value?: string | null
  onChange: (publisherId: string | null) => void
  partner?: IPublisher | null
  publishers: IPublisher[]
  date: string
  slotId: string
  slotPreferences?: Set<string>
  daysSinceLastMap: Map<string, number | null>
  lastCartDateMap: Map<string, string>
  pairCountMap: Map<string, { count: number; lastDate?: string }>
  assignedTodayIds?: Set<string>
  unavailableIds?: Set<string>
  placeholder?: string
  disabled?: boolean
}

export function PublicWitnessPublisherSelect({
  value,
  onChange,
  partner,
  publishers,
  date,
  slotId,
  slotPreferences = new Set(),
  daysSinceLastMap,
  lastCartDateMap,
  pairCountMap,
  assignedTodayIds = new Set(),
  unavailableIds = new Set(),
  placeholder = "Selecione o publicador...",
  disabled = false
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [filterTab, setFilterTab] = useState<"ALL" | "M" | "F" | "PREF">("ALL")

  const selectedPublisher = useMemo(() => {
    if (!value) return null
    return publishers.find(p => p.id === value) || null
  }, [value, publishers])

  // Normalização de gênero
  const getGender = (gender?: string): "M" | "F" => {
    if (!gender) return "M"
    return gender.trim().toLowerCase().startsWith("f") ? "F" : "M"
  }

  // Checagem de compatibilidade de gênero e família
  const checkCompatibility = (
    pub: IPublisher,
    currentPartner: IPublisher
  ): { isCompatible: boolean; isFamily: boolean; reason: string | null } => {
    const g1 = getGender(pub.gender)
    const g2 = getGender(currentPartner.gender)
    if (g1 === g2) return { isCompatible: true, isFamily: false, reason: null }
    if (pub.family_id && currentPartner.family_id && pub.family_id === currentPartner.family_id) {
      return { isCompatible: true, isFamily: true, reason: "Mesma família" }
    }
    return { isCompatible: false, isFamily: false, reason: "Homem e mulher de famílias diferentes" }
  }

  // Lista filtrada e ordenada
  const filteredList = useMemo(() => {
    const term = search.trim().toLowerCase()

    return publishers
      .filter(p => {
        // Se já está selecionado como o próprio parceiro do slot, oculta
        if (partner && p.id === partner.id) return false

        // Filtro por gênero ou preferência
        if (filterTab === "M" && getGender(p.gender) !== "M") return false
        if (filterTab === "F" && getGender(p.gender) !== "F") return false
        if (filterTab === "PREF" && !slotPreferences.has(p.id)) return false

        // Busca por texto
        if (term) {
          const nameMatch = p.fullName?.toLowerCase().includes(term)
          const nickMatch = p.nickname?.toLowerCase().includes(term)
          if (!nameMatch && !nickMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        // Publicador atualmente selecionado vem no topo
        if (a.id === value) return -1
        if (b.id === value) return 1

        // Se há parceiro, prioriza duplas que nunca saíram juntas
        if (partner) {
          const keyA = a.id < partner.id ? `${a.id}:${partner.id}` : `${partner.id}:${a.id}`
          const keyB = b.id < partner.id ? `${b.id}:${partner.id}` : `${partner.id}:${b.id}`
          const countA = pairCountMap.get(keyA)?.count || 0
          const countB = pairCountMap.get(keyB)?.count || 0
          if (countA !== countB) return countA - countB
        }

        // Prioriza quem tem preferência por este horário
        const prefA = slotPreferences.has(a.id) ? 1 : 0
        const prefB = slotPreferences.has(b.id) ? 1 : 0
        if (prefA !== prefB) return prefB - prefA

        // Prioriza quem está há mais tempo sem sair
        const daysA = daysSinceLastMap.get(a.id) ?? 9999
        const daysB = daysSinceLastMap.get(b.id) ?? 9999
        if (daysA !== daysB) return daysB - daysA

        return (a.nickname || a.fullName).localeCompare(b.nickname || b.fullName)
      })
  }, [
    publishers,
    partner,
    value,
    filterTab,
    search,
    slotPreferences,
    pairCountMap,
    daysSinceLastMap
  ])

  const selectedName = selectedPublisher
    ? selectedPublisher.nickname?.trim() || selectedPublisher.fullName
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex items-center gap-1 w-full">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className="w-full justify-between font-normal text-left h-9 px-3 bg-surface-100 border-surface-300 hover:bg-surface-200 text-typography-900 rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-2 truncate">
              <User className="h-4 w-4 text-typography-400 shrink-0" />
              {selectedName ? (
                <span className="font-semibold text-xs text-typography-900 truncate">
                  {selectedName}
                </span>
              ) : (
                <span className="text-typography-500 text-xs truncate">
                  {placeholder}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50 text-typography-500" />
          </Button>
        </PopoverTrigger>

        {value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation()
              onChange(null)
            }}
            className="h-8 w-8 text-typography-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 shrink-0"
            title="Remover publicador deste horário"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <PopoverContent className="w-80 sm:w-[460px] p-2.5 shadow-xl border border-surface-300 bg-surface-100 text-typography-900 z-50 rounded-xl">
        <div className="flex flex-col gap-2">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between pb-1.5 border-b border-surface-300 px-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-typography-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>
                {partner ? "Selecionar Dupla Inteligente" : "Selecionar Publicador"}
              </span>
            </div>
            <span className="text-[10px] text-typography-500">
              {partner ? `Parceiro atual: ${partner.nickname || partner.fullName}` : "Ordenado por descanso"}
            </span>
          </div>

          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-typography-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou apelido..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-200/60 border border-surface-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-900"
            />
          </div>

          {/* Filtros Rápidos */}
          <div className="flex items-center gap-1 border-b border-surface-300 pb-2 pt-0.5">
            <button
              type="button"
              onClick={() => setFilterTab("ALL")}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                filterTab === "ALL"
                  ? "bg-primary-200 text-white shadow-sm"
                  : "bg-surface-200 text-typography-600 hover:text-typography-900"
              }`}
            >
              Todos ({publishers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("M")}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                filterTab === "M"
                  ? "bg-primary-200 text-white shadow-sm"
                  : "bg-surface-200 text-typography-600 hover:text-typography-900"
              }`}
            >
              Homens
            </button>
            <button
              type="button"
              onClick={() => setFilterTab("F")}
              className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${
                filterTab === "F"
                  ? "bg-primary-200 text-white shadow-sm"
                  : "bg-surface-200 text-typography-600 hover:text-typography-900"
              }`}
            >
              Mulheres
            </button>
            {slotPreferences.size > 0 && (
              <button
                type="button"
                onClick={() => setFilterTab("PREF")}
                className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors flex items-center gap-1 ${
                  filterTab === "PREF"
                    ? "bg-primary-200 text-white shadow-sm"
                    : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                }`}
              >
                <SlidersHorizontal className="h-2.5 w-2.5" />
                Preferência ({slotPreferences.size})
              </button>
            )}
          </div>

          {/* Lista de Sugestões */}
          <div className="max-h-72 overflow-y-auto flex flex-col gap-1 pr-1 thin-scrollbar">
            {filteredList.length === 0 ? (
              <div className="py-8 text-center text-xs text-typography-500">
                Nenhum publicador compatível encontrado.
              </div>
            ) : (
              filteredList.map(pub => {
                const isSelected = pub.id === value
                const daysSince = daysSinceLastMap.get(pub.id)
                const lastDate = lastCartDateMap.get(pub.id)
                const hasPreference = slotPreferences.has(pub.id)
                const isAssignedToday = assignedTodayIds.has(pub.id) && pub.id !== value
                const isUnavailable = unavailableIds.has(pub.id)

                // Dados de dupla com o parceiro
                let pairCount = 0
                let lastPairDate: string | undefined
                let daysSincePair: number | null = null
                let compatibility = { isCompatible: true, isFamily: false, reason: null as string | null }

                if (partner) {
                  const pairKey = pub.id < partner.id ? `${pub.id}:${partner.id}` : `${partner.id}:${pub.id}`
                  const pairData = pairCountMap.get(pairKey)
                  if (pairData) {
                    pairCount = pairData.count
                    lastPairDate = pairData.lastDate
                    if (lastPairDate) {
                      daysSincePair = dayjs(date).diff(dayjs(lastPairDate), "day")
                    }
                  }
                  compatibility = checkCompatibility(pub, partner)
                }

                const formattedLastDate = lastDate ? ` (${dayjs(lastDate).format("DD/MM/YYYY")})` : ""
                let pairHistoryInfo = ""
                if (lastPairDate) {
                  const dateStr = dayjs(lastPairDate).format("DD/MM/YYYY")
                  const daysStr = daysSincePair !== null ? ` - há ${daysSincePair} dias` : ""
                  pairHistoryInfo = ` (Última: ${dateStr}${daysStr})`
                }

                return (
                  <button
                    key={pub.id}
                    type="button"
                    onClick={() => {
                      onChange(pub.id)
                      setOpen(false)
                    }}
                    className={`flex flex-col w-full text-left p-2.5 rounded-lg transition-colors border ${
                      isSelected
                        ? "bg-primary-200/10 border-primary-200"
                        : "hover:bg-surface-200 border-transparent"
                    } ${isUnavailable ? "opacity-60 bg-red-50/40" : ""}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-bold text-xs text-typography-900 truncate">
                          {pub.nickname?.trim() || pub.fullName}
                        </span>
                        {pub.nickname?.trim() && pub.nickname.trim() !== pub.fullName && (
                          <span className="text-[10px] text-typography-400 truncate">
                            ({pub.fullName})
                          </span>
                        )}
                        {hasPreference && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded font-semibold shrink-0">
                            Prefere este horário
                          </span>
                        )}
                        {compatibility.isFamily && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-semibold shrink-0">
                            Família
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary-200 shrink-0" />}
                    </div>

                    {/* Status de última saída no carrinho */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                      {daysSince !== null && daysSince !== undefined ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Calendar className="h-3 w-3" />
                          Última vez há {daysSince} {daysSince === 1 ? "dia" : "dias"}
                          {formattedLastDate}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                          <Sparkles className="h-3 w-3" />
                          Nunca saiu no carrinho
                        </span>
                      )}

                      {isAssignedToday && (
                        <span className="flex items-center gap-0.5 text-amber-600 font-medium text-[10px]">
                          <AlertCircle className="h-3 w-3" />
                          Já escalado neste dia
                        </span>
                      )}

                      {isUnavailable && (
                        <span className="flex items-center gap-0.5 text-red-600 font-medium text-[10px]">
                          <AlertTriangle className="h-3 w-3" />
                          Indisponível nesta data
                        </span>
                      )}
                    </div>

                    {/* Histórico Específico de Dupla (quando o parceiro está definido) */}
                    {partner && (
                      <div className="mt-1 pt-1 border-t border-surface-300 flex flex-col gap-1 text-[10px]">
                        {!compatibility.isCompatible ? (
                          <span className="flex items-center gap-1 text-red-700 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded font-bold">
                            <AlertTriangle className="h-3 w-3 text-red-600" />
                            {compatibility.reason}
                          </span>
                        ) : pairCount > 0 ? (
                          <span className="flex items-center gap-1 text-amber-700 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded font-medium">
                            <Users2 className="h-3 w-3 text-amber-600" />
                            Já saíram juntos {pairCount}x
                            {pairHistoryInfo}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-medium">
                            <Sparkles className="h-3 w-3 text-emerald-500" />
                            Nunca saíram juntos (Excelente para variar)
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

