import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deletePublicWitnessArrangementAtom } from "@/atoms/publicWitnessAtoms.ts"
import ArrangementsPageSkeleton from "@/Components/ArrangementsPageSkeleton"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import { PublicWitnessPdfDownload } from "@/Components/PublicWitnessSchedulePdf/PDFLinkComponent"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/Components/ui/alert-dialog"
import { Button } from "@/Components/ui/button"
import { useCongregationContext } from "@/context/CongregationContext"
import { useArrangements } from "@/hooks/useArrangements"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import { IPublicWitnessArrangement } from "@/types/publicWitness"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { useAtom, useSetAtom } from "jotai"
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  FileText,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Users
} from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

dayjs.locale("pt-br")

function ArrangementsPage() {
  const { congregation } = useCongregationContext()
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)
  const deleteArrangement = useSetAtom(deletePublicWitnessArrangementAtom)

  const { data: arrangements, mutate, isLoading } = useArrangements(congregation?.id)

  const [filterTab, setFilterTab] = useState<"ALL" | "FIXED" | "SPECIAL" | "PDF">("ALL")
  const [arrangementToDelete, setArrangementToDelete] = useState<IPublicWitnessArrangement | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setPageActive("Testemunho Público")
    setCrumbs([
      { label: "Início", link: "/dashboard" },
      { label: "Testemunho Público", link: "/congregacao/testemunho-publico" }
    ])
  }, [setPageActive, setCrumbs])

  /** =======================
   *  Separações de dados
   ======================= */
  const fixedArrangements = useMemo(
    () => arrangements?.filter(a => a.is_fixed) ?? [],
    [arrangements]
  )

  const specialArrangements = useMemo(
    () => arrangements?.filter(a => !a.is_fixed) ?? [],
    [arrangements]
  )

  const totalSlotsCount = useMemo(() => {
    if (!arrangements) return 0
    return arrangements.reduce((acc, curr) => acc + (curr.timeSlots?.length ?? 0), 0)
  }, [arrangements])

  const displayedArrangements = useMemo(() => {
    if (!arrangements) return []
    if (filterTab === "FIXED") return fixedArrangements
    if (filterTab === "SPECIAL") return specialArrangements
    return arrangements
  }, [arrangements, filterTab, fixedArrangements, specialArrangements])

  const handleDeleteConfirm = async () => {
    if (!arrangementToDelete) return
    setIsDeleting(true)
    try {
      await toast.promise(deleteArrangement(arrangementToDelete.id), {
        pending: "Excluindo arranjo...",
        success: "Arranjo excluído com sucesso!"
      })
      mutate()
    } catch (err) {
      console.error(err)
    } finally {
      setIsDeleting(false)
      setArrangementToDelete(null)
    }
  }

  /** =======================
   *  Render
   ======================= */
  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Testemunho Público" />

      {isLoading ? (
        <ArrangementsPageSkeleton />
      ) : (
        <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto p-4 sm:p-6 min-w-0">
          {/* Header Superior (Padrão do Meio de Semana) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-100 p-4 sm:p-5 rounded-xl border border-surface-300 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary-100/20 text-primary-200 shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                  Testemunho Público (Carrinho)
                </h1>
                <p className="text-xs text-typography-600">
                  Gerencie os pontos de testemunho, horários de rodízio e programações da congregação
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setFilterTab(f => (f === "PDF" ? "ALL" : "PDF"))}
                className={`text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 ${
                  filterTab === "PDF" ? "bg-surface-200 text-primary-200 font-bold" : "text-typography-800"
                }`}
              >
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Exportar PDF</span>
              </Button>

              <Button
                size="sm"
                onClick={() => Router.push("/congregacao/testemunho-publico/add")}
                className="text-xs flex items-center gap-1.5 bg-primary-200 hover:bg-primary-300 text-white font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Arranjo</span>
              </Button>
            </div>
          </div>

          {/* Cards de Métricas Gerais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total de Arranjos
                </span>
                <MapPin className="w-4 h-4 text-primary-200" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-typography-900">
                {arrangements?.length ?? 0}
              </span>
              <span className="text-[11px] text-typography-500">
                pontos de testemunho cadastrados
              </span>
            </div>

            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Arranjos Semanais
                </span>
                <CalendarDays className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-typography-900">
                {fixedArrangements.length}
              </span>
              <span className="text-[11px] text-typography-500">
                dias fixos toda semana
              </span>
            </div>

            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Arranjos Especiais
                </span>
                <CalendarRange className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-typography-900">
                {specialArrangements.length}
              </span>
              <span className="text-[11px] text-typography-500">
                datas específicas
              </span>
            </div>

            <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 flex flex-col gap-1 shadow-xs">
              <div className="flex items-center justify-between text-typography-500">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Total de Horários
                </span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xl sm:text-2xl font-bold text-typography-900">
                {totalSlotsCount}
              </span>
              <span className="text-[11px] text-typography-500">
                slots configurados no sistema
              </span>
            </div>
          </div>

          {/* Seção de Exportar PDF (Expansível) */}
          {filterTab === "PDF" && congregation?.id && (
            <div className="bg-surface-100 border border-surface-300 rounded-xl p-4 sm:p-5 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-surface-200 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-typography-900">
                    Exportar Quadro de Testemunho Público em PDF
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFilterTab("ALL")}
                  className="text-xs text-typography-500"
                >
                  Fechar
                </Button>
              </div>
              <PublicWitnessPdfDownload congregationId={congregation.id} />
            </div>
          )}

          {/* Abas / Filtro dos Arranjos */}
          <div className="flex items-center justify-between gap-3 border-b border-surface-300 pb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterTab("ALL")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterTab === "ALL"
                    ? "bg-primary-200 text-white shadow-xs"
                    : "bg-surface-100 text-typography-600 hover:bg-surface-200"
                }`}
              >
                Todos ({arrangements?.length ?? 0})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("FIXED")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterTab === "FIXED"
                    ? "bg-primary-200 text-white shadow-xs"
                    : "bg-surface-100 text-typography-600 hover:bg-surface-200"
                }`}
              >
                Semanais / Fixos ({fixedArrangements.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("SPECIAL")}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  filterTab === "SPECIAL"
                    ? "bg-primary-200 text-white shadow-xs"
                    : "bg-surface-100 text-typography-600 hover:bg-surface-200"
                }`}
              >
                Especiais ({specialArrangements.length})
              </button>
            </div>
          </div>

          {/* Grade de Cards dos Arranjos */}
          {displayedArrangements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedArrangements.map(arrangement => (
                <ArrangementCardItem
                  key={arrangement.id}
                  arrangement={arrangement}
                  onDeleteRequest={arr => setArrangementToDelete(arr)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-100 border border-dashed border-surface-300 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 text-typography-500">
              <MapPin className="w-10 h-10 text-typography-400" />
              <p className="text-base font-semibold text-typography-700">
                Nenhum arranjo de testemunho público encontrado.
              </p>
              <p className="text-xs text-typography-500 max-w-sm">
                Clique no botão &ldquo;Novo Arranjo&rdquo; no topo para cadastrar os locais e horários de carrinho.
              </p>
            </div>
          )}

          {/* Diálogo de Confirmação de Exclusão */}
          <AlertDialog
            open={Boolean(arrangementToDelete)}
            onOpenChange={open => !open && setArrangementToDelete(null)}
          >
            <AlertDialogContent className="sm:max-w-[440px]">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Excluir Arranjo
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-typography-600 mt-2 leading-relaxed">
                  Tem certeza que deseja excluir o arranjo{" "}
                  <strong className="text-typography-900">
                    &ldquo;{arrangementToDelete?.title}&rdquo;
                  </strong>
                  ? Esta ação removerá permanentemente todos os horários e programações associados a ele.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex justify-end gap-2 mt-3">
                <AlertDialogCancel disabled={isDeleting} className="text-xs">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="text-xs bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  {isDeleting ? "Excluindo..." : "Sim, Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </ContentDashboard>
  )
}

/* ======================================================
 *  CARD DO ARRANJO (MODERNO)
 * ====================================================== */
function ArrangementCardItem({
  arrangement,
  onDeleteRequest
}: {
  arrangement: IPublicWitnessArrangement
  onDeleteRequest: (arrangement: IPublicWitnessArrangement) => void
}) {
  const sortedSlots = useMemo(() => {
    return (arrangement.timeSlots || [])
      .slice()
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
  }, [arrangement.timeSlots])

  return (
    <div className="bg-surface-100 border border-surface-300 rounded-xl p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4">
      <div className="flex flex-col gap-3">
        {/* Topo do card: tipo e opções rápidas */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-primary-200 bg-primary-100/20 px-2 py-0.5 rounded-md self-start">
              {arrangement.is_fixed
                ? `Fixo • ${
                    arrangement.weekday !== null && arrangement.weekday !== undefined
                      ? WEEKDAY_LABEL[arrangement.weekday as Weekday]
                      : "Sem dia"
                  }`
                : `Especial • ${dayjs(arrangement.date).format("DD/MM/YYYY")}`}
            </span>
            <h3 className="text-base font-bold text-typography-900 line-clamp-2 mt-0.5">
              {arrangement.title}
            </h3>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                Router.push(`/congregacao/testemunho-publico/edit/${arrangement.id}`)
              }
              className="h-8 w-8 text-typography-500 hover:text-typography-900 hover:bg-surface-200"
              title="Editar arranjo"
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteRequest(arrangement)}
              className="h-8 w-8 text-typography-400 hover:text-red-500 hover:bg-red-50"
              title="Excluir arranjo"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Lista de horários do arranjo */}
        <div className="flex flex-col gap-2 pt-1 border-t border-surface-200">
          <span className="text-[11px] font-bold text-typography-500 uppercase tracking-wider">
            Horários ({sortedSlots.length})
          </span>

          <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
            {sortedSlots.map(slot => (
              <div
                key={slot.id}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-surface-50 border border-surface-200 text-xs"
              >
                <div className="flex items-center gap-1.5 font-semibold text-typography-800">
                  <Clock className="w-3.5 h-3.5 text-primary-200" />
                  <span>
                    {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                  </span>
                </div>

                {slot.is_rotative ? (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                    <RefreshCw className="w-2.5 h-2.5" /> Rodízio
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-200 text-typography-600 font-medium">
                    Fixo ({slot.defaultPublishers?.length ?? 0})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botão de Ação para a Programação */}
      <div className="pt-2 border-t border-surface-200">
        <Button
          onClick={() =>
            Router.push(`/congregacao/testemunho-publico/programacao/${arrangement.id}`)
          }
          className="w-full text-xs flex items-center justify-center gap-1.5 bg-primary-200 hover:bg-primary-300 text-white font-semibold py-2"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Ver Programação Mensal</span>
        </Button>
      </div>
    </div>
  )
}

ArrangementsPage.getLayout = withProtectedLayout([
  "ADMIN_CONGREGATION",
  "PUBLIC_WITNESS_MANAGER",
])

export default ArrangementsPage
