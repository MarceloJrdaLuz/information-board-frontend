import { UpdateExternalTalksPayload } from "@/atoms/externalTalksAtoms/types"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { IExternalTalk } from "@/types/externalTalks"
import { ICongregation, ISpeaker, ITalk } from "@/types/types"
import { DayMeetingPublic, getRealDateForDestination } from "@/utils/dateUtil"
import { format } from "date-fns"
import ptBR from "date-fns/locale/pt-BR"
import {
  BookOpen,
  Building2,
  Calendar,
  Check,
  Clock,
  MapPin,
  Mic2,
  Pencil,
  Plus,
  Send,
  Trash2,
  X
} from "lucide-react"
import moment from "moment"
import { useState } from "react"
import { toast } from "react-toastify"
import Button from "../Button"
import CheckboxBoolean from "../CheckboxBoolean"
import { ConfirmDeleteModal } from "../ConfirmDeleteModal"
import DropdownObject from "../DropdownObjects"
import Input from "../Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface ExternalTalkRowProps {
  date: Date
  externalTalks?: IExternalTalk[]
  speakers: ISpeaker[]
  congregations: ICongregation[]
  talks?: ITalk[]
  onAddExternalTalk: (talk: Partial<IExternalTalk>) => void
  onUpdateStatus: (externalTalk_id: string, status: IExternalTalk["status"]) => void
  onUpdate: (externalTalk_id: string, payload: Partial<IExternalTalk>) => void
  onDelete: (externalTalk_id: string) => void
}

export default function ExternalTalkRow({
  date,
  talks,
  externalTalks = [],
  speakers,
  congregations,
  onAddExternalTalk,
  onUpdate,
  onUpdateStatus,
  onDelete
}: ExternalTalkRowProps) {
  const [newSpeakerId, setNewSpeakerId] = useState<string>("")
  const [newCongregationId, setNewCongregationId] = useState<string>("")
  const [selectedCongregation, setSelectedCongregation] = useState<ICongregation | null>(null)
  const [newTalkId, setNewTalkId] = useState<string>("")
  const [newManualTalk, setNewManualTalk] = useState<string>("")
  const [manualTalkShow, setManualTalkShow] = useState<boolean>(false)
  const [isFormOpen, setIsFormOpen] = useState<boolean>(externalTalks.length === 0)
  const sortedCongregations = sortArrayByProperty(congregations, "name")
  const [editTarget, setEditTarget] = useState<UpdateExternalTalksPayload | null>(null)

  let filteredSpeakers = speakers
  if (newTalkId) {
    filteredSpeakers = speakers.filter((s) => s.talks?.some((t) => t.id === newTalkId))
  }

  let filteredTalks = talks ?? []
  if (newSpeakerId) {
    const selectedSpeaker = speakers.find((s) => s.id === newSpeakerId)
    filteredTalks = selectedSpeaker?.talks ?? []
  }

  function handleManualTalkCheckboxChange() {
    setManualTalkShow(!manualTalkShow)
    setNewTalkId("")
    setNewManualTalk("")
  }

  const realDate = getRealDateForDestination(
    selectedCongregation?.dayMeetingPublic as DayMeetingPublic,
    date
  )

  const resetForm = () => {
    setNewSpeakerId("")
    setNewCongregationId("")
    setSelectedCongregation(null)
    setNewManualTalk("")
    setNewTalkId("")
    setManualTalkShow(false)
    setEditTarget(null)
    if (externalTalks.length > 0) {
      setIsFormOpen(false)
    }
  }

  const handleEditClick = (t: IExternalTalk) => {
    setEditTarget(t)
    setNewCongregationId(t.destinationCongregation.id)
    setSelectedCongregation(t.destinationCongregation)
    setNewSpeakerId(t.speaker?.id || "")
    setNewTalkId(t.talk?.id || "")
    setNewManualTalk(t.manualTalk || "")
    setManualTalkShow(!!t.manualTalk)
    setIsFormOpen(true)
  }

  const handleSubmit = () => {
    if (!newCongregationId) {
      toast.info("É obrigatório selecionar uma congregação de destino!")
      return
    }
    if (!newSpeakerId) {
      toast.info("Selecione um orador.")
      return
    }

    const payload: Partial<IExternalTalk> = {
      date: realDate.clone().format("YYYY-MM-DD"),
      speaker: speakers.find((s) => s.id === newSpeakerId),
      manualTalk: manualTalkShow ? newManualTalk : undefined,
      destinationCongregation: congregations.find((c) => c.id === newCongregationId)!,
      talk: !manualTalkShow ? talks?.find((t) => t.id === newTalkId) : undefined,
    }

    if (editTarget) {
      onUpdate(editTarget.id, payload)
    } else {
      onAddExternalTalk({ ...payload, status: "pending" })
    }

    resetForm()
  }

  // Formatação de data
  const formattedDayOfWeek = format(date, "EEEE", { locale: ptBR })
  const formattedFullDate = format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  // Status de preenchimento
  const hasPending = externalTalks.some(t => t.status === "pending")
  const allConfirmed = externalTalks.length > 0 && externalTalks.every(t => t.status === "confirmed")

  return (
    <div className="relative rounded-2xl border border-surface-300 transition-all duration-200 shadow-sm hover:shadow-md bg-surface-100 overflow-hidden">
      {/* Top Accent Strip */}
      <div
        className={`h-1.5 w-full ${
          externalTalks.length === 0
            ? "bg-surface-300"
            : allConfirmed
            ? "bg-gradient-to-r from-emerald-500 to-teal-400"
            : hasPending
            ? "bg-gradient-to-r from-amber-400 to-orange-400"
            : "bg-gradient-to-r from-primary-200 to-blue-500"
        }`}
      />

      <div className="p-4 sm:p-5 flex flex-col gap-5">
        {/* Header do Card com Data e Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-surface-300/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-100/20 text-primary-200 border border-primary-200/20 flex-shrink-0">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold tracking-wider text-primary-200 capitalize">
                  {formattedDayOfWeek}
                </span>
                <span className="text-xs text-typography-400">•</span>
                <span className="text-xs text-typography-500 font-medium">
                  {format(date, "dd/MM/yyyy")}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-typography-900 capitalize">
                {formattedFullDate}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:justify-end">
            {/* Status Badges */}
            {externalTalks.length === 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-200 text-typography-600 border border-surface-300">
                Nenhuma saída
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100/20 text-primary-200 border border-primary-200/30">
                <Send className="h-3.5 w-3.5" />
                {externalTalks.length} {externalTalks.length === 1 ? "saída" : "saídas"}
              </span>
            )}

            {/* Toggle Add Form Button */}
            <button
              onClick={() => {
                if (editTarget) resetForm()
                setIsFormOpen(!isFormOpen)
              }}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isFormOpen
                  ? "bg-surface-200 text-typography-800 border-surface-300 hover:bg-surface-300/60"
                  : "bg-primary-200 text-white border-primary-200 hover:bg-primary-100 shadow-sm"
              }`}
            >
              {isFormOpen ? (
                <>
                  <X className="h-4 w-4" />
                  <span>Fechar</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Nova Saída</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Lista de Saídas Existentes */}
        {externalTalks.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-typography-600">
              Oradores Designados para Fora
            </span>

            <div className="grid grid-cols-1 gap-3.5">
              {externalTalks.map((t) => {
                const statusBorder =
                  t.status === "confirmed"
                    ? "border-l-4 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : t.status === "pending"
                    ? "border-l-4 border-amber-500 bg-amber-50/20 dark:bg-amber-950/10"
                    : "border-l-4 border-red-500 bg-red-50/20 dark:bg-red-950/10"

                return (
                  <div
                    key={t.id}
                    className={`flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 p-4 rounded-xl border border-surface-300 shadow-sm transition-all bg-surface-100 ${statusBorder}`}
                  >
                    {/* Detalhes Principais */}
                    <div className="flex flex-col gap-2.5 w-full flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-primary-100/20 text-primary-200">
                            <Mic2 className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-base text-typography-900">
                            {t.speaker?.fullName || "Orador não definido"}
                          </span>
                        </div>

                        {/* Destination Congregation Badge */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-200/80 border border-surface-300 text-typography-800 text-xs font-semibold">
                          <Building2 className="h-3.5 w-3.5 text-primary-200" />
                          <span>{t.destinationCongregation.name}</span>
                          {t.destinationCongregation.city && (
                            <span className="text-typography-500 font-normal">
                              • {t.destinationCongregation.city}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Informações detalhadas de data, horário e tema */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs text-typography-700">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-200/40 border border-surface-300/60">
                          <Calendar className="h-3.5 w-3.5 text-typography-400 flex-shrink-0" />
                          <span className="truncate">
                            {moment(t.date).format("DD/MM/YYYY")} ({t.destinationCongregation.dayMeetingPublic})
                          </span>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-200/40 border border-surface-300/60">
                          <Clock className="h-3.5 w-3.5 text-typography-400 flex-shrink-0" />
                          <span>
                            {moment(t.destinationCongregation.hourMeetingPublic, "HH:mm:ss").format("HH:mm")}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-200/40 border border-surface-300/60 sm:col-span-2 md:col-span-1">
                          <BookOpen className="h-3.5 w-3.5 text-typography-400 flex-shrink-0" />
                          <span className="truncate font-medium">
                            {t.manualTalk
                              ? `Manual: ${t.manualTalk}`
                              : t.talk
                              ? `Nº ${t.talk.number} - ${t.talk.title}`
                              : "Tema não definido"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Ações */}
                    <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-surface-300">
                      {/* Select de Status */}
                      <div className="w-36">
                        <Select
                          value={t.status}
                          onValueChange={(val) => onUpdateStatus(t.id, val as IExternalTalk["status"])}
                        >
                          <SelectTrigger className={`h-8 rounded-lg text-xs font-semibold border ${
                            t.status === "confirmed"
                              ? "bg-emerald-100/70 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : t.status === "pending"
                              ? "bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                              : "bg-red-100/70 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="confirmed" className="text-emerald-700 dark:text-emerald-300 font-semibold text-xs">
                              Confirmado
                            </SelectItem>
                            <SelectItem value="pending" className="text-amber-700 dark:text-amber-300 font-semibold text-xs">
                              Pendente
                            </SelectItem>
                            <SelectItem value="canceled" className="text-red-700 dark:text-red-300 font-semibold text-xs">
                              Cancelado
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(t)}
                          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-surface-300 bg-surface-100 hover:bg-surface-200 text-typography-700 transition-colors flex items-center gap-1 text-xs font-semibold"
                          title="Editar saída"
                        >
                          <Pencil className="h-3.5 w-3.5 text-primary-200" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>

                        <ConfirmDeleteModal
                          onDelete={() => onDelete(t.id)}
                          title="Excluir saída de orador"
                          message="Tem certeza que deseja excluir esta designação externa? Essa ação não pode ser desfeita."
                          button={
                            <button
                              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors flex items-center gap-1 text-xs font-semibold"
                              title="Excluir saída"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">Excluir</span>
                            </button>
                          }
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Formulário de Adicionar / Editar Saída */}
        {isFormOpen && (
          <div className="bg-surface-200/40 border border-primary-200/30 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-surface-300">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary-100/20 text-primary-200">
                  {editTarget ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-typography-900">
                    {editTarget ? "Editar Saída de Orador" : "Adicionar Saída para Este Fim de Semana"}
                  </h3>
                  <p className="text-[11px] text-typography-500">
                    Preencha a congregação de destino, o orador designado e o tema do discurso.
                  </p>
                </div>
              </div>

              {editTarget && (
                <button
                  onClick={resetForm}
                  className="text-xs text-typography-500 hover:text-typography-800 font-medium"
                >
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Congregação de destino */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                  <Building2 className="h-3 w-3 text-typography-400" />
                  Congregação de destino *
                </span>
                <DropdownObject
                  textVisible
                  title="Selecione a congregação"
                  items={sortedCongregations}
                  selectedItem={sortedCongregations.find((c) => c.id === newCongregationId) || null}
                  handleChange={(item) => {
                    setNewCongregationId(item?.id || "")
                    setSelectedCongregation(item)
                  }}
                  labelKey="name"
                  labelKeySecondary="city"
                  showSecondaryLabelOnSelected
                  border
                  full
                  emptyMessage="Nenhuma congregação encontrada"
                  searchable
                />
              </div>

              {/* Orador */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                  <Mic2 className="h-3 w-3 text-typography-400" />
                  Orador *
                </span>
                <DropdownObject
                  textVisible
                  title="Selecione o orador"
                  items={[{ id: "", fullName: "Nenhum" }, ...filteredSpeakers]}
                  selectedItem={filteredSpeakers.find((s) => s.id === newSpeakerId) || null}
                  handleChange={(item) => setNewSpeakerId(item?.id || "")}
                  labelKey="fullName"
                  border
                  full
                  emptyMessage="Nenhum orador encontrado"
                  searchable
                />
              </div>
            </div>

            {/* Detalhes da congregação selecionada (preview) */}
            {selectedCongregation && (
              <div className="p-3 rounded-xl border border-surface-300 bg-surface-100 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs font-bold text-typography-800 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-primary-200" />
                  <span>Dados da reunião de destino:</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-typography-700">
                  <div>
                    <span className="text-typography-400 block text-[10px]">Congregação</span>
                    <span className="font-semibold text-typography-900">{selectedCongregation.name}</span>
                  </div>
                  <div>
                    <span className="text-typography-400 block text-[10px]">Cidade</span>
                    <span className="font-semibold text-typography-900">{selectedCongregation.city || "-"}</span>
                  </div>
                  <div>
                    <span className="text-typography-400 block text-[10px]">Dia da Reunião</span>
                    <span className="font-semibold text-typography-900">{selectedCongregation.dayMeetingPublic}</span>
                  </div>
                  <div>
                    <span className="text-typography-400 block text-[10px]">Horário</span>
                    <span className="font-semibold text-typography-900">
                      {moment(selectedCongregation.hourMeetingPublic, "HH:mm:ss").format("HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tema do Discurso */}
            <div className="flex flex-col gap-2 pt-1 border-t border-surface-300/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-typography-700 flex items-center gap-1">
                  <BookOpen className="h-3 w-3 text-typography-400" />
                  Tema do Discurso
                </span>
                <CheckboxBoolean
                  checked={manualTalkShow}
                  handleCheckboxChange={handleManualTalkCheckboxChange}
                  label="Informar tema manual"
                />
              </div>

              {!manualTalkShow ? (
                <DropdownObject<ITalk>
                  textVisible
                  title="Selecione o tema"
                  items={[{ id: "", number: 0, title: "Nenhum" } as ITalk, ...filteredTalks]}
                  selectedItem={
                    newTalkId === ""
                      ? ({ id: "", number: 0, title: "Nenhum" } as ITalk)
                      : filteredTalks.find((t) => t.id === newTalkId) || null
                  }
                  handleChange={(item) => setNewTalkId(item?.id || "")}
                  labelKey="number"
                  labelKeySecondary="title"
                  showSecondaryLabelOnSelected
                  border
                  full
                  emptyMessage="Nenhum tema encontrado"
                  searchable
                />
              ) : (
                <Input
                  className="!my-0 bg-surface-100"
                  placeholder="Digite o título ou tema do discurso manual"
                  value={newManualTalk}
                  onChange={(e) => setNewManualTalk(e.target.value)}
                />
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              {externalTalks.length > 0 && (
                <Button
                  outline
                  className="rounded-xl border-surface-300 text-typography-700 hover:bg-surface-200"
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
              )}
              <Button
                className="bg-primary-200 hover:bg-primary-100 text-white rounded-xl px-5 py-2.5 font-semibold text-sm shadow-sm flex items-center gap-2"
                onClick={handleSubmit}
              >
                <Check className="h-4 w-4" />
                <span>{editTarget ? "Salvar Alterações" : "Confirmar Saída"}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

