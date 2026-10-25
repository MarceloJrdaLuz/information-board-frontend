import React, { useEffect, useMemo, useState } from "react"
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
import { updateArrangementPublishersAtom } from "@/atoms/publicWitnessAtoms.ts"
import { IPublicWitnessArrangement } from "@/types/publicWitness"
import { IPublisher } from "@/types/types"
import { toast } from "react-toastify"
import {
  Users,
  Search,
  Check,
  CheckCheck,
  XCircle,
  Loader2,
  Sparkles,
  UserCheck,
  Filter,
  X
} from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  arrangement: IPublicWitnessArrangement
  publishers: IPublisher[]
  onSuccess: () => void
}

export default function ArrangementPublishersModal({
  isOpen,
  onClose,
  arrangement,
  publishers,
  onSuccess
}: Props) {
  const updatePublishers = useSetAtom(updateArrangementPublishersAtom)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [genderFilter, setGenderFilter] = useState<"ALL" | "M" | "F" | "SELECTED">("ALL")
  const [loading, setLoading] = useState(false)

  // Sincroniza estado inicial ao abrir modal
  useEffect(() => {
    if (!isOpen) return
    const initialIds = new Set(
      (arrangement.arrangementPublishers ?? []).map(ap => ap.publisher_id)
    )
    setSelectedIds(initialIds)
    setSearch("")
    setGenderFilter("ALL")
  }, [isOpen, arrangement])

  // Normalização de gênero
  const getGender = (gender?: string): "M" | "F" => {
    if (!gender) return "M"
    return gender.trim().toLowerCase().startsWith("f") ? "F" : "M"
  }

  // Filtragem de publicadores
  const filteredPublishers = useMemo(() => {
    return publishers.filter(pub => {
      // Filtro de texto por nome
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesName = pub.fullName.toLowerCase().includes(query)
        if (!matchesName) return false
      }

      // Filtro por tab/gênero/seleção
      if (genderFilter === "M") {
        if (getGender(pub.gender) !== "M") return false
      } else if (genderFilter === "F") {
        if (getGender(pub.gender) !== "F") return false
      } else if (genderFilter === "SELECTED") {
        if (!selectedIds.has(pub.id)) return false
      }

      return true
    })
  }, [publishers, search, genderFilter, selectedIds])

  // Toggle individual
  const togglePublisher = (pubId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(pubId)) {
        next.delete(pubId)
      } else {
        next.add(pubId)
      }
      return next
    })
  }

  // Selecionar todos os filtrados
  const handleSelectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      filteredPublishers.forEach(p => next.add(p.id))
      return next
    })
  }

  // Desmarcar todos os filtrados
  const handleDeselectAllFiltered = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      filteredPublishers.forEach(p => next.delete(p.id))
      return next
    })
  }

  // Salvar alterações
  const handleSave = async () => {
    setLoading(true)
    try {
      await toast.promise(
        updatePublishers(arrangement.id, Array.from(selectedIds)),
        {
          pending: "Atualizando participantes do arranjo...",
          success: arrangement.is_fixed
            ? "Participantes do rodízio atualizados com sucesso!"
            : "Participantes da data especial atualizados com sucesso!"
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

  const selectedCount = selectedIds.size
  const totalCount = publishers.length

  return (
    <Dialog open={isOpen} onOpenChange={open => !loading && !open && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[650px] max-h-[90dvh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Cabeçalho */}
        <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-surface-300 shrink-0">
          <div className="flex items-center gap-2.5 text-primary-200">
            <div className="p-2.5 bg-primary-100/30 dark:bg-primary-950/40 rounded-xl">
              <UserCheck className="h-5 w-5 text-primary-200" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-typography-900">
                {arrangement.is_fixed ? "Participantes do Rodízio" : "Participantes da Data Especial"}
              </DialogTitle>
              <DialogDescription className="text-xs text-typography-500 mt-0.5 leading-relaxed">
                Arranjo: <strong className="text-typography-800">{arrangement.title}</strong>
              </DialogDescription>
            </div>
          </div>
          <p className="text-xs text-typography-500 mt-2 bg-surface-200/60 p-2.5 rounded-xl border border-surface-300/60">
            {arrangement.is_fixed ? (
              <>
                💡 <strong>Como funciona:</strong> Somente os publicadores marcados abaixo entrarão no sorteio/rodízio automático deste arranjo. Quem não for selecionado aqui não receberá designações automáticas neste carrinho.
              </>
            ) : (
              <>
                💡 <strong>Como funciona:</strong> Somente os publicadores marcados abaixo serão distribuídos entre os horários desta data especial ao gerar os pares automaticamente.
              </>
            )}
          </p>
        </DialogHeader>

        {/* Filtros e Barra de Pesquisa */}
        <div className="p-4 sm:p-5 pb-3 border-b border-surface-200 flex flex-col gap-3 bg-surface-50/50">
          {/* Campo de Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400" />
            <input
              type="text"
              placeholder="Buscar por nome do publicador..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-surface-100 border border-surface-300 focus:outline-none focus:ring-2 focus:ring-primary-200 text-typography-800 placeholder:text-typography-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Abas e Ações Rápidas */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-surface-200/80 p-0.5 rounded-lg border border-surface-300 text-xs">
              <button
                type="button"
                onClick={() => setGenderFilter("ALL")}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  genderFilter === "ALL"
                    ? "bg-surface-100 text-primary-200 font-bold shadow-2xs"
                    : "text-typography-600 hover:text-typography-900"
                }`}
              >
                Todos ({publishers.length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter("M")}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  genderFilter === "M"
                    ? "bg-surface-100 text-blue-600 font-bold shadow-2xs"
                    : "text-typography-600 hover:text-typography-900"
                }`}
              >
                Irmãos ({publishers.filter(p => getGender(p.gender) === "M").length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter("F")}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  genderFilter === "F"
                    ? "bg-surface-100 text-pink-600 font-bold shadow-2xs"
                    : "text-typography-600 hover:text-typography-900"
                }`}
              >
                Irmãs ({publishers.filter(p => getGender(p.gender) === "F").length})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter("SELECTED")}
                className={`px-2 py-1 rounded-md font-medium transition-all ${
                  genderFilter === "SELECTED"
                    ? "bg-surface-100 text-emerald-600 font-bold shadow-2xs"
                    : "text-typography-600 hover:text-typography-900"
                }`}
              >
                Selecionados ({selectedCount})
              </button>
            </div>

            {/* Ações em lote */}
            <div className="flex items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-[11px] font-semibold text-primary-200 hover:bg-primary-100/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                title="Marcar todos exibidos"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar todos</span>
              </button>
              <span className="text-surface-300">|</span>
              <button
                type="button"
                onClick={handleDeselectAllFiltered}
                className="text-[11px] font-semibold text-typography-500 hover:bg-surface-200 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
                title="Desmarcar todos exibidos"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Desmarcar todos</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Publicadores com Scroll */}
        <div className="flex-1 overflow-y-auto discrete-scrollbar p-4 sm:p-5 max-h-[46vh] flex flex-col gap-2">
          {filteredPublishers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-typography-500 gap-2">
              <Users className="w-8 h-8 opacity-40 text-typography-400" />
              <span className="text-xs font-medium">Nenhum publicador encontrado no filtro.</span>
            </div>
          ) : (
            filteredPublishers.map(pub => {
              const isSelected = selectedIds.has(pub.id)
              const gender = getGender(pub.gender)

              return (
                <div
                  key={pub.id}
                  onClick={() => togglePublisher(pub.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    isSelected
                      ? "bg-primary-50/50 dark:bg-primary-950/20 border-primary-200 shadow-2xs"
                      : "bg-surface-100 border-surface-300 hover:bg-surface-200/60"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox customizado */}
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? "bg-primary-200 border-primary-200 text-white"
                          : "border-surface-400 bg-surface-100"
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    {/* Informações da Pessoa */}
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-typography-900 truncate">
                          {pub.fullName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0 ${
                            gender === "M"
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300"
                          }`}
                        >
                          {gender === "M" ? "Irmão" : "Irmã"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                        : "bg-surface-200 text-typography-500"
                    }`}
                  >
                    {isSelected ? "No rodízio" : "Não participa"}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé */}
        <DialogFooter className="p-3 sm:p-4 border-t border-surface-300 bg-surface-50/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full shrink-0">
          <div className="text-xs text-typography-600 text-center sm:text-left">
            <strong>{selectedCount}</strong> de {totalCount} selecionados
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="text-xs border-surface-300 hover:bg-surface-200 flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={loading}
              className="text-xs bg-primary-200 hover:bg-primary-300 text-white font-semibold flex items-center justify-center gap-1.5 flex-1 sm:flex-initial whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Participantes</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

