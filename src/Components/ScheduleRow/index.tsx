import { chairmansAtom, hospitalityGroupsAtom, readersAtom, schedulesAtom, speakerFilterCongregationAtom, speakerFilterTalkAtom, speakersAtom, talksAtom } from "@/atoms/weekendScheduleAtoms"
import { IRecordWeekendSchedule } from "@/entities/weekendSchedule"
import { Button, Dialog, DialogBody, DialogFooter, DialogHeader, Switch } from "@material-tailwind/react"
import { format } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import { useEffect, useState } from "react"
import CheckboxMultiple from "../CheckBoxMultiple"
import DropdownObject from "../DropdownObjects"
import Input from "../Input"
import { IExternalTalk } from "@/entities/externalTalks"
import Link from "next/link"
import { externalTalkStatusMap } from "@/utils/statusMap"
import { buildOptions } from "@/functions/buildHistoryOptions"
import { buildTalkOptions } from "@/functions/buildTalkHistoryOptions"
import { sortArrayByProperty } from "@/functions/sortObjects"

interface ScheduleRowProps {
  date: Date
  externalTalks?: IExternalTalk[]
}

export default function ScheduleRow({ date, externalTalks = [] }: ScheduleRowProps) {
  const [schedules, setSchedules] = useAtom(schedulesAtom)
  const readers = useAtomValue(readersAtom)
  const chairmans = useAtomValue(chairmansAtom)
  const speakers = useAtomValue(speakersAtom)
  const talks = useAtomValue(talksAtom)
  const [filterCongregation] = useAtom(speakerFilterCongregationAtom)
  const [filterTalk] = useAtom(speakerFilterTalkAtom)
  const [checkedOptions, setCheckedOptions] = useState<string[]>([])
  const [openConfirm, setOpenConfirm] = useState(false)
  const dateStr = date.toISOString().split("T")[0]
  const current = schedules[dateStr] || { date: dateStr }

  const optionsSpecial = ["Presidente", "Orador", "Tema", "Leitor", "Orador manual", "Tema manual"]

  useEffect(() => {
    const options: string[] = []

    if (current?.isSpecial) {
      if (current.chairman_id) options.push("Presidente")
      if (current.speaker_id) options.push("Orador")
      if (current.talk_id) options.push("Tema")
      if (current.reader_id) options.push("Leitor")
      if (current.manualSpeaker) options.push("Orador manual")
      if (current.manualTalk) options.push("Tema manual")
    }

    setCheckedOptions(options)
  }, [
    current?.isSpecial,
    current?.chairman_id,
    current?.speaker_id,
    current?.talk_id,
    current?.reader_id,
    current?.manualSpeaker,
    current?.manualTalk,
    current?.watchTowerStudyTitle
  ])

  // 🔹 Atualiza um campo genérico
  const handleChange = (field: keyof typeof current, value: any) => {
    setSchedules(prev => {
      const current = prev[dateStr] || { date: dateStr } as IRecordWeekendSchedule
      const newValue = typeof value === "object" && value !== null ? value.id : value

      let updated: IRecordWeekendSchedule = { ...current, [field]: newValue, id: current.id }

      // 🔹 Se mudou o orador, valida o tema
      if (field === "speaker_id") {
        const newSpeaker = speakers?.find(s => s.id === newValue)
        if (current.talk_id && !newSpeaker?.talks?.some(t => t.id === current.talk_id)) {
          updated.talk_id = undefined
        }
      }

      return {
        ...prev,
        [dateStr]: updated,
      }
    })
  }

  // 🔹 Atualiza campos manuais
  const handleManualChange = (field: "manualSpeaker" | "manualTalk" | "specialName" | "watchTowerStudyTitle", value: string) => {
    setSchedules(prev => {
      const current = prev[dateStr] || { date: dateStr } as IRecordWeekendSchedule
      return {
        ...prev,
        [dateStr]: {
          ...current,
          ...(field === "manualSpeaker" ? { speaker_id: undefined } : {}),
          ...(field === "watchTowerStudyTitle" ? { watchTowerStudyTitle: undefined } : {}),
          ...(field === "manualTalk" ? { talk_id: undefined } : {}),
          [field]: value,
        } as IRecordWeekendSchedule
      }
    })
  }

  const hasExistingSchedule =
    !!(current.chairman_id || current.speaker_id || current.talk_id || current.reader_id || current.manualSpeaker || current.manualTalk || current.specialName)

  const handleToggleSpecial = (checked: boolean) => {
    if (checked && hasExistingSchedule) {
      setOpenConfirm(true)
    } else {
      handleChange("isSpecial", checked)
    }
  }

  const handleSpecialOptionChange = (newCheckedOptions: string[]) => {
    let updatedOptions = [...newCheckedOptions]

    // Desmarca orador/tema padrão se manual selecionado
    if (updatedOptions.includes("Orador manual")) updatedOptions = updatedOptions.filter(opt => opt !== "Orador")
    if (updatedOptions.includes("Tema manual")) updatedOptions = updatedOptions.filter(opt => opt !== "Tema")
    setCheckedOptions(updatedOptions)

    setSchedules(prev => {
      const current = prev[dateStr] || { date: dateStr } as IRecordWeekendSchedule
      const updated: IRecordWeekendSchedule = { ...current }

      if (!updatedOptions.includes("Presidente")) updated.chairman_id = undefined
      if (!updatedOptions.includes("Orador")) updated.speaker_id = undefined
      if (!updatedOptions.includes("Tema")) updated.talk_id = undefined
      if (!updatedOptions.includes("Leitor")) updated.reader_id = undefined
      if (!updatedOptions.includes("Orador manual")) updated.manualSpeaker = ""
      if (!updatedOptions.includes("Tema manual")) updated.manualTalk = ""
      if (updatedOptions.includes("Orador manual")) updated.speaker_id = undefined
      if (updatedOptions.includes("Tema manual")) updated.talk_id = undefined

      return {
        ...prev,
        [dateStr]: updated,
      }
    })
  }

  const handleConfirmClear = () => {
    handleChange("isSpecial", true)
    setSchedules(prev => {
      const current = prev[dateStr] || { date: dateStr } as IRecordWeekendSchedule
      return {
        ...prev,
        [dateStr]: {
          ...current,
          id: current.id,
          speaker_id: undefined,
          talk_id: undefined,
          chairman_id: undefined,
          reader_id: undefined,
          watchTowerStudyTitle: undefined,
          manualSpeaker: "",
          manualTalk: "",
          specialName: "",
        }
      }
    })
    setOpenConfirm(false)
  }

  let filteredSpeakers = speakers?.filter(s => {
    if (filterCongregation && s.originCongregation.id !== filterCongregation) return false
    if (filterTalk && !s.talks?.some(t => t.id === filterTalk)) return false
    return true
  }) ?? []
  if (current.speaker_id && !filteredSpeakers.some(s => s.id === current.speaker_id)) {
    const selectedSpeaker = speakers?.find(s => s.id === current.speaker_id)
    if (selectedSpeaker) filteredSpeakers = [selectedSpeaker, ...filteredSpeakers]
  }

  let filteredTalks = talks ?? []
  if (current.speaker_id) {
    const selectedSpeaker = speakers?.find(s => s.id === current.speaker_id)
    if (selectedSpeaker?.talks?.length) {
      filteredTalks = talks?.filter(t => selectedSpeaker?.talks?.some(st => st.id === t.id)) ?? []
    } else {
      filteredTalks = []
    }
  }
  if (current.talk_id && !filteredTalks.some(t => t.id === current.talk_id)) {
    const selectedTalk = talks?.find(t => t.id === current.talk_id)
    if (selectedTalk) filteredTalks = [selectedTalk, ...filteredTalks]
  }

  const chairmanOptions = buildOptions(chairmans, schedules, "chairman_id", "fullName")
  const readerOptions = buildOptions(readers, schedules, "reader_id", "fullName")
  const speakerOptions = buildOptions(filteredSpeakers, schedules, "speaker_id", "fullName")
  const talkOptions = buildTalkOptions(filteredTalks, schedules)

  return (
    <div className="border rounded-xl p-3 flex flex-col gap-2 bg-white">
      <h2 className="font-semibold">{format(date, "dd/MM/yyyy")}</h2>

      <Switch
        color="blue-gray"
        label="Evento Especial"
        ripple={false}
        checked={!!current.isSpecial}
        onChange={(e) => handleToggleSpecial(e.target.checked)}
      />

      {current.isSpecial &&
        <CheckboxMultiple
          label="Campos especiais"
          options={optionsSpecial}
          checkedOptions={checkedOptions}
          handleCheckboxChange={handleSpecialOptionChange}
          full
          visibleLabel
        />
      }

      {current.isSpecial &&
        <div className="z-50">
          <Input
            value={current.specialName || ""}
            onChange={(e) => handleManualChange("specialName", e.target.value)}
            type="text"
            placeholder="Nome do evento"
          />
          {!checkedOptions.includes("Orador da lista") && checkedOptions.includes("Orador manual") &&
            <Input
              value={current.manualSpeaker || ""}
              onChange={(e) => handleManualChange("manualSpeaker", e.target.value)}
              type="text"
              placeholder="Orador Manual"
            />
          }
          {!checkedOptions.includes("Tema da lista") && checkedOptions.includes("Tema manual") &&
            <Input
              value={current.manualTalk || ""}
              onChange={(e) => handleManualChange("manualTalk", e.target.value)}
              type="text"
              placeholder="Tema Manual"
            />
          }
        </div>
      }

      {/* Dropdowns */}
      {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Presidente"))) &&
        <DropdownObject
          textVisible
          title="Presidente"
          items={chairmanOptions ?? []}
          selectedItem={chairmanOptions?.find(p => p.id === current.chairman_id) || null}
          handleChange={item => handleChange("chairman_id", item)}
          labelKey="displayLabel"
          border
          full
          emptyMessage="Nenhum presidente"
          searchable
        />
      }

      {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Orador") && !checkedOptions.includes("Orador manual"))) &&
        <DropdownObject
          textVisible
          title="Orador"
          items={speakerOptions ?? []}
          selectedItem={speakerOptions?.find(p => p.id === current.speaker_id) || null}
          handleChange={item => handleChange("speaker_id", item)}
          labelKey="displayLabel"
          border
          full
          emptyMessage="Nenhum orador"
          searchable
        />
      }

      {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Tema") && !checkedOptions.includes("Tema manual"))) &&
        <DropdownObject
          textVisible
          title="Tema"
          items={talkOptions ?? []}
          selectedItem={talkOptions?.find(t => t.id === current.talk_id) || null}
          handleChange={item => handleChange("talk_id", item)}
          labelKey="number"
          labelKeySecondary="displayLabel"
          border
          full
          emptyMessage="Nenhum tema"
          searchable
        />
      }

      {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Leitor"))) &&
        <DropdownObject
          textVisible
          title="Leitor"
          items={readerOptions ?? []}
          selectedItem={readerOptions?.find(p => p.id === current.reader_id) || null}
          handleChange={item => handleChange("reader_id", item)}
          labelKey="displayLabel"
          border
          full
          emptyMessage="Nenhum leitor"
          searchable
        />
      }

      <Input
        value={current.watchTowerStudyTitle || ""}
        onChange={(e) => handleManualChange("watchTowerStudyTitle", e.target.value)}
        type="text"
        placeholder="Tema do Estudo da Sentinela"
      />

      {externalTalks.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-gray-800">Discursos Externos</h3>
          {externalTalks.map((et) => (
            <div
              key={et.id}
              className={`
          flex items-center justify-between p-3 rounded-lg border shadow-sm bg-white
          ${et.status === "confirmed" ? "border-l-4 border-green-500" : ""}
          ${et.status === "pending" ? "border-l-4 border-yellow-500" : ""}
          ${et.status === "canceled" ? "border-l-4 border-red-500" : ""}
        `}
            >
              {/* Orador + Congregação */}
              <div className="flex flex-col">
                <span className="font-medium text-gray-800">
                  {et.speaker?.fullName || et.manualTalk}
                </span>
                <span className="text-sm text-gray-600">
                  {et.destinationCongregation.name === et.destinationCongregation.city ?
                    et.destinationCongregation.name :
                    `${et.destinationCongregation.name} - ${et.destinationCongregation.city}`
                  }
                </span>
              </div>

              {/* Status + Ação */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {externalTalkStatusMap[et.status]}
                </span>
                <Link
                  href={{
                    pathname: "/arranjo-oradores/saida-oradores",
                    query: { date: et.date },
                  }}
                  className="text-sm text-primary-200 hover:underline"
                >
                  Ver / Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Modal de confirmação */}
      <Dialog open={openConfirm} handler={() => setOpenConfirm(false)}>
        <DialogHeader>Transformar em evento especial?</DialogHeader>
        <DialogBody>
          Essa semana já possui programação preenchida. Deseja limpar e marcar como evento especial?
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setOpenConfirm(false)}>
            Cancelar
          </Button>
          <Button className="bg-primary-200 hover:bg-primary-100 text-white" variant="text" onClick={handleConfirmClear}>
            Confirmar
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
