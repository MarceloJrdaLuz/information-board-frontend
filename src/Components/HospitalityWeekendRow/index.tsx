import { useAtom, useAtomValue, useSetAtom } from "jotai"
import moment from "moment"
import { useEffect, useState } from "react"

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

interface Props {
  date: Date
}

interface IWhatsAppLink {
  link: string
  destinationName: string
}

const EVENT_TYPES: { key: IHospitalityEventType; label: string }[] = [
  { key: IHospitalityEventType.HOSTING, label: "Hospedagem" },
  { key: IHospitalityEventType.DINNER, label: "Jantar" },
  { key: IHospitalityEventType.LUNCH, label: "Almoço" },
]

export default function HospitalityRow({ date }: Props) {
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

  const dateKey = moment(date).format("YYYY-MM-DD")
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

    // Atualiza apenas se houver diferença
    const changed = Object.keys(newActiveEvents).some(
      k => activeEvents[k as IHospitalityEventType] !== newActiveEvents[k as IHospitalityEventType]
    )

    if (changed) {
      setActiveEvents(newActiveEvents)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekend.assignments])

  useEffect(() => {
    if (!weekend?.assignments?.length) return

    setWhatsappLinks(prevLinks => {
      // Criamos uma cópia dos links atuais
      const updatedLinks = { ...prevLinks }

      let changed = false

      weekend.assignments
        .filter(a => a.completed && a.group_id)
        .forEach(assignment => {
          const group = groups.find(g => g.id === assignment.group_id)
          if (!group) return

          // Só gera novamente se ainda não existe link pra esse evento
          if (updatedLinks[assignment.eventType]?.length) return

          const message = `Olá, tudo bem?\n\n Gostaria de lembrar que o grupo de vocês: *${group.host?.nickname && group.host.nickname !== "" ? group.host.nickname : group.host?.fullName}*, *${group.members
            .map(g => g.nickname?.trim() || g.fullName?.trim() || "Sem nome")
            .join(", ")
            }* está responsável para dar a(o) ${hospitalityMap[assignment.eventType]} ao orador no dia: *${moment(
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

          updatedLinks[assignment.eventType] = links
          changed = true
        })

      // Só atualiza o estado se houver realmente algo novo
      return changed ? updatedLinks : prevLinks
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, weekend.date])

  // toggle checkbox → adiciona ou remove assignment
  function onEventToggle(eventType: IHospitalityEventType, enabled: boolean) {
    let updatedAssignments = [...(weekend.assignments ?? [])]

    if (!enabled) {
      updatedAssignments = updatedAssignments.filter(a => a.eventType !== eventType)
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
      // Limpa o grupo e o status
      updatedAssignments[idx] = {
        ...updatedAssignments[idx],
        group_id: "",
        group_host_fullName: "",
        group_host_nickname: "",
        completed: false,
      }
      
      // Limpa os links de WhatsApp desse evento
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
        const message = `Olá!\n\n Gostaria de lembrar que o grupo de vocês: *${group.host?.nickname && group.host.nickname !== "" ? group.host.nickname : group.host?.fullName}*, *${group.members
          .map(g => g.nickname?.trim() || g.fullName?.trim() || "Sem nome")
          .join(", ")
          }* está responsável para dar a(o) ${hospitalityMap[assignment.eventType]} ao orador no dia: *${moment(
            date
          ).format("DD/MM/YYYY")}*.\n\n O orador já confirmou.`
        const encodedMessage = encodeURIComponent(message)

        const links: IWhatsAppLink[] = []

        // ✅ Adiciona o host primeiro (se tiver telefone)
        if (group.host?.phone) {
          links.push({
            link: `https://api.whatsapp.com/send?phone=55${formatPhoneNumber(
              group.host.phone
            )}&text=${encodedMessage}`,
            destinationName: `${group.host.fullName || group.host.nickname || "Anfitrião"} (Anfitrião)`,
          })
        }

        // ✅ Adiciona os membros depois
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

        // ✅ Atualiza apenas os links do evento correspondente
        setWhatsappLinks(prev => ({ ...prev, [assignment.eventType]: links }))
      }
    } else {
      // ❌ Se desmarcar, limpa só os links desse evento
      setWhatsappLinks(prev => ({ ...prev, [assignment.eventType]: [] }))
    }
  }

  return (
    <div className="flex flex-col gap-4 items-start text-typography-800">
      {/* Data + checkboxes */}
      <div className="w-full font-semibold text-primary-200">
        {moment(date).format("DD/MM/YYYY")}
        <div className="flex flex-col items-start gap-1 mt-2">
          {EVENT_TYPES.map(ev => (
            <CheckboxBoolean
              key={ev.key}
              label={ev.label}
              checked={activeEvents[ev.key]}
              handleCheckboxChange={(checked) => {
                setActiveEvents(prev => ({ ...prev, [ev.key]: checked }))
                onEventToggle(ev.key, checked)
              }}
            />
          ))}
        </div>
      </div>

      {/* Dropdowns e checkboxes de completed */}
      {EVENT_TYPES.map(ev => {
        if (!activeEvents[ev.key]) return null

        const selectedAssignment =
          weekend.assignments.find(a => a.eventType === ev.key) ?? null
        const selectedGroupId = selectedAssignment?.group_id ?? ""

        return (
          <div key={ev.key} className="flex flex-col gap-1 w-full border rounded-lg p-6 border-typography-200">

            <DropdownObject
              textVisible
              title={ev.label}
              items={groupsWithLabel}
              selectedItem={
                groupsWithLabel.find(g => g.id === selectedGroupId) ?? null
              }
              handleChange={item => onGroupChange(ev.key, item)}
              labelKey="displayLabel"
              border
              full
              emptyMessage="Nenhum grupo"
              searchable
            />

            {selectedAssignment?.id && (
              <CheckboxBoolean
                label="Confirmado"
                checked={selectedAssignment.completed}
                handleCheckboxChange={checked =>
                  onCompletedChange(selectedAssignment, checked)
                }
              />
            )}
            {whatsappLinks[ev.key]?.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {whatsappLinks[ev.key].map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
                  >
                    <WhatsAppIcon w="20" h="20"/>
                    <span>{item.destinationName}</span>
                  </a>
                ))}
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}
