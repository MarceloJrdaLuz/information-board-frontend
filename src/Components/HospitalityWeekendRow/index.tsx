import { useAtom, useAtomValue, useSetAtom } from "jotai"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { useEffect, useMemo, useState } from "react"

import {
  dirtyWeekendsAtom,
  hospitalityGroup,
  hospitalityWeekendsAtom,
  updateAssignmentStatusAtom,
} from "@/atoms/hospitalityWeekendScheduleAtoms"
import { buildHospitalityOptions } from "@/functions/buildHospitalityGroupOptions"
import { IHospitalityGroup } from "@/types/types"
import { formatPhoneNumber } from "@/utils/formatPhoneNumber"
import { hospitalityMap } from "@/utils/hospitalityMap"
import CheckboxBoolean from "../CheckboxBoolean"
import DropdownObject from "../DropdownObjects"
import WhatsAppIcon from "../Icons/WhatsAppIcon"
import { IHospitalityEventType, IRecordHospitalityAssignment, IRecordHospitalityWeekend } from "@/types/hospitality"
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Home,
  Moon,
  Plus,
  Send,
  User,
  Users,
  Utensils,
  X
} from "lucide-react"

interface Props {
  date: Date
}

interface IWhatsAppLink {
  link: string
  destinationName: string
}

interface EventTypeConfig {
  key: IHospitalityEventType
  label: string
  icon: typeof Utensils
  badgeClass: string
  activeButtonClass: string
}

const EVENT_CONFIGS: EventTypeConfig[] = [
  {
    key: IHospitalityEventType.HOSTING,
    label: "Hospedagem",
    icon: Home,
    badgeClass: "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    activeButtonClass: "bg-purple-600 text-white border-purple-600 shadow-sm",
  },
  {
    key: IHospitalityEventType.LUNCH,
    label: "Almoço",
    icon: Utensils,
    badgeClass: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    activeButtonClass: "bg-amber-600 text-white border-amber-600 shadow-sm",
  },
  {
    key: IHospitalityEventType.DINNER,
    label: "Jantar",
    icon: Moon,
    badgeClass: "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    activeButtonClass: "bg-blue-600 text-white border-blue-600 shadow-sm",
  },
]

export default function HospitalityRow({ date }: Props) {
  dayjs.locale("pt-br")
  const groups = useAtomValue(hospitalityGroup)
  const [weekends, setWeekends] = useAtom(hospitalityWeekendsAtom) as unknown as [
    Record<string, IRecordHospitalityWeekend>,
    (v: any) => void
  ]
  const updateAssignmentStatus = useSetAtom(updateAssignmentStatusAtom)
  const [whatsappLinks, setWhatsappLinks] = useState<Record<IHospitalityEventType, IWhatsAppLink[]>>({
    [IHospitalityEventType.HOSTING]: [],
    [IHospitalityEventType.LUNCH]: [],
    [IHospitalityEventType.DINNER]: [],
  })

  const dateKey = dayjs(date).format("YYYY-MM-DD")
  const weekend =
    weekends?.[dateKey] ??
    ({ date: dateKey, assignments: [] } as IRecordHospitalityWeekend)

  const [dirtyWeekends, setDirtyWeekends] = useAtom(dirtyWeekendsAtom)

  const groupsWithLabel = buildHospitalityOptions(groups, {
    ...weekends,
    ...dirtyWeekends,
  })

  const [activeEvents, setActiveEvents] = useState<Record<IHospitalityEventType, boolean>>({
    [IHospitalityEventType.HOSTING]: false,
    [IHospitalityEventType.LUNCH]: false,
    [IHospitalityEventType.DINNER]: false,
  })

  // Atualiza checkboxes quando os dados do backend chegam
  useEffect(() => {
    const assignedTypes = weekend.assignments.map(a => a.eventType)
    const newActiveEvents = {
      [IHospitalityEventType.HOSTING]: assignedTypes.includes(IHospitalityEventType.HOSTING),
      [IHospitalityEventType.LUNCH]: assignedTypes.includes(IHospitalityEventType.LUNCH),
      [IHospitalityEventType.DINNER]: assignedTypes.includes(IHospitalityEventType.DINNER),
    }

    const changed = Object.keys(newActiveEvents).some(
      k => activeEvents[k as IHospitalityEventType] !== newActiveEvents[k as IHospitalityEventType]
    )

    if (changed) {
      setActiveEvents(newActiveEvents)
    }
  }, [weekend.assignments])

  useEffect(() => {
    if (!weekend?.assignments?.length) return

    setWhatsappLinks(prevLinks => {
      const updatedLinks = { ...prevLinks }
      let changed = false

      weekend.assignments
        .filter(a => a.completed && a.group_id)
        .forEach(assignment => {
          const group = groups.find(g => g.id === assignment.group_id)
          if (!group) return

          if (updatedLinks[assignment.eventType]?.length) return

          const message = `Olá, tudo bem?\n\n Gostaria de lembrar que o grupo de vocês: *${
            group.host?.nickname && group.host.nickname !== "" ? group.host.nickname : group.host?.fullName
          }*, *${
            group.members
              .map(g => g.nickname?.trim() || g.fullName?.trim() || "Sem nome")
              .join(", ")
          }* está responsável para dar a(o) ${hospitalityMap[assignment.eventType]} ao orador no dia: *${dayjs(
            date
          ).format("DD/MM/YYYY")}*.\n\n O orador já confirmou.`

          const encodedMessage = encodeURIComponent(message)
          const links: IWhatsAppLink[] = []

          if (group.host?.phone) {
            links.push({
              link: `https://api.whatsapp.com/send?phone=55${formatPhoneNumber(
                group.host.phone
              )}&text=${encodedMessage}`,
              destinationName: `${group.host?.nickname && group.host.nickname !== "" ? group.host.nickname : group.host?.fullName || "Anfitrião"} (Anfitrião)`,
            })
          }

          group.members
            .filter(m => m.phone)
            .forEach(m => {
              links.push({
                link: `https://api.whatsapp.com/send?phone=55${formatPhoneNumber(
                  m.phone!
                )}&text=${encodedMessage}`,
                destinationName: m.nickname && m.nickname !== "" ? m.nickname : m.fullName || "Contato",
              })
            })

          updatedLinks[assignment.eventType] = links
          changed = true
        })

      return changed ? updatedLinks : prevLinks
    })
  }, [groups, weekend.date, weekend.assignments, date])

  // Toggle do evento (adiciona ou remove assignment)
  function onEventToggle(eventType: IHospitalityEventType, enabled: boolean) {
    let updatedAssignments = [...(weekend.assignments ?? [])]

    if (!enabled) {
      updatedAssignments = updatedAssignments.filter(a => a.eventType !== eventType)
      setWhatsappLinks(prev => ({ ...prev, [eventType]: [] }))
    } else {
      if (!updatedAssignments.find(a => a.eventType === eventType)) {
        updatedAssignments.push({
          eventType,
          group_id: "",
          completed: false,
        } as IRecordHospitalityAssignment)
      }
    }

    const updatedWeekend = { ...weekend, assignments: updatedAssignments }
    setWeekends({ ...(weekends ?? {}), [dateKey]: updatedWeekend })
    setDirtyWeekends(prev => ({ ...prev, [dateKey]: updatedWeekend }))
  }

  function onGroupChange(eventType: IHospitalityEventType, group: IHospitalityGroup | null) {
    let updatedAssignments = [...(weekend.assignments ?? [])]
    const idx = updatedAssignments.findIndex(a => a.eventType === eventType)

    if (idx >= 0) {
      if (group) {
        updatedAssignments[idx] = {
          ...updatedAssignments[idx],
          group_id: group.id,
          group_host_fullName: group.host?.fullName,
          group_host_nickname: group.host?.nickname,
        }
      } else {
        updatedAssignments[idx] = {
          ...updatedAssignments[idx],
          group_id: "",
          group_host_fullName: "",
          group_host_nickname: "",
          completed: false,
        }
        setWhatsappLinks(prev => ({ ...prev, [eventType]: [] }))
      }
    }

    const updatedWeekend = { ...weekend, assignments: updatedAssignments }
    setWeekends({ ...(weekends ?? {}), [dateKey]: updatedWeekend })
    setDirtyWeekends(prev => ({ ...prev, [dateKey]: updatedWeekend }))
  }

  function onCompletedChange(
    assignment: IRecordHospitalityAssignment,
    completed: boolean
  ) {
    if (!assignment.id) return

    const updatedAssignments = (weekend.assignments ?? []).map(a =>
      a.eventType === assignment.eventType && a.group_id === assignment.group_id
        ? { ...a, completed }
        : a
    )

    const updatedWeekend = { ...weekend, assignments: updatedAssignments }

    setWeekends({ ...(weekends ?? {}), [dateKey]: updatedWeekend })
    setDirtyWeekends(prev => ({ ...prev, [dateKey]: updatedWeekend }))
    updateAssignmentStatus({ assignment_id: assignment.id, completed })

    if (completed && assignment.group_id) {
      const group = groups.find(g => g.id === assignment.group_id)
      if (group) {
        const message = `Olá!\n\n Gostaria de lembrar que o grupo de vocês: *${
          group.host?.nickname && group.host.nickname !== "" ? group.host.nickname : group.host?.fullName
        }*, *${
          group.members
            .map(g => g.nickname?.trim() || g.fullName?.trim() || "Sem nome")
            .join(", ")
        }* está responsável para dar a(o) ${hospitalityMap[assignment.eventType]} ao orador no dia: *${dayjs(
          date
        ).format("DD/MM/YYYY")}*.\n\n O orador já confirmou.`

        const encodedMessage = encodeURIComponent(message)
        const links: IWhatsAppLink[] = []

        if (group.host?.phone) {
          links.push({
            link: `https://api.whatsapp.com/send?phone=55${formatPhoneNumber(
              group.host.phone
            )}&text=${encodedMessage}`,
            destinationName: `${group.host.fullName || group.host.nickname || "Anfitrião"} (Anfitrião)`,
          })
        }

        group.members
          .filter(m => m.phone)
          .forEach(m => {
            links.push({
              link: `https://api.whatsapp.com/send?phone=55${formatPhoneNumber(
                m.phone!
              )}&text=${encodedMessage}`,
              destinationName: m.fullName || "Contato",
            })
          })

        setWhatsappLinks(prev => ({ ...prev, [assignment.eventType]: links }))
      }
    } else {
      setWhatsappLinks(prev => ({ ...prev, [assignment.eventType]: [] }))
    }
  }

  // Estatísticas e status do card
  const activeCount = Object.values(activeEvents).filter(Boolean).length
  const assignedCount = weekend.assignments.filter(a => !!a.group_id).length
  const confirmedCount = weekend.assignments.filter(a => !!a.group_id && a.completed).length

  const dayOfWeek = dayjs(date).format("dddd")
  const formattedDay = dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)
  const formattedFullDate = dayjs(date).format("DD [de] MMMM [de] YYYY")

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ==================================================== */}
      {/* 1. HEADER DO FIM DE SEMANA                           */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-300">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary-100/20 text-primary-200 shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-typography-900 leading-tight">
              {formattedDay}, {dayjs(date).format("DD [de] MMMM")}
            </span>
            <span className="text-xs text-typography-500 font-medium">
              {dayjs(date).format("YYYY")}
            </span>
          </div>
        </div>

        {/* Badges de Resumo */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeCount === 0 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-200 text-typography-500 border border-surface-300">
              Sem eventos definidos
            </span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100/15 text-primary-200 border border-primary-200/20">
                <Utensils className="h-3.5 w-3.5" />
                {activeCount} {activeCount === 1 ? "arranjo" : "arranjos"}
              </span>

              {assignedCount > 0 && confirmedCount === assignedCount ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Orador confirmou ({confirmedCount}/{assignedCount})
                </span>
              ) : assignedCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                  <Clock className="h-3.5 w-3.5" />
                  Aguardando orador ({confirmedCount}/{assignedCount})
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. SELETOR DE EVENTOS (Hospedagem, Almoço, Jantar)   */}
      {/* ==================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-surface-200/40 p-3 rounded-xl border border-surface-300/80">
        <span className="text-xs font-bold text-typography-700 uppercase tracking-wider">
          Arranjos para este fim de semana:
        </span>

        <div className="flex items-center gap-2 flex-wrap">
          {EVENT_CONFIGS.map(cfg => {
            const isActive = activeEvents[cfg.key]
            const Icon = cfg.icon

            return (
              <button
                key={cfg.key}
                type="button"
                onClick={() => {
                  const nextState = !isActive
                  setActiveEvents(prev => ({ ...prev, [cfg.key]: nextState }))
                  onEventToggle(cfg.key, nextState)
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  isActive
                    ? cfg.activeButtonClass
                    : "bg-surface-100 text-typography-600 border-surface-300 hover:border-typography-400 hover:text-typography-900"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cfg.label}</span>
                {isActive && <Check className="h-3 w-3 ml-0.5" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. GRID DOS EVENTOS ATIVOS                          */}
      {/* ==================================================== */}
      {activeCount === 0 ? (
        <div className="p-5 text-center text-xs text-typography-500 bg-surface-200/20 rounded-xl border border-dashed border-surface-300">
          Nenhum arranjo ativado para esta semana. Clique nos botões acima (Hospedagem, Almoço ou Jantar) para definir os responsáveis.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-1">
          {EVENT_CONFIGS.map(cfg => {
            if (!activeEvents[cfg.key]) return null

            const selectedAssignment =
              weekend.assignments.find(a => a.eventType === cfg.key) ?? null
            const selectedGroupId = selectedAssignment?.group_id ?? ""
            const selectedGroup = groups.find(g => g.id === selectedGroupId)
            const isConfirmed = selectedAssignment?.completed ?? false
            const Icon = cfg.icon

            return (
              <div
                key={cfg.key}
                className="flex flex-col justify-between gap-3.5 bg-surface-200/40 border border-surface-300 rounded-xl p-4 shadow-sm hover:border-typography-300 transition-all"
              >
                {/* Header do Card de Evento */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${cfg.badgeClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-sm text-typography-900">
                      {cfg.label}
                    </span>
                  </div>

                  {/* Status do Evento */}
                  {selectedGroupId ? (
                    isConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="h-3 w-3" />
                        Orador confirmou
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="h-3 w-3" />
                        Aguardando orador
                      </span>
                    )
                  ) : (
                    <span className="text-[11px] text-typography-400 font-medium italic">
                      Não atribuído
                    </span>
                  )}
                </div>

                {/* Dropdown de Seleção de Grupo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-typography-600 uppercase tracking-wider">
                    Grupo de Hospitalidade:
                  </label>
                  <DropdownObject
                    textVisible
                    title="Selecione o grupo"
                    items={groupsWithLabel}
                    selectedItem={
                      groupsWithLabel.find(g => g.id === selectedGroupId) ?? null
                    }
                    handleChange={item => onGroupChange(cfg.key, item)}
                    labelKey="displayLabel"
                    border
                    full
                    emptyMessage="Nenhum grupo cadastrado"
                    searchable
                  />
                </div>

                {/* Informações do Grupo Selecionado */}
                {selectedGroup && (
                  <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-surface-100 border border-surface-300 text-xs">
                    <div className="flex items-center gap-1.5 text-typography-800 font-medium">
                      <Home className="h-3.5 w-3.5 text-primary-200 shrink-0" />
                      <span>Anfitrião: <strong>{selectedGroup.host?.fullName || "Não definido"}</strong></span>
                    </div>

                    {selectedGroup.members && selectedGroup.members.length > 0 && (
                      <div className="text-[11px] text-typography-500">
                        Integrantes: {selectedGroup.members.map(m => m.fullName).join(", ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Confirmação e Notificações WhatsApp */}
                <div className="pt-2 border-t border-surface-300 flex flex-col gap-2.5">
                  {selectedAssignment?.id ? (
                    <div className="flex items-center justify-between">
                      <CheckboxBoolean
                        label="Orador confirmou"
                        checked={selectedAssignment.completed}
                        handleCheckboxChange={checked =>
                          onCompletedChange(selectedAssignment, checked)
                        }
                      />
                    </div>
                  ) : (
                    <span className="text-[11px] text-typography-400 italic">
                      Salve a programação para confirmar o orador e habilitar links de WhatsApp.
                    </span>
                  )}

                  {/* Links de WhatsApp */}
                  {whatsappLinks[cfg.key]?.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-typography-500">
                        Enviar lembrete via WhatsApp:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {whatsappLinks[cfg.key].map((item, i) => (
                          <a
                            key={i}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-xs"
                          >
                            <WhatsAppIcon w="14" h="14" />
                            <span>{item.destinationName}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
