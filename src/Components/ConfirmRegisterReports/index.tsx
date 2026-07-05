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

import { AlertTriangleIcon } from "lucide-react"

interface ConfirmRegisterReportsProps {
  button: ReactElement
  onRegister: () => void
}

export function ConfirmRegisterReports({ button, onRegister }: ConfirmRegisterReportsProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <div className="w-fit">
          {button}
        </div>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-500">
            Registrar relatórios
          </AlertDialogTitle>
          <AlertDialogDescription className="text-red-400">
            <div className="flex gap-3 items-center">
              <AlertTriangleIcon className="text-red-400" />
              Ao clicar em confirmar isso não poderá ser revertido!
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-gray-100">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
          className="bg-primary-200 hover:bg-primary-100"
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
