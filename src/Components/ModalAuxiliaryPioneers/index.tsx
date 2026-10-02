import React, { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/Components/ui/dialog"
import { Button } from "@/Components/ui/button"
import { IPublisher, Privileges, Situation } from "@/types/types"
import { api } from "@/services/api"
import { toast } from "react-toastify"
import { Award, Check, Loader2, Search, Sparkles, User, Users } from "lucide-react"
import { capitalizeFirstLetter, isAuxPioneerMonth } from "@/functions/isAuxPioneerMonthNow"

interface ModalAuxiliaryPioneersProps {
  isOpen: boolean
  onClose: () => void
  congregationId: string
  month?: string
  year?: string
  publishers?: IPublisher[]
  onSaved: () => void
}

export function ModalAuxiliaryPioneers({
  isOpen,
  onClose,
  congregationId,
  month,
  year,
  publishers,
  onSaved,
}: ModalAuxiliaryPioneersProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [internalPublishers, setInternalPublishers] = useState<IPublisher[]>([])
  const [loadingPublishers, setLoadingPublishers] = useState(false)

  // Extract month and year safely even if formatted with hyphens or spaces
  const { currentMonth, currentYear, monthFormatted } = useMemo(() => {
    let m = (month || "").trim()
    let y = (year || "").trim()
    if (!y && m) {
      const parts = decodeURIComponent(m)
        .replace(/\s+de\s+/i, " ")
        .split(/[\s\-_]+/)
      if (parts.length >= 2) {
        m = parts[0]
        y = parts[1]
      }
    }
    const cleanMonth = m.toLowerCase()
    return {
      currentMonth: cleanMonth,
      currentYear: y,
      monthFormatted: cleanMonth ? capitalizeFirstLetter(cleanMonth) : "",
    }
  }, [month, year])

  // Effective publishers: props or internally fetched
  const effectivePublishers = useMemo(() => {
    if (publishers && publishers.length > 0) return publishers
    return internalPublishers
  }, [publishers, internalPublishers])

  // Fetch publishers directly if not provided via props
  useEffect(() => {
    if (!isOpen || !congregationId) return
    if (publishers && publishers.length > 0) return

    let isMounted = true
    setLoadingPublishers(true)
    api
      .get(`/publishers/congregationId/${congregationId}`)
      .then((res) => {
        if (!isMounted) return
        setInternalPublishers(res.data || [])
      })
      .catch((err) => {
        console.error("Erro ao carregar publicadores no modal:", err)
      })
      .finally(() => {
        if (isMounted) setLoadingPublishers(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, congregationId, publishers])

  // Filter only baptized publishers
  const isBaptized = (p: IPublisher) => {
    if (p.dateImmersed) return true
    const privs = p.privileges || []
    const relPrivs = (p.privilegesRelation || []).map((pr) => pr.privilege?.name)
    const allPrivs = [...privs, ...relPrivs]
    const baptizedPrivileges = [
      "Ancião", "Elder",
      "Servo Ministerial", "Ministerial Servant",
      "Pioneiro Regular", "Regular Pioneer",
      "Pioneiro Especial", "Special Pioneer",
      "Missionário em Campo", "Missionário", "Missionario", "Missionary Worldwide", "Missionary",
      "Auxiliar por Tempo Indeterminado", "Auxiliar Indeterminado", "Continuous Auxiliary Pioneer",
      "Pioneiro Auxiliar", "Auxiliary Pioneer"
    ]
    return allPrivs.some((priv) => priv && baptizedPrivileges.includes(priv))
  }

  // Active and baptized publishers only
  const activePublishers = useMemo(() => {
    return (effectivePublishers || [])
      .filter((p) => p.situation === Situation.ATIVO && isBaptized(p))
      .sort((a, b) => (a.fullName || "").localeCompare(b.fullName || ""))
  }, [effectivePublishers])

  // Fetch current auxiliary pioneers for this month
  useEffect(() => {
    if (!isOpen || !congregationId || !currentMonth || !currentYear) return

    let isMounted = true
    setIsLoading(true)

    const legacyMonthFormat = `${capitalizeFirstLetter(currentMonth)}-${currentYear}`

    api
      .get(`/congregations/${congregationId}/auxiliary-pioneers`, {
        params: { month: currentMonth, year: currentYear },
      })
      .then((res) => {
        if (!isMounted) return
        const ids = (res.data || [])
          .filter((item: any) => !item.isContinuous)
          .map((item: any) => item.publisherId)
        setSelectedIds(ids)
      })
      .catch((err) => {
        console.error("Erro ao carregar pioneiros auxiliares do mês:", err)
        if (!isMounted) return
        // Fallback to checking active publishers directly
        const localIds = activePublishers
          .filter((p) => isAuxPioneerMonth(p, legacyMonthFormat))
          .map((p) => p.id)
        setSelectedIds(localIds)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, congregationId, currentMonth, currentYear])

  const isContinuousAux = (p: IPublisher) => {
    return (
      p.privileges?.includes(Privileges.AUXILIARTEMPOINDETERMINADO) ||
      p.privileges?.includes(Privileges.AUXILIARINDETERMINADO) ||
      p.privilegesRelation?.some(
        (pp) => pp.privilege?.name === "Continuous Auxiliary Pioneer"
      )
    )
  }

  const isRegularPioneer = (p: IPublisher) => {
    return (
      p.privileges?.includes(Privileges.PIONEIROREGULAR) ||
      p.privileges?.includes("Pioneiro Regular") ||
      p.privilegesRelation?.some((pp) => pp.privilege?.name === "Regular Pioneer")
    )
  }

  const isSpecialPioneer = (p: IPublisher) => {
    return (
      p.privileges?.includes(Privileges.PIONEIROESPECIAL) ||
      p.privileges?.includes("Pioneiro Especial") ||
      p.privileges?.includes("Special Pioneer") ||
      p.privilegesRelation?.some((pp) => pp.privilege?.name === "Special Pioneer")
    )
  }

  const isMissionary = (p: IPublisher) => {
    return (
      p.privileges?.includes(Privileges.MISSIONARIOEMCAMPO) ||
      p.privileges?.includes("Missionário em Campo") ||
      p.privileges?.includes("Missionário") ||
      p.privileges?.includes("Missionario") ||
      p.privileges?.includes("Missionary Worldwide") ||
      p.privilegesRelation?.some(
        (pp) =>
          pp.privilege?.name === "Missionary Worldwide" ||
          pp.privilege?.name === "Missionary"
      )
    )
  }

  const filteredPublishers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    if (!term) return activePublishers
    return activePublishers.filter((p) => {
      const matchName =
        p.fullName?.toLowerCase().includes(term) ||
        (p.nickname && p.nickname.toLowerCase().includes(term))
      if (matchName) return true

      if (term.includes("regul") && isRegularPioneer(p)) return true
      if (term.includes("espec") && isSpecialPioneer(p)) return true
      if (term.includes("miss") && isMissionary(p)) return true
      if (term.includes("indeterm") && isContinuousAux(p)) return true

      return false
    })
  }, [activePublishers, searchTerm])

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = () => {
    const selectableFiltered = filteredPublishers.filter((p) => !isContinuousAux(p))
    const selectableIds = selectableFiltered.map((p) => p.id)
    const allSelected =
      selectableIds.length > 0 &&
      selectableIds.every((id) => selectedIds.includes(id))

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !selectableIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...selectableIds])))
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      await api.post(`/congregations/${congregationId}/auxiliary-pioneers`, {
        month: currentMonth,
        year: currentYear,
        publisherIds: selectedIds,
      })
      toast.success(
        `Pioneiros auxiliares de ${monthFormatted}/${currentYear} atualizados!`
      )
      onSaved()
      onClose()
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Erro ao salvar pioneiros auxiliares"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const isAnyLoading = isLoading || loadingPublishers

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] sm:w-full max-h-[88vh] flex flex-col p-0 overflow-hidden bg-surface-100 rounded-2xl border border-surface-300 shadow-2xl">
        <DialogHeader className="p-5 sm:p-6 pb-4 border-b border-surface-200 shrink-0">
          <div className="flex items-center gap-2.5 text-primary-200 mb-1">
            <Award className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Designação Mensal
            </span>
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold text-typography-900">
            Pioneiros Auxiliares — {monthFormatted}{currentYear ? ` de ${currentYear}` : ""}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-typography-500">
            Marque os publicadores batizados que servirão como pioneiro auxiliar neste mês específico.
          </DialogDescription>
        </DialogHeader>

        {/* Search bar & quick stats */}
        <div className="px-5 sm:px-6 py-3 bg-surface-200/50 border-b border-surface-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-typography-400" />
            <input
              type="text"
              placeholder="Buscar por nome, apelido ou privilégio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-surface-100 border border-surface-300 rounded-xl text-xs sm:text-sm text-typography-900 placeholder:text-typography-400 focus:outline-none focus:border-primary-200 transition-colors"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-medium text-typography-600">
            {filteredPublishers.some((p) => !isContinuousAux(p)) && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="text-[11px] font-semibold text-primary-200 hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-primary-200/10 transition-colors"
              >
                {filteredPublishers
                  .filter((p) => !isContinuousAux(p))
                  .every((p) => selectedIds.includes(p.id))
                  ? "Desmarcar todos"
                  : "Marcar todos"}
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-200/10 text-primary-200 font-semibold border border-primary-200/20">
              <Sparkles className="w-3.5 h-3.5" />
              {selectedIds.length} selecionado{selectedIds.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Publishers list */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-2 thin-scrollbar overscroll-contain">
          {isAnyLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-typography-400 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-200" />
              <span className="text-xs">Carregando publicadores batizados...</span>
            </div>
          ) : filteredPublishers.length === 0 ? (
            <div className="text-center py-12 text-typography-400 text-xs sm:text-sm">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Nenhum publicador batizado encontrado.
            </div>
          ) : (
            filteredPublishers.map((publisher) => {
              const isSelected = selectedIds.includes(publisher.id)
              const isContinuous = isContinuousAux(publisher)
              const isRegPioneer = isRegularPioneer(publisher)
              const isSpecPioneer = isSpecialPioneer(publisher)
              const isMiss = isMissionary(publisher)

              return (
                <div
                  key={publisher.id}
                  onClick={() => !isContinuous && toggleSelect(publisher.id)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all select-none ${
                    isContinuous
                      ? "bg-primary-200/5 border-primary-200/20 opacity-80 cursor-default"
                      : isSelected
                      ? "bg-primary-200/10 border-primary-200 shadow-xs cursor-pointer"
                      : "bg-surface-100 border-surface-200 hover:border-surface-300 hover:bg-surface-200/30 cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                        isContinuous
                          ? "bg-primary-200 text-typography-100"
                          : isSelected
                          ? "bg-primary-200 text-typography-100"
                          : "bg-surface-200 text-typography-500"
                      }`}
                    >
                      {isContinuous ? (
                        <Sparkles className="w-4 h-4" />
                      ) : isSelected ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-typography-900 truncate">
                          {publisher.nickname || publisher.fullName}
                        </span>
                        {publisher.nickname && (
                          <span className="text-[11px] text-typography-400 truncate hidden sm:inline">
                            ({publisher.fullName})
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                        {isContinuous && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-200/10 text-primary-200 border border-primary-200/20">
                            Auxiliar por Tempo Indeterminado
                          </span>
                        )}
                        {isRegPioneer && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            Pioneiro Regular
                          </span>
                        )}
                        {isSpecPioneer && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            Pioneiro Especial
                          </span>
                        )}
                        {isMiss && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Missionário em Campo
                          </span>
                        )}
                        {publisher.group?.name && (
                          <span className="text-[10px] text-typography-400">
                            {publisher.group.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    {isContinuous ? (
                      <span className="text-[11px] text-typography-400 italic">
                        Contínuo
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleSelect(publisher.id)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded text-primary-200 focus:ring-primary-200 cursor-pointer accent-primary-200"
                      />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-5 border-t border-surface-200 bg-surface-200/30 flex items-center justify-between gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-xl text-xs sm:text-sm cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isAnyLoading}
            className="bg-primary-200 hover:bg-primary-150 text-typography-100 font-semibold px-5 rounded-xl text-xs sm:text-sm flex items-center gap-2 cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Salvar Alterações</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ModalAuxiliaryPioneers
