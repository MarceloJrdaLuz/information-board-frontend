"use client"

import { useState, ReactElement } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, AlertTriangle } from "lucide-react"
import Button from "../Button"

interface ConfirmDeleteModalProps {
  button: ReactElement
  onDelete: () => Promise<void> | void
  title?: string
  message?: string
}

export function ConfirmDeleteModal({
  button,
  onDelete,
  title = "Excluir item",
  message = "Tem certeza que deseja excluir? Essa ação não poderá ser desfeita.",
}: ConfirmDeleteModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    await onDelete()
    setLoading(false)
    setOpen(false)
  }

  return (
    <>
      <div onClick={() => setOpen(true)}>{button}</div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-surface-100 border border-surface-200 rounded-2xl shadow-2xl p-6 w-[90%] max-w-sm"
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500/10 text-red-500">
                  <AlertTriangle size={22} />
                </div>

                <h2 className="text-lg font-semibold text-typography-800">
                  {title}
                </h2>
                <p className="text-sm text-typography-500">{message}</p>

                <div className="flex gap-3 mt-5 w-full">
                  <Button
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-surface-200 text-typography-200 hover:bg-surface-200/80"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleDelete}
                    disabled={loading}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-typography-200  flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="animate-pulse">Excluindo...</span>
                    ) : (
                      <>
                        <Trash2 size={16} />
                        Confirmar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
