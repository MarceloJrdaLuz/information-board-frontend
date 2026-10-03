import React, { ReactElement } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog"

import { CheckCircle2, RefreshCw, Info } from "lucide-react"

interface ConfirmRegisterReportsProps {
  button: ReactElement
  onRegister: () => void
  isUpdate?: boolean
  title?: string
  description?: string
}

export function ConfirmRegisterReports({
  button,
  onRegister,
  isUpdate = false,
  title,
  description,
}: ConfirmRegisterReportsProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="w-fit">
          {button}
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-md w-[calc(100%-2rem)] sm:w-full bg-surface-100 border border-surface-300 rounded-2xl p-6 shadow-xl">
        <AlertDialogHeader className="gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isUpdate
                  ? "bg-amber-500/10 text-amber-500 dark:bg-amber-500/20"
                  : "bg-primary-200/10 text-primary-200"
              }`}
            >
              {isUpdate ? (
                <RefreshCw className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <AlertDialogTitle className="text-base sm:text-lg font-bold text-typography-900 text-left">
              {title || (isUpdate ? "Atualizar Registro de Totais" : "Registrar Relatórios e Totais")}
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs sm:text-sm text-typography-600 leading-relaxed text-left">
            {description ||
              (isUpdate
                ? "Deseja atualizar os totais consolidados deste mês? Os relatórios mais recentes serão recalculados e salvos no sistema."
                : "Deseja confirmar e consolidar os relatórios e totais deste mês? Os dados registrados servirão de base para o envio dos totais.")}
          </AlertDialogDescription>

          {isUpdate && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-surface-200/60 border border-surface-300 text-typography-600 text-xs text-left">
              <Info className="w-4 h-4 text-primary-200 shrink-0 mt-0.5" />
              <span>
                Lembre-se de atualizar também os dados no sistema de Betel caso já tenha feito o envio anteriormente.
              </span>
            </div>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-row justify-end gap-2 mt-4 pt-2">
          <AlertDialogCancel className="h-9 px-4 rounded-xl border-surface-300 hover:bg-surface-200 text-typography-700 font-semibold text-xs transition cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            className="h-9 px-5 rounded-xl bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
            onClick={() => {
              onRegister()
            }}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
