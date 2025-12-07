import { chairmansAtom, congregationsAtom, readersAtom, schedulesAtom, speakersAtom, talksAtom } from "@/atoms/weekendScheduleAtoms"
import { buildOptions } from "@/functions/buildHistoryOptions"
import { buildTalkOptions } from "@/functions/buildTalkHistoryOptions"
import { IExternalTalk } from "@/types/externalTalks"
import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import { externalTalkStatusMap } from "@/utils/statusMap"
import { format } from "date-fns"
import { useAtom, useAtomValue } from "jotai"
import Link from "next/link"
import { useEffect, useState } from "react"
import CheckboxMultiple from "../CheckBoxMultiple"
import DropdownObject from "../DropdownObjects"
import Input from "../Input"
import { Switch } from "../ui/switch"
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "../ui/dialog"
import Button from "../Button"

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
  const congregations = useAtomValue(congregationsAtom)
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
      if (field === "speaker_id") {
        const newSpeaker = speakers?.find(s => s.id === newValue)
        if (current.talk_id && !newSpeaker?.talks?.some(t => t.id === current.talk_id)) {
          updated.talk_id = undefined
        }

        // Se o orador mudou, e não há visitingCongregation, define automaticamente
        if (newSpeaker?.originCongregation?.id) {
          updated.visitingCongregation_id = newSpeaker.originCongregation.id
        }
      }

      // 🔹 Se mudou a congregação visitante, reseta o orador e tema
      if (field === "visitingCongregation_id") {
        updated.speaker_id = undefined
        updated.talk_id = undefined
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

    // Regras de exclusividade (funciona nos dois sentidos)
    const toggleExclusive = (a: string, b: string) => {
      // Se o usuário acabou de marcar 'a', remove 'b'
      if (updatedOptions.includes(a) && updatedOptions.includes(b)) {

        const lastClicked = newCheckedOptions[newCheckedOptions.length - 1]
        updatedOptions = updatedOptions.filter(opt => opt !== (lastClicked === a ? b : a))
      }
    }

    toggleExclusive("Orador", "Orador manual")
    toggleExclusive("Tema", "Tema manual")

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
    // Oradores devem pertencer à congregação visitante
    if (current.visitingCongregation_id && s.originCongregation.id !== current.visitingCongregation_id) return false;

    // Se um tema já foi selecionado, filtra os oradores que têm esse tema
    if (current.talk_id && !s.talks?.some(t => t.id === current.talk_id)) return false;

    return true;
  }) ?? [];



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

  let borderColorChairman = "border-typography-300"
  let borderSpeakerColor = "border-typography-300"
  let borderWhatchtowerColor = "border-typography-300"

  if (!current.isSpecial) {
    const filledFieldsCount = [
      current.visitingCongregation_id,
      current.speaker_id,
      current.talk_id
    ].filter(Boolean).length

    if (filledFieldsCount === 0) {
      borderSpeakerColor = "border-l-4 border-red-500"
    } else if (filledFieldsCount < 3) {
      borderSpeakerColor = "border-l-4 border-yellow-500"
    } else {
      borderSpeakerColor = "border-l-4 border-green-500"
    }
  }

  if (!current.isSpecial) {
    if (!current.chairman_id) {
      borderColorChairman = "border-l-4 border-red-500"
    } else {
      borderColorChairman = "border-l-4 border-green-500"
    }
  }

  if (!current.isSpecial) {
    const filledFieldsCount = [
      current.reader_id,
      current.watchTowerStudyTitle,
    ].filter(Boolean).length

    if (filledFieldsCount === 0) {
      borderWhatchtowerColor = "border-l-4 border-red-500"
    } else if (filledFieldsCount < 2) {
      borderWhatchtowerColor = "border-l-4 border-yellow-500"
    } else {
      borderWhatchtowerColor = "border-l-4 border-green-500"
    }
  }

  const chairmanOptions = buildOptions(chairmans, schedules, "chairman_id", "fullName", dateStr)
  const readerOptions = buildOptions(readers, schedules, "reader_id", "fullName", dateStr)
  const speakerOptions = buildOptions(filteredSpeakers, schedules, "speaker_id", "fullName")
  const talkOptions = buildTalkOptions(filteredTalks, schedules)

  return (
    <div className={`border-2  rounded-xl p-3 flex flex-col gap-2 bg-surface-100 transition-colors duration-300`}>
      <h2 className="font-semibold text-primary-200">{format(date, "dd/MM/yyyy")}</h2>

      <Switch
        className="
    checked:bg-[rgb(var(--color-primary-100))] 
    checked:before:bg-[rgb(var(--color-primary-200))] 
    !text-typography-100"
        placeholder="Evento Especial"
        checked={!!current.isSpecial}
        onChange={(e: any) => handleToggleSpecial(e.target.checked)}
      />

      {current.isSpecial &&
        <>
          <Input
            value={current.specialName || ""}
            onChange={(e) => handleManualChange("specialName", e.target.value)}
            type="text"
            placeholder="Nome do evento"
          />
          <CheckboxMultiple
            label="Campos especiais"
            options={optionsSpecial}
            checkedOptions={checkedOptions}
            handleCheckboxChange={handleSpecialOptionChange}
            full
            visibleLabel
          />
        </>

      }

      {/* Dropdowns */}
      {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Presidente"))) &&
        <div className={`border ${borderColorChairman ?? "border-typography-300"} p-4`}>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <span className='my-2 font-semibold text-typography-900'>Presidente</span>
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
          </div>
        </div>
      }

      {/* 🔹 Box do Orador */}
      {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Orador") || checkedOptions.includes("Tema") || checkedOptions.includes("Tema manual") || checkedOptions.includes("Orador manual"))) &&
        <div className={`border ${borderSpeakerColor} my-4 p-4`}>
          <div className='flex justify-between items-center flex-wrap gap-4'>
            <span className='my-2 font-semibold text-typography-900'>Orador</span>

            {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Orador"))) && (
              <DropdownObject
                textVisible
                title="Congregação visitante"
                items={congregations ?? []}
                selectedItem={congregations?.find(c => c.id === current.visitingCongregation_id) || null}
                handleChange={item => handleChange("visitingCongregation_id", item)}
                labelKey="name"
                labelKeySecondary="city"
                showSecondaryLabelOnSelected
                border
                full
                emptyMessage="Nenhuma congregação"
                searchable
              />
            )}

            {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Orador") && !checkedOptions.includes("Orador manual"))) && (
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
            )}

            {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Tema") && !checkedOptions.includes("Tema manual"))) && (
              <DropdownObject
                textVisible
                title="Tema"
                items={talkOptions ?? []}
                selectedItem={talkOptions?.find(t => t.id === current.talk_id) || null}
                handleChange={item => handleChange("talk_id", item)}
                labelKey="displayLabel"
                border
                full
                emptyMessage="Nenhum tema"
                searchable
              />
            )}

            {/* 🔹 Campos manuais dentro da box de orador */}
            <div className="w-full">
              {current.isSpecial && checkedOptions.includes("Orador manual") && (
                <Input
                  className="!my-0"
                  value={current.manualSpeaker || ""}
                  onChange={(e) => handleManualChange("manualSpeaker", e.target.value)}
                  type="text"
                  placeholder="Orador manual"
                />
              )}
            </div>

            <div className="w-full">
              {current.isSpecial && checkedOptions.includes("Tema manual") && (
                <Input
                  className="!my-0"
                  value={current.manualTalk || ""}
                  onChange={(e) => handleManualChange("manualTalk", e.target.value)}
                  type="text"
                  placeholder="Tema manual"
                />
              )}
            </div>
          </div>
        </div>}

      <div className={`border ${borderWhatchtowerColor} my-4 p-4`}>
        <div className='flex justify-between items-center flex-wrap gap-4'>
          <span className='my-2 font-semibold text-typography-900 '>Sentinela</span>

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
            className="!my-0"
            value={current.watchTowerStudyTitle || ""}
            onChange={(e) => handleManualChange("watchTowerStudyTitle", e.target.value)}
            type="text"
            placeholder="Tema do Estudo da Sentinela"
          />
        </div>
      </div>


      {externalTalks.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="font-semibold text-typography-800">Oradores que saem</h3>
          {externalTalks.map((et) => (
            <div
              key={et.id}
              className={`
          flex items-center justify-between p-3 rounded-lg border shadow-sm bg-surface-100
          ${et.status === "confirmed" ? "border-l-4 border-green-500" : ""}
          ${et.status === "pending" ? "border-l-4 border-yellow-500" : ""}
          ${et.status === "canceled" ? "border-l-4 border-red-500" : ""}
        `}
            >
              {/* Orador + Congregação */}
              <div className="flex flex-col">
                <span className="font-medium text-typography-800">
                  {et.speaker?.fullName || et.manualTalk}
                </span>
                <span className="text-sm text-typography-600">
                  {et.destinationCongregation.name === et.destinationCongregation.city ?
                    et.destinationCongregation.name :
                    `${et.destinationCongregation.name} - ${et.destinationCongregation.city}`
                  }
                </span>
              </div>

              {/* Status + Ação */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-typography-500">
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
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          <DialogHeader>Transformar em evento especial?</DialogHeader>
          <p className="py-2">Essa semana já possui programação preenchida. Deseja limpar e marcar como evento especial?</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
            <Button onClick={handleConfirmClear}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
