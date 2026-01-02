import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deletePublicWitnessArrangementAtom } from "@/atoms/publicWitnessAtoms.ts"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import { CollapsibleCard } from "@/Components/CollapsibleCard"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import { ListGeneric } from "@/Components/ListGeneric"
import { PublicWitnessPdfDownload } from "@/Components/PublicWitnessSchedulePdf/PDFLinkComponent"
import { useCongregationContext } from "@/context/CongregationContext"
import { useArrangements } from "@/hooks/useArrangements"
import { Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import { IPublicWitnessArrangement } from "@/types/publicWitness"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { Calendar, Clock } from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo } from "react"
import { toast } from "react-toastify"

function ArrangementsPage() {
    const { congregation } = useCongregationContext()
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const deleteArrangement = useSetAtom(deletePublicWitnessArrangementAtom)

    const { data: arrangements, mutate } = useArrangements(congregation?.id)

    useEffect(() => {
        setPageActive("Testemunho Público - Arranjos")
    }, [setPageActive])

    /** =======================
     *  Separações de dados
     ======================= */
    const fixedArrangements = useMemo(
        () => arrangements?.filter(a => a.is_fixed) ?? [],
        [arrangements]
    )

    const arrangementsByDate = useMemo(() => {
        if (!arrangements) return {}

        return arrangements
            .filter(a => !a.is_fixed && a.date)
            .reduce<Record<string, IPublicWitnessArrangement[]>>((acc, item) => {
                if (!item.date) return acc
                if (!acc[item.date]) acc[item.date] = []
                acc[item.date].push(item)
                return acc
            }, {})
    }, [arrangements])

    const handleDelete = async (arrangement_id: string) => {
        await toast.promise(deleteArrangement(arrangement_id), {
            pending: "Excluindo arranjo..."
        }).then(() => {
            mutate()
        }).catch(err => { console.log(err) })
    }

    /** =======================
     *  Render
     ======================= */
    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Testemunho Público - Arranjos" />

            <section className="flex flex-col w-full p-5 gap-6">
                {/* Header */}
                <div className="w-full h-full">
                    <h1 className="text-xl font-semibold text-primary-200">
                        Testemunho Público - Arranjos
                    </h1>

                    <div className="flex justify-between items-center mb-3">
                        <Button
                            outline
                            onClick={() => Router.push("/congregacao/testemunho-publico/add")}
                        >
                            Novo arranjo
                        </Button>
                    </div>
                </div>

                {congregation?.id && (
                    <PublicWitnessPdfDownload congregationId={congregation.id} />
                )}


                {/* ================= Arranjos Fixos ================= */}
                <CollapsibleCard full title="Arranjos Fixos" defaultOpen>
                    <div className="w-full flex flex-wrap">
                        {fixedArrangements.length > 0 ? (
                            <ListGeneric
                                paddingBottom="8"
                                items={fixedArrangements}
                                path="/congregacao/testemunho-publico"
                                label="do arranjo"
                                onUpdate={() => { }}
                                onDelete={handleDelete}
                                renderItem={(arrangement) => (
                                    <ArrangementsCard arrangement={arrangement} />
                                )}
                            />
                        ) : (
                            <EmptyState message="Nenhum arranjo fixo cadastrado" />
                        )}
                    </div>
                </CollapsibleCard>

                {/* ================= Arranjos por Data ================= */}
                <CollapsibleCard full title="Arranjos especiais" defaultOpen>
                    {Object.keys(arrangementsByDate).length > 0 ? (
                        Object.entries(arrangementsByDate).map(([date, items]) => (
                            <div key={date} className="flex flex-col gap-2 border-b border-surface-200 mt-2">
                                <h3 className="font-medium text-typography-700 flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> {date}
                                </h3>

                                <ListGeneric
                                    paddingBottom="8"
                                    items={items}
                                    path="/congregacao/testemunho-publico"
                                    label="do arranjo"
                                    onUpdate={() => { }}
                                    onDelete={handleDelete}
                                    renderItem={(arrangement) => (
                                        <ArrangementsCard arrangement={arrangement} />
                                    )}
                                />
                            </div>
                        ))
                    ) : (
                        <EmptyState message="Nenhum arranjo por data cadastrado" />
                    )}
                </CollapsibleCard>
            </section>
        </ContentDashboard>
    )
}

/* =======================
 *  Card isolado
 ======================= */
function ArrangementsCard({
    arrangement,
}: {
    arrangement: IPublicWitnessArrangement
}) {
    return (
        <div className="flex flex-col gap-3 p-4 border rounded-md hover:shadow-md transition-shadow">
            {/* Título do arranjo */}
            <h3 className="text-lg font-semibold text-typography-800">
                {arrangement.title}
            </h3>

            {/* Tipo do arranjo */}
            <div className="text-sm text-typography-600">
                {arrangement.is_fixed
                    ? `Arranjo fixo • ${arrangement.weekday !== null && arrangement.weekday !== undefined
                        ? WEEKDAY_LABEL[arrangement.weekday as Weekday]
                        : ""
                    }`
                    : `Data específica • ${arrangement.date}`
                }
            </div>

            {/* Horários */}
            <ul className="text-sm text-typography-700">
                {arrangement.timeSlots
                    .sort((a, b) => a.order - b.order)
                    .map(slot => (
                        <li key={slot.id} className="flex flex-col gap-1">
                            {/* Horário + Rodízio */}
                            <div className="flex items-center gap-1 text-sm">
                                <Clock className="w-4 h-4" />
                                {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                                {slot.is_rotative && (
                                    <span className="ml-2 text-xs text-warning-500 font-medium">
                                        Rodízio
                                    </span>
                                )}
                            </div>

                            {/* Publishers fixos, apenas se não for rodízio */}
                            {!slot.is_rotative && slot.defaultPublishers.length > 0 && (
                                <div className="ml-5 text-xs text-typography-600 leading-snug">
                                    {slot.defaultPublishers
                                        .sort((a, b) => a.order - b.order)
                                        .map(dp => dp.publisher.fullName)
                                        .join(", ")
                                    }
                                </div>
                            )}
                        </li>
                    ))
                }
            </ul>

            {/* Botão Programação */}
            <div className="flex flex-1 justify-center mt-2">
                <Button
                    outline
                    onClick={() =>
                        Router.push(`/congregacao/testemunho-publico/programacao/${arrangement.id}`)
                    }
                >
                    Programação
                </Button>
            </div>
        </div>
    )
}

ArrangementsPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "FIELD_SERVICE_MANAGER",
])

export default ArrangementsPage
