import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { useSetAtom } from "jotai"
import { generatePublicWitnessScheduleAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { toast } from "react-toastify"
import { Wand2, CheckCircle2, ShieldCheck, Loader2 } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  arrangementId: string
  arrangementTitle: string
  defaultStartDate: string
  defaultEndDate: string
  onSuccess: () => void
}

export default function GenerateScheduleModal({
  isOpen,
  onClose,
  arrangementId,
  arrangementTitle,
  defaultStartDate,
  defaultEndDate,
  onSuccess
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
    if (!startDate || !endDate) {
      toast.error("Preencha a data inicial e final.")
      return
    }

    setLoading(true)
    try {
      await toast.promise(
        generateSchedule(arrangementId, {
          startDate,
          endDate,
          mode,
          publishersPerSlot
        }),
        {
          pending: "Gerando escala de carrinho automatizada...",
          success: "Escala gerada com sucesso!"
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
              Preenchimento Automático do Carrinho
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-typography-500 mt-1.5 leading-relaxed">
            Arranjo: <strong className="text-typography-800">{arrangementTitle}</strong>. O algoritmo distribui os publicadores respeitando regras de indisponibilidade, preferências e conflitos com a saída de campo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-typography-700">
                Data Inicial
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="p-2 text-sm border rounded-lg bg-surface-50 border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 text-typography-800"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-typography-700">
                Data Final
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="p-2 text-sm border rounded-lg bg-surface-50 border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 text-typography-800"
              />
            </div>
          </div>

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
                      : "bg-surface-50 text-typography-700 border-surface-300 hover:bg-surface-200"
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
                    : "border-surface-300 bg-surface-50 hover:bg-surface-100"
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
                  Refaz o mês do zero nos horários rotativos com novo rodízio uniforme.
                </p>
              </div>

              <div
                onClick={() => setMode("append")}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                  mode === "append"
                    ? "border-primary-200 bg-primary-50/40 dark:bg-primary-950/20 shadow-sm ring-1 ring-primary-200"
                    : "border-surface-300 bg-surface-50 hover:bg-surface-100"
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
                  Mantém quem já foi escalado e preenche somente horários em aberto.
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
            disabled={loading}
            className="text-xs flex items-center gap-1.5 bg-primary-200 hover:bg-primary-300 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="w-4 h-4" />
            )}
            <span>{loading ? "Gerando..." : "Gerar Programação"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
