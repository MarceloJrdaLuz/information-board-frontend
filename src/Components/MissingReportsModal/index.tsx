import { IPublisher } from "@/types/types"
import * as Popover from "@radix-ui/react-popover"
import { AlertCircle, CheckCircle2, ChevronDownIcon, CopyCheck, CopyIcon, Users } from "lucide-react"
import { useState } from "react"

interface MissingReportsModalProps {
  missingReportsNumber: number
  missingReports: IPublisher[] | undefined
}

export default function MissingReportsModal({
  missingReportsNumber,
  missingReports,
}: MissingReportsModalProps) {
  const [copySuccess, setCopySuccess] = useState(false)
  const [open, setOpen] = useState(false)

  const handleCopyToClipboard = () => {
    if (missingReports && missingReports.length > 0) {
      const dataToCopy = missingReports.map((r) => r.fullName).join("\n")
      navigator.clipboard.writeText(dataToCopy)
      setCopySuccess(true)

      setTimeout(() => {
        setCopySuccess(false)
      }, 3000)
    }
  }

  const isAllSent = missingReportsNumber === 0

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
            isAllSent
              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/15"
              : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/15"
          }`}
        >
          {isAllSent ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>
            {isAllSent ? "Todos entregues" : `Faltam ${missingReportsNumber}`}
          </span>
          <ChevronDownIcon className="w-3.5 h-3.5 opacity-70 ml-0.5" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="end"
          sideOffset={8}
          avoidCollisions
          className="w-80 bg-surface-100 text-typography-900 rounded-2xl shadow-xl border border-surface-300 p-4 z-50 animate-in fade-in-50 zoom-in-95"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-surface-300 mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary-200" />
              <span className="font-bold text-sm text-typography-900">
                {isAllSent ? "Status dos Relatórios" : "Publicadores Pendentes"}
              </span>
            </div>

            {!isAllSent && (
              <button
                onClick={handleCopyToClipboard}
                className="flex items-center gap-1 text-xs text-primary-200 hover:text-primary-150 font-medium cursor-pointer p-1 rounded hover:bg-primary-200/10 transition-colors"
                title="Copiar lista de nomes"
              >
                {copySuccess ? (
                  <>
                    <span className="text-emerald-600 font-semibold">Copiado!</span>
                    <CopyCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </>
                ) : (
                  <>
                    <span>Copiar</span>
                    <CopyIcon className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Lista */}
          <ul className="p-0 max-h-72 overflow-y-auto thin-scrollbar space-y-1">
            {missingReports && missingReports.length > 0 ? (
              missingReports.map((missingReport) => (
                <li
                  key={missingReport.id}
                  className="py-1.5 px-2.5 rounded-lg text-xs font-medium text-typography-800 hover:bg-surface-200/70 transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{missingReport.fullName}</span>
                  {missingReport.group?.number && (
                    <span className="text-[10px] text-typography-500 bg-surface-200 px-1.5 py-0.5 rounded shrink-0 ml-2">
                      G{missingReport.group.number}
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-xs text-emerald-600 font-medium">
                🎉 Parabéns! Todos os publicadores já enviaram seus relatórios.
              </li>
            )}
          </ul>

          <Popover.Arrow className="fill-surface-100" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
