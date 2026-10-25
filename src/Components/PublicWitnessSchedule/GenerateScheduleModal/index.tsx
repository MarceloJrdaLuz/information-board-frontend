import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/Components/ui/dialog"
import Calendar from "@/Components/Calendar"
import { Button } from "@/Components/ui/button"
import { useSetAtom } from "jotai"
import { generatePublicWitnessScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { toast } from "react-toastify"
import { Wand2, CheckCircle2, ShieldCheck, Loader2, AlertTriangle, Users } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  arrangementId: string
  arrangementTitle: string
  defaultStartDate: string
  defaultEndDate: string
  onSuccess: () => void
  isFixed?: boolean
  participatingPublishersCount?: number
  onOpenPublishersModal?: () => void
}

export default function GenerateScheduleModal({
  isOpen,
  onClose,
  arrangementId,
  arrangementTitle,
  defaultStartDate,
  defaultEndDate,
  onSuccess,
  isFixed = true,
  participatingPublishersCount,
  onOpenPublishersModal
}: Props) {
  const generateSchedule = useSetAtom(generatePublicWitnessScheduleAtom)

  const [startDate, setStartDate] = useState(defaultStartDate)
  const [endDate, setEndDate] = useState(defaultEndDate)
  const [mode, setMode] = useState<"reconcile" | "append">("reconcile")
  const [publishersPerSlot, setPublishersPerSlot] = useState(2)
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (isOpen) {
      if (defaultStartDate) setStartDate(defaultStartDate)
      if (defaultEndDate) setEndDate(defaultEndDate)
    }
  }, [isOpen, defaultStartDate, defaultEndDate])

  const handleGenerate = async () => {
    if (!startDate || (!endDate && isFixed)) {
      toast.error("Preencha a data inicial e final.")
      return
    }

    const finalEndDate = isFixed ? endDate : startDate

    setLoading(true)
    try {
      await toast.promise(
        generateSchedule(arrangementId, {
          startDate,
          endDate: finalEndDate,
          mode,
          publishersPerSlot
        }),
        {
          pending: !isFixed
            ? "Gerando pares do dia especial..."
            : "Gerando escala de carrinho automatizada...",
          success: !isFixed
            ? "Pares gerados com sucesso!"
            : "Escala gerada com sucesso!"
        }
      )
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Erro ao gerar programação:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary-200">
            <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
              <Wand2 className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              {!isFixed ? "Gerar Pares do Dia Especial" : "Preenchimento Automático do Carrinho"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-typography-500 mt-1.5 leading-relaxed">
            Arranjo: <strong className="text-typography-800">{arrangementTitle}</strong>.{" "}
            {!isFixed
              ? "O algoritmo distribui os participantes selecionados entre os horários do dia respeitando regras de indisponibilidade e conflitos."
              : "O algoritmo distribui os publicadores respeitando regras de indisponibilidade, preferências e conflitos com a saída de campo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Status dos Participantes */}
          {participatingPublishersCount !== undefined && (
            participatingPublishersCount === 0 ? (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span>
                    {!isFixed
                      ? "Nenhum publicador selecionado para esta data especial."
                      : "Nenhum publicador selecionado para o rodízio deste arranjo."}
                  </span>
                </div>
                {onOpenPublishersModal && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose()
                      onOpenPublishersModal()
                    }}
                    className="text-xs border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0 font-semibold h-7 px-2.5 text-amber-900 dark:text-amber-100"
                  >
                    Escolher participantes
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-2.5 bg-surface-200/60 border border-surface-300 rounded-xl flex items-center justify-between text-xs text-typography-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-200" />
                  <span>
                    {!isFixed
                      ? "Participantes selecionados para a data:"
                      : "Participantes no rodízio deste arranjo:"}
                  </span>
                </div>
                <span className="font-bold text-typography-900">
                  {participatingPublishersCount} {participatingPublishersCount === 1 ? "publicador" : "publicadores"}
                </span>
              </div>
            )
          )}

          {/* Período */}
          {!isFixed ? (
            <div className="p-3 bg-surface-200/50 rounded-xl border border-surface-300 flex items-center justify-between text-xs">
              <span className="text-typography-600 font-semibold">Data do Arranjo:</span>
              <span className="font-bold text-typography-900">
                {startDate}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Calendar
                label="Data Inicial"
                selectedDate={startDate || null}
                handleDateChange={(d) => setStartDate(d || "")}
                full
              />
              <Calendar
                label="Data Final"
                selectedDate={endDate || null}
                minDate={startDate || null}
                handleDateChange={(d) => setEndDate(d || "")}
                full
              />
            </div>
          )}

          {/* Vagas por horário */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-typography-700">
              Publicadores por Horário
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPublishersPerSlot(num)}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    publishersPerSlot === num
                      ? "bg-primary-200 text-white border-primary-200 shadow-sm"
                      : "bg-surface-100 text-typography-700 border-surface-300 hover:bg-surface-200"
                  }`}
                >
                  {num} {num === 1 ? "vaga" : "vagas"}
                </button>
              ))}
            </div>
          </div>

          {/* Modo de geração */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-typography-700">
              Modo de Geração
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode("reconcile")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                  mode === "reconcile"
                    ? "border-primary-200 bg-primary-50/40 dark:bg-primary-950/20 shadow-sm ring-1 ring-primary-200"
                    : "border-surface-300 bg-surface-200/50 hover:bg-surface-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-typography-900">
                    Substituir existentes
                  </span>
                  <input
                    type="radio"
                    checked={mode === "reconcile"}
                    onChange={() => setMode("reconcile")}
                    className="accent-primary-200"
                  />
                </div>
                <p className="text-[11px] text-typography-500 leading-relaxed">
                  {!isFixed
                    ? "Refaz os pares de todos os horários do dia com novo sorteio uniforme."
                    : "Refaz o mês do zero nos horários rotativos com novo rodízio uniforme."}
                </p>
              </div>

              <div
                onClick={() => setMode("append")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                  mode === "append"
                    ? "border-primary-200 bg-primary-50/40 dark:bg-primary-950/20 shadow-sm ring-1 ring-primary-200"
                    : "border-surface-300 bg-surface-200/50 hover:bg-surface-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-typography-900">
                    Apenas vagas vazias
                  </span>
                  <input
                    type="radio"
                    checked={mode === "append"}
                    onChange={() => setMode("append")}
                    className="accent-primary-200"
                  />
                </div>
                <p className="text-[11px] text-typography-500 leading-relaxed">
                  {!isFixed
                    ? "Mantém quem já foi escalado na data e preenche somente horários em aberto."
                    : "Mantém quem já foi escalado e preenche somente horários em aberto."}
                </p>
              </div>
            </div>
          </div>

          {/* Regras e Trava de Segurança */}
          <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl flex flex-col gap-2">
            <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Regras inteligentes aplicadas:
            </span>
            <ul className="text-[11px] text-blue-900/90 dark:text-blue-300/90 space-y-1 pl-1">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Indisponibilidades:</strong> Publicadores marcados como indisponíveis não entram no rodízio.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Preferências de horários:</strong> Publicadores com preferência de horário nunca são alocados em outros horários.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Sem conflitos:</strong> Não escala o dirigente de campo do mesmo dia nem repete o publicador no mesmo dia.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-3 border-t border-surface-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={loading || participatingPublishersCount === 0}
            className="text-xs flex items-center gap-1.5 bg-primary-200 hover:bg-primary-300 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>
              {loading
                ? "Gerando..."
                : !isFixed
                ? "Gerar Pares do Dia"
                : "Gerar Programação"}
            </span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
