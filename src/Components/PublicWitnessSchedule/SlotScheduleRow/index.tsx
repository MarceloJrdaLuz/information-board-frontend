import React, { useEffect, useMemo, useState } from "react"
import { useAtom } from "jotai"
import { dirtyMonthScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IPublicWitnessTimeSlot } from "@/types/publicWitness"
import { IAssignmentsHistoryResponse } from "@/types/publicWitness/schedules"
import { IPublisher } from "@/types/types"
import {
  AlertCircleIcon,
  AlertTriangle,
  Clock,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  User,
  Users2,
  X
} from "lucide-react"
import dayjs from "dayjs"
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
  publishersCount?: Record<string, number>
}

export default function SlotScheduleRow({
  slot,
  date,
  assignment,
  publishers,
  publishersCount
}: Props) {
  const { congregation } = useCongregationContext()
  const [dirty, setDirty] = useAtom(dirtyMonthScheduleAtom)
  const [selectedPublishers, setSelectedPublishers] = useState<IPublisher[]>([])
  const isEditable = slot.is_rotative

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

  const handleRemovePublisher = (publisherId: string) => {
    if (!isEditable) return
    const updated = selectedPublishers.filter(p => p.id !== publisherId)
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
    if (selectedPublishers.length < 2) return false
    const getGenderNorm = (g?: string) => {
      if (!g) return "M"
      return g.trim().toLowerCase().startsWith("f") ? "F" : "M"
    }

    for (let i = 0; i < selectedPublishers.length; i++) {
      for (let j = i + 1; j < selectedPublishers.length; j++) {
        const p1 = selectedPublishers[i]
        const p2 = selectedPublishers[j]
        const g1 = getGenderNorm(p1.gender)
        const g2 = getGenderNorm(p2.gender)
        if (g1 !== g2) {
          if (!p1.family_id || !p2.family_id || p1.family_id !== p2.family_id) {
            return true
          }
        }
      }
    }
    return false
  }, [selectedPublishers])

  // Status visual do slot
  const isFilled = selectedPublishers.length >= 2
  const isPartial = selectedPublishers.length === 1

  return (
    <div
      className={`
        flex flex-col gap-3 rounded-xl p-4 transition-all duration-200 border
        ${
          !isEditable
            ? "bg-surface-50 border-surface-300"
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
              Completo ({selectedPublishers.length}/2)
            </span>
          ) : isPartial ? (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
              Incompleto (1/2)
            </span>
          ) : (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-semibold">
              Vago (0/2)
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-typography-600 flex items-center gap-1">
              <User className="h-3 w-3 text-primary-200" />
              1º Publicador:
            </span>
            <PublicWitnessPublisherSelect
              value={selectedPublishers[0]?.id || null}
              onChange={id => handleSetSlotPosition(0, id)}
              partner={selectedPublishers[1] || null}
              publishers={publishers}
              date={date}
              slotId={slot.id}
              slotPreferences={slotPreferences}
              daysSinceLastMap={daysSinceLastMap}
              lastCartDateMap={lastCartDateMap}
              pairCountMap={pairCountMap}
              assignedTodayIds={assignedTodayIds}
              placeholder="Selecionar 1º Publicador..."
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-typography-600 flex items-center gap-1">
              <Users2 className="h-3 w-3 text-amber-500" />
              2º Publicador (Dupla):
            </span>
            <PublicWitnessPublisherSelect
              value={selectedPublishers[1]?.id || null}
              onChange={id => handleSetSlotPosition(1, id)}
              partner={selectedPublishers[0] || null}
              publishers={publishers}
              date={date}
              slotId={slot.id}
              slotPreferences={slotPreferences}
              daysSinceLastMap={daysSinceLastMap}
              lastCartDateMap={lastCartDateMap}
              pairCountMap={pairCountMap}
              assignedTodayIds={assignedTodayIds}
              placeholder="Selecionar Dupla Inteligente..."
            />
          </div>
        </div>
      ) : (
        <div className="text-xs text-typography-600 italic">
          Horário fixo: publicadores configurados por padrão no arranjo.
        </div>
      )}

      {/* Publicadores selecionados em formato de cartões / tags com detalhes */}
      {selectedPublishers.length > 0 && (
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

                {isEditable && (
                  <button
                    type="button"
                    onClick={() => handleRemovePublisher(p.id)}
                    className="text-typography-400 hover:text-red-500 transition-colors ml-1 p-0.5 rounded hover:bg-surface-200"
                    title="Remover deste horário"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
