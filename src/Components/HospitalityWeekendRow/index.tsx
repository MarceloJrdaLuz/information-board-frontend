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
import {
  IHospitalityEventType,
  IRecordHospitalityAssignment,
  IRecordHospitalityWeekend,
} from "@/types/hospitality"
import { IHospitalityGroup } from "@/types/types"
import CheckboxBoolean from "../CheckboxBoolean"
import DropdownObject from "../DropdownObjects"

interface Props {
  date: Date
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

  // seleciona grupo → só altera esse evento, mantém os outros
  function onGroupChange(eventType: IHospitalityEventType, group: IHospitalityGroup | null) {
    let updatedAssignments = [...(weekend.assignments ?? [])]
    const idx = updatedAssignments.findIndex(a => a.eventType === eventType)

    if (idx >= 0 && group) {
      updatedAssignments[idx] = {
        ...updatedAssignments[idx],
        group_id: group.id,
        group_host_fullName: group.host?.fullName,
        group_host_nickname: group.host?.nickname,
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
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 items-start">
      {/* Data + checkboxes */}
      <div className="w-full font-semibold">
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
          <div key={ev.key} className="flex flex-col gap-1 w-full">
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
          </div>
        )
      })}
    </div>
  )
}
