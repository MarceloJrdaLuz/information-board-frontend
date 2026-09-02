import { chairmansAtom, congregationsAtom, readersAtom, schedulesAtom, speakersAtom, talksAtom, workbookWeeksAtom } from "@/atoms/weekendScheduleAtoms"
import { buildOptions } from "@/functions/buildHistoryOptions"
import { buildTalkOptions } from "@/functions/buildTalkHistoryOptions"
import { IExternalTalk } from "@/types/externalTalks"
import { IRecordWeekendSchedule } from "@/types/weekendSchedule"
import { externalTalkStatusMap } from "@/utils/statusMap"
import { format } from "date-fns"
import ptBR from "date-fns/locale/pt-BR"
import dayjs from "dayjs"
import isoWeek from "dayjs/plugin/isoWeek"
import { useAtom, useAtomValue } from "jotai"
import {
    AlertCircle,
    BookOpen,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    ExternalLink,
    Mic2,
    Sparkles,
    UserCheck
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Button from "../Button"
import CheckboxMultiple from "../CheckBoxMultiple"
import DropdownObject from "../DropdownObjects"
import Input from "../Input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { Switch } from "../ui/switch"

dayjs.extend(isoWeek)

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
  const workbookWeeks = useAtomValue(workbookWeeksAtom)
  const [checkedOptions, setCheckedOptions] = useState<string[]>([])
  const [openConfirm, setOpenConfirm] = useState(false)
  const dateStr = dayjs(date).format("YYYY-MM-DD")
  const current = schedules[dateStr] || { date: dateStr }

  const mondayDate = dayjs(date).isoWeekday(1).format("YYYY-MM-DD")
  const matchingWorkbookWeek = workbookWeeks?.find(w => dayjs(w.weekDate).format("YYYY-MM-DD") === mondayDate)
  const autoWatchtowerTheme = matchingWorkbookWeek?.watchtowerStudyTheme || null

  useEffect(() => {
    if (!current.watchTowerStudyTitle && autoWatchtowerTheme && !current.isSpecial) {
      setSchedules(prev => {
        const cur = prev[dateStr] || ({ date: dateStr } as IRecordWeekendSchedule)
        if (!cur.watchTowerStudyTitle) {
          return {
            ...prev,
            [dateStr]: {
              ...cur,
              watchTowerStudyTitle: autoWatchtowerTheme
            }
          }
        }
        return prev
      })
    }
  }, [dateStr, autoWatchtowerTheme, current.watchTowerStudyTitle, current.isSpecial, setSchedules])

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

  // Atualiza um campo genérico
  const handleChange = (field: keyof typeof current, value: any) => {
    setSchedules(prev => {
      const current = prev[dateStr] || { date: dateStr } as IRecordWeekendSchedule
      const newValue = typeof value === "object" && value !== null ? value.id : value

      // antes de atualizar:
      const conflict = detectConflict(newValue, dateStr, prev);

      if (conflict && field !== conflict[0]) {
        toast.warning(`Atenção: essa pessoa já está designada como ${conflict.map(c => roleLabels[c]).join(", ")} neste mesmo dia.`);
      }

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

      // Se mudou a congregação visitante, reseta o orador e tema
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

  // Atualiza campos manuais
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

  function detectConflict(personId: string | number, dateStr: string, schedules: any) {
    const schedule = schedules[dateStr];
    if (!schedule) return false;

    const fields = [
      "chairman_id",
      "reader_id",
    ];

    let conflicts: string[] = [];

    fields.forEach((field) => {
      if (schedule[field] === personId) {
        conflicts.push(field);
      }
    });

    return conflicts.length > 0 ? conflicts : false;
  }

  const roleLabels: any = {
    chairman_id: "Presidente",
    reader_id: "Leitor"
  };

  const handleSpecialOptionChange = (newCheckedOptions: string[]) => {
    let updatedOptions = [...newCheckedOptions]

    // Regras de exclusividade
    const toggleExclusive = (a: string, b: string) => {
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
    if (current.visitingCongregation_id && s.originCongregation.id !== current.visitingCongregation_id) return false;
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

  const chairmanOptions = buildOptions(chairmans, schedules, "chairman_id", "fullName", dateStr)
  const readerOptions = buildOptions(readers, schedules, "reader_id", "fullName", dateStr)
  const speakerOptions = buildOptions(filteredSpeakers, schedules, "speaker_id", "fullName", dateStr)
  const talkOptions = buildTalkOptions(filteredTalks, schedules, dateStr)

  // Status de preenchimento
  const isChairmanFilled = !!current.chairman_id
  const isSpeakerFilled = !!(current.speaker_id || current.manualSpeaker)
  const isTalkFilled = !!(current.talk_id || current.manualTalk)
  const isReaderFilled = !!current.reader_id
  const isWatchtowerFilled = !!current.watchTowerStudyTitle

  const isFullyComplete = current.isSpecial
    ? !!current.specialName
    : isChairmanFilled && isSpeakerFilled && isTalkFilled && isReaderFilled && isWatchtowerFilled

  // Formatação de data em português
  const formattedDayOfWeek = format(date, "EEEE", { locale: ptBR })
  const formattedFullDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md bg-surface-100 focus-within:z-20 ${
        current.isSpecial
          ? "border-purple-300 dark:border-purple-800/60"
          : isFullyComplete
          ? "border-emerald-300/80 dark:border-emerald-800/50"
          : "border-surface-300 hover:border-primary-200/50"
      }`}
    >
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full rounded-t-2xl ${
          current.isSpecial
            ? "bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500"
            : isFullyComplete
            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
            : "bg-gradient-to-r from-amber-400 to-orange-400"
        }`}
      />

      <div className="p-4 md:p-5 flex flex-col gap-5">
        {/* Header do Card com Data e Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-300/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-100/20 text-primary-200 border border-primary-200/20 flex-shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold  tracking-wider text-primary-200 capitalize">
                  {formattedDayOfWeek}
                </span>
                <span className="text-xs text-typography-400">•</span>
                <span className="text-xs text-typography-500">
                  {format(date, "dd/MM/yyyy")}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-bold text-typography-900 capitalize">
                {formattedFullDate}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap sm:justify-end">
            {/* Status Badge */}
            {current.isSpecial ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Sparkles className="h-3.5 w-3.5" />
                {current.specialName || "Evento Especial"}
              </span>
            ) : isFullyComplete ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Completo
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Clock className="h-3.5 w-3.5" />
                Pendente
              </span>
            )}

            {/* Switch Evento Especial */}
            <label className="flex items-center gap-2 cursor-pointer select-none px-2.5 py-1 rounded-lg bg-surface-200/60 border border-surface-300 hover:bg-surface-200 transition-colors">
              <span className="text-xs font-medium text-typography-700">Evento Especial</span>
              <Switch
                title="Evento Especial"
                className="data-[state=checked]:bg-[rgb(var(--color-primary-100))] [&>span]:data-[state=checked]:bg-[rgb(var(--color-primary-200))]"
                checked={!!current.isSpecial}
                onCheckedChange={(checked) => handleToggleSpecial(checked)}
              />
            </label>
          </div>
        </div>

        {/* Configurações de Evento Especial (se ativado) */}
        {current.isSpecial && (
          <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-purple-800 dark:text-purple-300 font-semibold text-sm">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              <span>Configuração do Evento Especial</span>
            </div>
            <Input
              value={current.specialName || ""}
              onChange={(e) => handleManualChange("specialName", e.target.value)}
              type="text"
              placeholder="Nome do evento"
              className="bg-surface-100"
            />
            <div className="pt-1">
              <CheckboxMultiple
                label="Selecione os campos que terão designação nesta reunião:"
                options={optionsSpecial}
                checkedOptions={checkedOptions}
                handleCheckboxChange={handleSpecialOptionChange}
                full
                visibleLabel
              />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SEÇÃO 1: PRESIDENTE DA REUNIÃO                           */}
        {/* ======================================================== */}
        {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Presidente"))) && (
          <div className="p-3.5 md:p-4 rounded-xl bg-surface-200/40 border border-surface-300 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-typography-900">Presidente da Reunião</h3>
                  <p className="text-[11px] text-typography-500">Irmão que presidirá a reunião do fim de semana</p>
                </div>
              </div>
              {isChairmanFilled ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Definido
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Não definido
                </span>
              )}
            </div>

            <DropdownObject
              textVisible
              title="Selecione o Presidente"
              items={chairmanOptions ?? []}
              selectedItem={chairmanOptions?.find((p) => p.id === current.chairman_id) || null}
              handleChange={(item) => handleChange("chairman_id", item)}
              labelKey="displayLabel"
              border
              full
              emptyMessage="Nenhum presidente encontrado"
              searchable
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* SEÇÃO 2: DISCURSO PÚBLICO (ORADOR & TEMA)                */}
        {/* ======================================================== */}
        {(!current.isSpecial ||
          (current.isSpecial &&
            (checkedOptions.includes("Orador") ||
              checkedOptions.includes("Tema") ||
              checkedOptions.includes("Tema manual") ||
              checkedOptions.includes("Orador manual")))) && (
          <div className="p-3.5 md:p-4 rounded-xl bg-surface-200/40 border border-surface-300 transition-colors flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Mic2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-typography-900">Discurso Público</h3>
                  <p className="text-[11px] text-typography-500">Orador visitante ou local e tema do discurso</p>
                </div>
              </div>
              {isSpeakerFilled && isTalkFilled ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Completo
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Incompleto
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Congregação Visitante */}
              {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Orador"))) && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-typography-400" />
                    Congregação visitante
                  </span>
                  <DropdownObject
                    textVisible
                    title="Selecione a congregação"
                    items={congregations ?? []}
                    selectedItem={congregations?.find((c) => c.id === current.visitingCongregation_id) || null}
                    handleChange={(item) => handleChange("visitingCongregation_id", item)}
                    labelKey="name"
                    labelKeySecondary="city"
                    showSecondaryLabelOnSelected
                    border
                    full
                    emptyMessage="Nenhuma congregação encontrada"
                    searchable
                  />
                </div>
              )}

              {/* Orador */}
              {(!current.isSpecial ||
                (current.isSpecial && checkedOptions.includes("Orador") && !checkedOptions.includes("Orador manual"))) && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-typography-700">Orador</span>
                  <DropdownObject
                    textVisible
                    title="Selecione o orador"
                    items={speakerOptions ?? []}
                    selectedItem={speakerOptions?.find((p) => p.id === current.speaker_id) || null}
                    handleChange={(item) => handleChange("speaker_id", item)}
                    labelKey="displayLabel"
                    border
                    full
                    emptyMessage="Nenhum orador encontrado"
                    searchable
                  />
                </div>
              )}

              {/* Tema */}
              {(!current.isSpecial ||
                (current.isSpecial && checkedOptions.includes("Tema") && !checkedOptions.includes("Tema manual"))) && (
                <div className="flex flex-col gap-1 md:col-span-1">
                  <span className="text-xs font-semibold text-typography-700">Tema do Discurso</span>
                  <DropdownObject
                    textVisible
                    title="Selecione o tema"
                    items={talkOptions ?? []}
                    selectedItem={talkOptions?.find((t) => t.id === current.talk_id) || null}
                    handleChange={(item) => handleChange("talk_id", item)}
                    labelKey="displayLabel"
                    border
                    full
                    emptyMessage="Nenhum tema encontrado"
                    searchable
                  />
                </div>
              )}
            </div>

            {/* Campos Manuais para eventos especiais */}
            {(current.isSpecial && (checkedOptions.includes("Orador manual") || checkedOptions.includes("Tema manual"))) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {checkedOptions.includes("Orador manual") && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-typography-700">Orador manual</span>
                    <Input
                      className="!my-0 bg-surface-100"
                      value={current.manualSpeaker || ""}
                      onChange={(e) => handleManualChange("manualSpeaker", e.target.value)}
                      type="text"
                      placeholder="Nome do orador"
                    />
                  </div>
                )}
                {checkedOptions.includes("Tema manual") && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-typography-700">Tema manual</span>
                    <Input
                      className="!my-0 bg-surface-100"
                      value={current.manualTalk || ""}
                      onChange={(e) => handleManualChange("manualTalk", e.target.value)}
                      type="text"
                      placeholder="Tema do discurso"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* SEÇÃO 3: ESTUDO DE A SENTINELA                           */}
        {/* ======================================================== */}
        <div className="p-3.5 md:p-4 rounded-xl bg-surface-200/40 border border-surface-300 transition-colors flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-typography-900">Estudo de A Sentinela</h3>
                <p className="text-[11px] text-typography-500">Leitor designado e artigo da revista da semana</p>
              </div>
            </div>
            {isReaderFilled && isWatchtowerFilled ? (
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completo
              </span>
            ) : (
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Incompleto
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(!current.isSpecial || (current.isSpecial && checkedOptions.includes("Leitor"))) && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-typography-700">Leitor de A Sentinela</span>
                <DropdownObject
                  textVisible
                  title="Selecione o leitor"
                  items={readerOptions ?? []}
                  selectedItem={readerOptions?.find((p) => p.id === current.reader_id) || null}
                  handleChange={(item) => handleChange("reader_id", item)}
                  labelKey="displayLabel"
                  border
                  full
                  emptyMessage="Nenhum leitor encontrado"
                  searchable
                />
              </div>
            )}

            <div className={`flex flex-col gap-1 ${current.isSpecial && !checkedOptions.includes("Leitor") ? "md:col-span-2" : ""}`}>
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-typography-700">Tema do Estudo da Sentinela</span>
                {autoWatchtowerTheme && current.watchTowerStudyTitle === autoWatchtowerTheme && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300/40">
                    Apostila XML
                  </span>
                )}
              </div>
              <Input
                className="!my-0 bg-surface-100"
                value={current.watchTowerStudyTitle || ""}
                onChange={(e) => handleManualChange("watchTowerStudyTitle", e.target.value)}
                type="text"
                placeholder="Tema do estudo"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SEÇÃO 4: ORADORES QUE SAEM (DISCURSOS EXTERNOS)          */}
        {/* ======================================================== */}
        {externalTalks.length > 0 && (
          <div className="pt-2 border-t border-surface-300">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-typography-600">
                Oradores Locais em Outras Congregações
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-100/20 text-primary-200">
                {externalTalks.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {externalTalks.map((et) => {
                const statusBorder =
                  et.status === "confirmed"
                    ? "border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20"
                    : et.status === "pending"
                    ? "border-amber-500 bg-amber-50/40 dark:bg-amber-950/20"
                    : "border-red-500 bg-red-50/40 dark:bg-red-950/20"

                const statusColor =
                  et.status === "confirmed"
                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60"
                    : et.status === "pending"
                    ? "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60"
                    : "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/60"

                return (
                  <div
                    key={et.id}
                    className={`flex items-center justify-between p-3 rounded-xl border border-l-4 shadow-sm ${statusBorder}`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-sm text-typography-900 truncate">
                        {et.speaker?.fullName || et.manualTalk || "Orador"}
                      </span>
                      <span className="text-xs text-typography-600 truncate flex items-center gap-1 mt-0.5">
                        <Building2 className="h-3 w-3 flex-shrink-0 text-typography-400" />
                        {et.destinationCongregation.name === et.destinationCongregation.city
                          ? et.destinationCongregation.name
                          : `${et.destinationCongregation.name} • ${et.destinationCongregation.city}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                        {externalTalkStatusMap[et.status]}
                      </span>
                      <Link
                        href={{
                          pathname: "/arranjo-oradores/saida-oradores",
                          query: { date: et.date },
                        }}
                        className="p-1.5 rounded-lg text-primary-200 hover:bg-primary-100/20 transition-colors"
                        title="Ver ou editar saída de orador"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmação */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-typography-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Transformar em evento especial?
            </DialogTitle>
            <DialogDescription className="text-sm text-typography-600 pt-2">
              Essa semana já possui programação preenchida. Deseja limpar os dados normais e marcar como evento especial?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button outline onClick={() => setOpenConfirm(false)} className="rounded-xl border-surface-300">
              Cancelar
            </Button>
            <Button onClick={handleConfirmClear} className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
