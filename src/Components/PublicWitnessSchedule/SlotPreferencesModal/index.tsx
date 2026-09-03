import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import DropdownMulti from "@/Components/DropdownMulti"
import { useSetAtom } from "jotai"
import { updateSlotPreferencesAtom } from "@/atoms/publicWitnessAtoms.ts/schedules"
import { IPublicWitnessArrangement } from "@/types/publicWitness"
import { IPublisher } from "@/types/types"
import { toast } from "react-toastify"
import { SlidersHorizontal, Clock, Info, Check, Loader2 } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  arrangement: IPublicWitnessArrangement
  publishers: IPublisher[]
  onSuccess: () => void
}

export default function SlotPreferencesModal({
  isOpen,
  onClose,
  arrangement,
  publishers,
  onSuccess
}: Props) {
  const updatePreferences = useSetAtom(updateSlotPreferencesAtom)

  // Map time_slot_id -> array of IPublisher
  const [slotPreferencesMap, setSlotPreferencesMap] = useState<Record<string, IPublisher[]>>({})
  const [loading, setLoading] = useState(false)

  const rotativeSlots = arrangement.timeSlots
    .filter(s => s.is_rotative)
    .sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (!isOpen) return

    const initialMap: Record<string, IPublisher[]> = {}
    rotativeSlots.forEach(slot => {
      const prefs = (slot.preferences ?? [])
        .map(pref => publishers.find(p => p.id === pref.publisher_id))
        .filter(Boolean) as IPublisher[]
      initialMap[slot.id] = prefs
    })
    setSlotPreferencesMap(initialMap)
  }, [isOpen, arrangement, publishers])

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        preferences: rotativeSlots.map(slot => ({
          time_slot_id: slot.id,
          publisher_ids: (slotPreferencesMap[slot.id] ?? []).map(p => p.id)
        }))
      }

      await toast.promise(
        updatePreferences(arrangement.id, payload),
        {
          pending: "Salvando preferências...",
          success: "Preferências de horários atualizadas com sucesso!"
        }
      )
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !loading && !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary-200">
            <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-lg">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Preferências de Horário dos Publicadores
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-typography-500 mt-1.5 leading-relaxed">
            Arranjo: <strong className="text-typography-800">{arrangement.title}</strong>. Configure quais publicadores têm preferência de participar em cada horário de rodízio.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Explicativo */}
          <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 leading-relaxed">
              <strong>Como funciona a regra:</strong> Se um publicador tiver preferência cadastrada apenas em um horário específico, o gerador automático <strong>nunca</strong> o colocará em outro horário deste arranjo. Publicadores sem preferência continuam livres para entrar em qualquer horário.
            </p>
          </div>

          {rotativeSlots.length === 0 ? (
            <div className="text-center py-6 text-xs text-typography-500">
              Este arranjo não possui horários com a opção &ldquo;Rodízio&rdquo; ativada.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {rotativeSlots.map(slot => {
                const selected = slotPreferencesMap[slot.id] ?? []
                return (
                  <div
                    key={slot.id}
                    className="p-3.5 rounded-xl border border-surface-300 bg-surface-50/60 flex flex-col gap-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary-200" />
                        <span className="text-xs font-bold text-typography-900">
                          {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-primary-100/20 text-primary-200 font-semibold">
                        {selected.length} {selected.length === 1 ? "publicador" : "publicadores"}
                      </span>
                    </div>

                    <DropdownMulti<IPublisher>
                      title="Selecionar publicadores com preferência"
                      items={publishers}
                      selectedItems={selected}
                      handleChange={items => {
                        setSlotPreferencesMap(prev => ({
                          ...prev,
                          [slot.id]: items
                        }))
                      }}
                      border
                      full
                      labelKey="fullName"
                      textVisible
                      searchable
                      emptyMessage="Nenhum publicador encontrado"
                    />
                  </div>
                )
              })}
            </div>
          )}
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
            onClick={handleSave}
            disabled={loading || rotativeSlots.length === 0}
            className="text-xs flex items-center gap-1.5 bg-primary-200 hover:bg-primary-300 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{loading ? "Salvando..." : "Salvar Preferências"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
