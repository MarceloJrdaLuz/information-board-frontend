import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPublicWitnessTimeSlot } from "@/types/publicWitness"
import { IAssignmentsHistoryResponse } from "@/types/publicWitness/schedules"
import { IPublisher } from "@/types/types"
import dayjs from "dayjs"
import { useAtom } from "jotai"
import { Button } from "@/Components/ui/button"
import {
    AlertCircleIcon,
    AlertTriangle,
    Clock,
    Lock,
    Plus,
    RefreshCw,
    SlidersHorizontal,
    Trash2,
    User,
    Users2
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { PublicWitnessPublisherSelect } from "../PublicWitnessPublisherSelect"

export interface IPublicWitnessAssignment {
  id: string
  time_slot_id: string
  date: string
  publishers: {
    id: string
    publisher_id: string
    order: number
    publisher: IPublisher
  }[]
}

interface Props {
  slot: IPublicWitnessTimeSlot
  date: string
  assignment?: IPublicWitnessAssignment
  publishers: IPublisher[]
  allPublishers?: IPublisher[]
  allSlots?: IPublicWitnessTimeSlot[]
  publishersCount?: Record<string, number>
  isSpecialDate?: boolean
}

export default function SlotScheduleRow({
  slot,
  date,
  assignment,
  publishers,
  allPublishers,
  allSlots,
  publishersCount,
  isSpecialDate = false
}: Props) {
  const { congregation } = useCongregationContext()
  const [dirty, setDirty] = useAtom(dirtyMonthScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([])
  const isEditable = isSpecialDate || slot.is_rotative

  const [slotsCount, setSlotsCount] = useState<number>(() => {
    return Math.max(2, assignment?.publishers?.length || slot.defaultPublishers?.length || 2)
  })

  // Sincroniza slotsCount quando assignment mudar
  useEffect(() => {
    if (assignment?.publishers?.length) {
      setSlotsCount(prev => Math.max(prev, assignment.publishers.length))
    } else if (slot.defaultPublishers?.length) {
      setSlotsCount(prev => Math.max(prev, slot.defaultPublishers.length))
    }
  }, [assignment, slot.defaultPublishers])

  const urlFetch = congregation?.id
    ? `public-witness/schedules/congregation/${congregation.id}/history`
    : ""

  const { data: history } = useAuthorizedFetch<IAssignmentsHistoryResponse>(urlFetch, {
    allowedRoles: ["ADMIN_CONGREGATION", "PUBLIC_WITNESS_MANAGER"]
  })

  // 🔄 Inicializa com publishers do assignment ou fixos
  useEffect(() => {
    if (!publishers.length) return

    const hasDirtyForSlot = dirty?.[date]?.slots?.some(s => s.time_slot_id === slot.id)
    if (hasDirtyForSlot) return

    let initialSelected: IPublisher[] = []

    if (assignment?.publishers?.length) {
      initialSelected = assignment.publishers
        .slice()
        .sort((a, b) => a.order - b.order)
        .map(p => {
          const pubId = p.publisher?.id || p.publisher_id
          return publishers.find(o => o.id === pubId)
        })
        .filter(Boolean) as IPublisher[]
    } else if (slot.defaultPublishers?.length) {
      initialSelected = slot.defaultPublishers
        .map(dp => {
          const pubId = dp.publisher?.id || dp.publisher_id
          return publishers.find(o => o.id === pubId)
        })
        .filter(Boolean) as IPublisher[]
    }

    setSelectedPublishers(initialSelected)
  }, [assignment, publishers, slot.id, slot.defaultPublishers, date, dirty])

  const leaderOfDay = useMemo(() => {
    if (!history?.fieldServiceHistory?.length) return null
    const entry = history.fieldServiceHistory.find(h => h.date === date)
    return entry?.leader_id ?? null
  }, [history, date])

  // Preferências cadastradas para este horário
  const slotPreferences = useMemo(() => {
    const set = new Set<string>()
    slot.preferences?.forEach(pref => set.add(pref.publisher_id))
    return set
  }, [slot.preferences])

  // Publicadores específicos deste horário (via preferência ou defaultPublishers)
  const thisSlotSpecificIds = useMemo(() => {
    const ids = new Set<string>()
    slot.preferences?.forEach(pref => ids.add(pref.publisher_id))
    slot.defaultPublishers?.forEach(dp => ids.add(dp.publisher_id))
    return ids
  }, [slot.preferences, slot.defaultPublishers])

  // Publicadores com preferência em outros horários deste arranjo
  const otherSlotsSpecificIds = useMemo(() => {
    const ids = new Set<string>()
    allSlots?.forEach(s => {
      if (s.id !== slot.id) {
        s.preferences?.forEach(pref => ids.add(pref.publisher_id))
      }
    })
    return ids
  }, [allSlots, slot.id])

  // Publicadores elegíveis que participam deste horário
  const slotEligiblePublishers = useMemo(() => {
    if (thisSlotSpecificIds.size > 0) {
      return publishers.filter(p => thisSlotSpecificIds.has(p.id) || selectedPublishers.some(sp => sp.id === p.id))
    }

    return publishers.filter(p => {
      if (otherSlotsSpecificIds.has(p.id) && !thisSlotSpecificIds.has(p.id)) {
        if (selectedPublishers.some(sp => sp.id === p.id)) return true
        return false
      }
      return true
    })
  }, [publishers, thisSlotSpecificIds, otherSlotsSpecificIds, selectedPublishers])

  // Publicadores já escalados neste dia em outros horários ou dirigentes
  const assignedTodayIds = useMemo(() => {
    const set = new Set<string>()
    if (leaderOfDay) set.add(leaderOfDay)

    Object.entries(publishersCount ?? {}).forEach(([pubId, count]) => {
      const inThisSlot = selectedPublishers.some(p => p.id === pubId)
      if (count > (inThisSlot ? 1 : 0)) {
        set.add(pubId)
      }
    })
    return set
  }, [leaderOfDay, publishersCount, selectedPublishers])

  // Histórico de saídas no carrinho e duplas formadas
  const { lastCartDateMap, daysSinceLastMap, pairCountMap } = useMemo(() => {
    const lastDateMap = new Map<string, string>()
    const pairMap = new Map<string, { count: number; lastDate?: string }>()

    const recordPair = (id1: string, id2: string, pairDate: string) => {
      if (id1 === id2) return
      const key = id1 < id2 ? `${id1}:${id2}` : `${id2}:${id1}`
      const existing = pairMap.get(key) || { count: 0, lastDate: undefined }
      const newCount = existing.count + 1
      const newLastDate = !existing.lastDate || dayjs(pairDate).isAfter(existing.lastDate)
        ? pairDate
        : existing.lastDate
      pairMap.set(key, { count: newCount, lastDate: newLastDate })
    }

    const recordPublisherDate = (pubId: string, pubDate: string) => {
      const prev = lastDateMap.get(pubId)
      if (!prev || dayjs(pubDate).isAfter(prev)) {
        lastDateMap.set(pubId, pubDate)
      }
    }

    // 1. Processa histórico salvo de arranjos
    history?.history?.forEach(arrangement => {
      arrangement.schedule?.forEach(day => {
        day.slots?.forEach(s => {
          const pubs = s.publishers || []
          for (let i = 0; i < pubs.length; i++) {
            recordPublisherDate(pubs[i].id, day.date)
            for (let j = i + 1; j < pubs.length; j++) {
              recordPair(pubs[i].id, pubs[j].id, day.date)
            }
          }
        })
      })
    })

    // 2. Processa alterações temporárias não salvas (dirty)
    if (dirty) {
      Object.entries(dirty).forEach(([dirtyDate, dayData]) => {
        dayData.slots?.forEach(s => {
          const pubs = s.publishers || []
          for (let i = 0; i < pubs.length; i++) {
            recordPublisherDate(pubs[i].publisher_id, dirtyDate)
            for (let j = i + 1; j < pubs.length; j++) {
              recordPair(pubs[i].publisher_id, pubs[j].publisher_id, dirtyDate)
            }
          }
        })
      })
    }

    // Calcula dias desde a última saída para a data atual
    const daysSinceMap = new Map<string, number | null>()
    publishers.forEach(p => {
      const last = lastDateMap.get(p.id)
      if (!last) {
        daysSinceMap.set(p.id, null)
      } else {
        const diff = dayjs(date).diff(dayjs(last), "day")
        daysSinceMap.set(p.id, Math.max(0, diff))
      }
    })

    return {
      lastCartDateMap: lastDateMap,
      daysSinceLastMap: daysSinceMap,
      pairCountMap: pairMap
    }
  }, [history, dirty, date, publishers])

  const updateDirty = (items: IPublisher[]) => {
    setDirty(prev => ({
      ...prev,
      [date]: {
        date,
        slots: [
          ...(prev[date]?.slots ?? []).filter(s => s.time_slot_id !== slot.id),
          {
            time_slot_id: slot.id,
            publishers: items.map((p, index) => ({
              publisher_id: p.id,
              order: index + 1
            }))
          }
        ]
      }
    }))
  }

  const handleSetSlotPosition = (index: number, publisherId: string | null) => {
    if (!isEditable) return
    const updated = [...selectedPublishers]

    if (!publisherId) {
      updated.splice(index, 1)
    } else {
      const found = publishers.find(p => p.id === publisherId)
      if (found) {
        const filtered = updated.filter(p => p.id !== publisherId)
        if (index >= filtered.length) {
          filtered.push(found)
        } else {
          filtered[index] = found
        }
        setSelectedPublishers(filtered)
        updateDirty(filtered)
        return
      }
    }

    setSelectedPublishers(updated)
    updateDirty(updated)
  }

  // Nomes dos publicadores que têm preferência por este horário
  const preferredPublishersNames = useMemo(() => {
    if (!slot.preferences?.length) return []
    return slot.preferences
      .map(pref => {
        const pub = publishers.find(p => p.id === pref.publisher_id)
        return pub?.nickname || pub?.fullName
      })
      .filter(Boolean)
  }, [slot.preferences, publishers])

  // Verificação de conflito de gênero/família entre os selecionados no slot
  const hasGenderFamilyConflict = useMemo(() => {
    // Se houver mais de 2 pessoas (3 ou 4), é um grupo e não há conflito de homem e mulher sozinhos!
    if (selectedPublishers.length !== 2) return false

    const getGenderNorm = (g?: string) => {
      if (!g) return "M"
      return g.trim().toLowerCase().startsWith("f") ? "F" : "M"
    }

    const p1 = selectedPublishers[0]
    const p2 = selectedPublishers[1]
    const g1 = getGenderNorm(p1.gender)
    const g2 = getGenderNorm(p2.gender)

    if (g1 !== g2) {
      if (!p1.family_id || !p2.family_id || p1.family_id !== p2.family_id) {
        return true
      }
    }

    return false
  }, [selectedPublishers])

  const handleAddSpot = () => {
    setSlotsCount(prev => Math.min(4, prev + 1))
  }

  const handleRemoveSpot = (indexToRemove: number) => {
    const next = selectedPublishers.filter((_, idx) => idx !== indexToRemove)
    setSelectedPublishers(next)
    setSlotsCount(prev => Math.max(2, prev - 1))
    updateDirty(next)
  }

  // Status visual do slot
  const isFilled = selectedPublishers.length >= slotsCount
  const isPartial = selectedPublishers.length > 0 && selectedPublishers.length < slotsCount

  return (
    <div
      className={`
        flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 border
        ${
          !isEditable
            ? "bg-surface-200/50 border-surface-300"
            : hasGenderFamilyConflict
            ? "bg-red-50/20 border-red-300 shadow-sm"
            : isFilled
            ? "bg-surface-100 border-green-300/80 shadow-sm"
            : isPartial
            ? "bg-surface-100 border-amber-300/80 shadow-sm"
            : "bg-surface-100 border-surface-300 shadow-sm"
        }
      `}
    >
      {/* Linha de cabeçalho do horário */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-200 text-typography-800 font-semibold text-xs sm:text-sm">
            <Clock className="w-3.5 h-3.5 text-primary-200" />
            <span>
              {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
            </span>
          </div>

          {slot.is_rotative ? (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
              <RefreshCw className="w-3 h-3 text-blue-600" />
              Rodízio
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-surface-200 text-typography-700 font-medium">
              <Lock className="w-3 h-3 text-typography-500" />
              Fixo
            </span>
          )}

          {preferredPublishersNames.length > 0 && (
            <span
              className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium"
              title={`Preferências para este horário: ${preferredPublishersNames.join(", ")}`}
            >
              <SlidersHorizontal className="w-3 h-3 text-amber-600" />
              {preferredPublishersNames.length}{" "}
              {preferredPublishersNames.length === 1 ? "preferência" : "preferências"}
            </span>
          )}
        </div>

        {/* Status de preenchimento */}
        <div>
          {isFilled ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-green-100 text-green-800 font-semibold">
              Completo ({selectedPublishers.length}/{slotsCount})
            </span>
          ) : isPartial ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Incompleto ({selectedPublishers.length}/{slotsCount})
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
              Vago (0/{slotsCount})
            </span>
          )}
        </div>
      </div>

      {/* Alerta de Incompatibilidade de Gênero/Família */}
      {hasGenderFamilyConflict && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-100/80 border border-red-300 text-red-800 text-xs font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>
            Atenção: Um homem e uma mulher de famílias diferentes estão selecionados juntos neste horário.
          </span>
        </div>
      )}

      {/* Seleção de publicadores por vagas inteligentes */}
      {isEditable ? (
        <div className="flex flex-col gap-2.5">
          <div className={`grid grid-cols-1 ${slotsCount === 2 ? 'sm:grid-cols-2' : slotsCount === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'} gap-2.5`}>
            {Array.from({ length: slotsCount }).map((_, pos) => {
              const currentPub = selectedPublishers[pos] || null
              const otherPartners = selectedPublishers.filter((p, idx) => idx !== pos && Boolean(p))
              const label = pos === 0
                ? "1º Publicador:"
                : pos === 1
                ? "2º Publicador (Dupla):"
                : `${pos + 1}º Publicador:`

              return (
                <div key={pos} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-typography-600 flex items-center gap-1">
                      {pos === 0 ? (
                        <User className="h-3 w-3 text-primary-200" />
                      ) : (
                        <Users2 className="h-3 w-3 text-amber-500" />
                      )}
                      {label}
                    </span>
                    {pos >= 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSpot(pos)}
                        className="text-[10px] text-red-500 hover:text-red-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                        title="Remover esta vaga"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                        Remover vaga
                      </button>
                    )}
                  </div>
                  <PublicWitnessPublisherSelect
                    value={currentPub?.id || null}
                    onChange={id => handleSetSlotPosition(pos, id)}
                    partner={otherPartners[0] || null}
                    partners={otherPartners}
                    publishers={slotEligiblePublishers}
                    allPublishers={allPublishers || publishers}
                    date={date}
                    slotId={slot.id}
                    slotPreferences={slotPreferences}
                    daysSinceLastMap={daysSinceLastMap}
                    lastCartDateMap={lastCartDateMap}
                    pairCountMap={pairCountMap}
                    assignedTodayIds={assignedTodayIds}
                    placeholder={pos === 0 ? "Selecionar 1º Publicador..." : pos === 1 ? "Selecionar Dupla Inteligente..." : `Selecionar ${pos + 1}º Publicador...`}
                  />
                </div>
              )
            })}
          </div>

          {slotsCount < 4 && (
            <div className="flex justify-end pt-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAddSpot}
                className="text-[11px] h-7 px-2 text-primary-200 hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 flex items-center gap-1 cursor-pointer font-medium"
              >
                <Plus className="w-3 h-3" />
                Adicionar {slotsCount + 1}ª Vaga
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-typography-600 italic">
          Horário fixo: publicadores configurados por padrão no arranjo.
        </div>
      )}

      {/* Exibe tags de publicadores apenas em horários fixos (onde não há dropdowns) */}
      {!isEditable && selectedPublishers.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1 border-t border-surface-300/60 mt-1">
          {selectedPublishers.map((p, index) => {
            const totalInOtherSlots = publishersCount?.[p.id] ?? 0
            const duplicatesInThisSlot = selectedPublishers
              .slice(0, index)
              .filter(sp => sp.id === p.id).length
            const hasOtherSlotConflict = totalInOtherSlots > 0 || duplicatesInThisSlot > 0
            const isLeaderOfDay = leaderOfDay === p.id

            const initials = (p.nickname || p.fullName)
              .split(" ")
              .map(n => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase()

            return (
              <div
                key={p.id + index}
                className={`
                  flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-xs
                  ${
                    isLeaderOfDay
                      ? "bg-amber-50 text-amber-900 border-amber-300"
                      : hasOtherSlotConflict
                      ? "bg-red-50 text-red-800 border-red-300"
                      : "bg-surface-50 text-typography-800 border-surface-300"
                  }
                `}
              >
                <div className="w-5 h-5 rounded-full bg-primary-100/20 text-primary-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {initials}
                </div>

                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {p.nickname || p.fullName}
                </span>

                {isLeaderOfDay && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold"
                    title="Este publicador é o dirigente de campo nesta data"
                  >
                    Dirigente
                  </span>
                )}

                {hasOtherSlotConflict && (
                  <span
                    className="flex items-center text-red-600"
                    title="Conflito: publicador designado mais de uma vez nesta data"
                  >
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
