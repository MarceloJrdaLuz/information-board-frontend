import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { generateFieldServiceAtom } from "@/atoms/fieldServiceAtoms"
import { GenerateFieldService } from "@/atoms/fieldServiceAtoms/types"
import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import Calendar from "@/Components/Calendar"
import { CollapsibleCard } from "@/Components/CollapsibleCard"
import ContentDashboard from "@/Components/ContentDashboard"
import Dropdown from "@/Components/Dropdown"
import DropdownObject from "@/Components/DropdownObjects"
import { FieldServiceExceptionsCard } from "@/Components/FieldServiceExceptionCard"
import { FieldServicePdfDownload, PdfLinkComponent } from "@/Components/FieldServiceSchedulePdf/PdfLinkComponent"
import { API_ROUTES } from "@/constants/apiRoutes"
import { useCongregationContext } from "@/context/CongregationContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { FieldServicePdfResponse, FieldServiceTemplateOption, IFieldServiceSchedule, IFieldServiceTemplate, Weekday, WEEKDAY_LABEL } from "@/types/fieldService"
import { formatHour } from "@/utils/formatTime"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import dayjs from "dayjs"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import { useAtom, useSetAtom } from "jotai"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)


function FieldServiceSchedulePage() {
    const { congregation } = useCongregationContext()
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)
    const generateFieldService = useSetAtom(generateFieldServiceAtom)
    const [templates, setTemplates] = useState<IFieldServiceTemplate[]>([])
    const [showAllSchedules, setShowAllSchedules] = useState(false)
    const [selectedTemplate, setSelectedTemplate] =
        useState<IFieldServiceTemplate | null>(null)

    const [startDate, setStartDate] = useState<string | null>(
        dayjs().startOf("month").format("YYYY-MM-DD")
    )
    const [endDate, setEndDate] = useState<string | null>(
        dayjs().endOf("month").format("YYYY-MM-DD")
    )
    const [mode, setMode] = useState<"append" | "reconcile">("append")

    const [pdfStartDate, setPdfStartDate] = useState<string | null>(
        dayjs().startOf("month").format("YYYY-MM-DD")
    )
    const [pdfEndDate, setPdfEndDate] = useState<string | null>(
        dayjs().endOf("month").format("YYYY-MM-DD")
    )


    /* ======================
     * Buscar templates
     ====================== */
    const { data: templatesData } = useAuthorizedFetch<IFieldServiceTemplate[]>(
        congregation
            ? `${API_ROUTES.FIELD_SERVICE_TEMPLATES}/congregation/${congregation.id}`
            : "",
        {
            allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
        }
    )

    const filterTemplatesRotation = templatesData?.filter(t => t.type === "ROTATION");

    useEffect(() => {
        if (templatesData) {
            setTemplates(templatesData)
        }
    }, [templatesData])

    /* ======================
     * Buscar programação
     ====================== */
    const { data: schedules, mutate } =
        useAuthorizedFetch<IFieldServiceSchedule[]>(
            selectedTemplate
                ? `${API_ROUTES.FIELD_SERVICE_TEMPLATES}/${selectedTemplate.id}/schedules`
                : "",
            {
                allowedRoles: ["ADMIN_CONGREGATION", "FIELD_SERVICE_MANAGER"],
            }
        )

    useEffect(() => {
        setPageActive("Programação do Campo")
    }, [])

    /* ======================
     * Gerar programação
     ====================== */
    const handleGenerate = async () => {
        if (!selectedTemplate) {
            toast.info("Selecione uma saída")
            return
        }

        const payload: GenerateFieldService = {
            startDate: startDate!,
            endDate: endDate!,
            mode: mode,
        }

        await toast.promise(
            generateFieldService(selectedTemplate.id, payload),
            {
                pending: "Gerando programação...",
            }
        ).then(
            () => mutate()
        ).catch(
            err => console.log(err)
        )
    }

    const templateOptions: FieldServiceTemplateOption[] = filterTemplatesRotation?.map(t => ({
        ...t,
        label: `${WEEKDAY_LABEL[t.weekday as Weekday]} · ${formatHour(t.time)} · ${t.location}`
    })) ?? []

    const MODE_LABEL: Record<"append" | "reconcile", string> = {
        append: "Manter antiga",
        reconcile: "Substituir antiga",
    }

    const hasSchedulesInPeriod = (() => {
        if (!schedules || !startDate || !endDate) return false

        return schedules.some(schedule => {
            const date = dayjs(schedule.date)
            return (
                date.isSameOrAfter(startDate, "day") &&
                date.isSameOrBefore(endDate, "day")
            )
        })
    })()

    const modeOptions = Object.values(MODE_LABEL)


    const modeFromLabel = (label: string): "append" | "reconcile" => {
        return (Object.entries(MODE_LABEL).find(
            ([, value]) => value === label
        )?.[0] ?? "append") as "append" | "reconcile"
    }


    useEffect(() => {
        if (!hasSchedulesInPeriod && mode === "reconcile") {
            setMode("append")
        }
    }, [hasSchedulesInPeriod, mode])

    const previewSchedules = showAllSchedules
        ? schedules
        : schedules?.slice(0, 3)


    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive="Programação do Campo" />

            <div className="flex flex-wrap justify-around gap-6 m-6 p-6 bg-surface-100">
                {/* ================= TEMPLATE ================= */}
                <DropdownObject<FieldServiceTemplateOption>
                    title="Saída de campo"
                    items={templateOptions}
                    selectedItem={
                        selectedTemplate
                            ? {
                                ...selectedTemplate,
                                label: `${WEEKDAY_LABEL[selectedTemplate.weekday as Weekday]} · ${formatHour(selectedTemplate.time)} · ${selectedTemplate.location}`
                            }
                            : null
                    }
                    handleChange={(item) => setSelectedTemplate(item)}
                    labelKey="label"
                    full
                    border
                    textVisible
                />


                <CollapsibleCard title="Datas sem saída" defaultOpen={false}>
                    <FieldServiceExceptionsCard />
                </CollapsibleCard>

                {/* ================= GERAR ================= */}
                <CollapsibleCard title="Gerar programação" defaultOpen>
                    <Calendar
                        label="Data inicial"
                        selectedDate={startDate}
                        handleDateChange={setStartDate}
                        full
                    />

                    <Calendar
                        label="Data final"
                        selectedDate={endDate}
                        handleDateChange={setEndDate}
                        minDate={startDate}
                        full
                    />

                    {hasSchedulesInPeriod && (
                        <div className="my-2">
                            <Dropdown
                                title="Modo"
                                options={modeOptions}
                                selectedItem={MODE_LABEL[mode]}
                                handleClick={(label) => setMode(modeFromLabel(label))}
                                full
                                border
                                textVisible
                            />
                        </div>
                    )}

                    {hasSchedulesInPeriod && (
                        <div className="my-2 p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm">
                            ⚠️ Já existe para essa saída de campo uma programação no período selecionado.
                            Escolha como deseja proceder.
                        </div>
                    )}

                    {schedules && schedules.length > 0 && (
                        <div className="p-3 border rounded-md bg-surface-100 w-full max-w-[400px]">
                            <p className="text-sm font-medium text-typography-700 mb-2">
                                Programações existentes ({schedules.length})
                            </p>

                            <ul className="space-y-1 text-sm text-typography-600">
                                {previewSchedules?.map(s => (
                                    <li key={s.id}>
                                        {dayjs(s.date).format("DD/MM/YYYY")} - {s.leader.nickname || s.leader.fullName}
                                    </li>
                                ))}
                            </ul>

                            {schedules.length > 3 && (
                                <button
                                    className="mt-2 text-xs text-primary-200 underline"
                                    onClick={() => setShowAllSchedules(v => !v)}
                                >
                                    {showAllSchedules ? "Ver menos" : "Ver todas"}
                                </button>
                            )}
                        </div>
                    )}

                    <Button className="w-full mt-3" onClick={handleGenerate}>
                        Criar Programação
                    </Button>
                </CollapsibleCard>

                {/* Card para gerar PDF */}
                {congregation?.id && (
                    <CollapsibleCard title="Gerar PDF" defaultOpen={false}>
                        <FieldServicePdfDownload congregationId={congregation.id} />
                    </CollapsibleCard>
                )}
            </div>
        </ContentDashboard>
    )
}

FieldServiceSchedulePage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "FIELD_SERVICE_MANAGER",
])

export default FieldServiceSchedulePage
