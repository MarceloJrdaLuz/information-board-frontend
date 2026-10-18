import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { generateCleaningScheduleAtom } from "@/atoms/cleaningScheduleAtoms";
import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import { CleaningExceptionsCard } from "@/Components/CleaningExceptionCard";
import { CleaningGroupUnavailabilitiesCard } from "@/Components/CleaningGroupUnavailabilitiesCard";
import CleaningScheduleConfigCard from "@/Components/CleaningScheduleConfigCard";
import CleaningSchedulePdf from "@/Components/CleaningSchedulePdf";
import CleaningScheduleTable from "@/Components/CleaningScheduleTable";
import ContentDashboard from "@/Components/ContentDashboard";
import CleanIcon from "@/Components/Icons/CleanIcon";
import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { api } from "@/services/api";
import { ICleaningScheduleResponse } from "@/types/cleaning";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider, Document } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom, useSetAtom } from "jotai";
import {
    CalendarOff,
    FileDown,
    Layers,
    Loader2,
    Settings2,
    Sparkles,
    UserX,
    Wand2
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

function CleaningSchedulePage() {
    const { congregation } = useCongregationContext();
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const generateCleaningSchedule = useSetAtom(generateCleaningScheduleAtom);

    const [startDate, setStartDate] = useState<string | null>(
        dayjs().startOf("month").format("YYYY-MM-DD")
    );
    const [endDate, setEndDate] = useState<string | null>(
        dayjs().endOf("month").format("YYYY-MM-DD")
    );
    const [schedule, setSchedule] = useState<ICleaningScheduleResponse>();
    const [generating, setGenerating] = useState(false);

    // Modais
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isExceptionsModalOpen, setIsExceptionsModalOpen] = useState(false);
    const [isUnavailabilitiesModalOpen, setIsUnavailabilitiesModalOpen] = useState(false);

    const urlSchedulesConfig = congregation
        ? `${API_ROUTES.CLEANING_SCHEDULES}/congregation/${congregation.id}`
        : "";
    const { data, mutate, isLoading } = useAuthorizedFetch<ICleaningScheduleResponse>(
        urlSchedulesConfig,
        {
            allowedRoles: ["ADMIN_CONGREGATION", "CLEANING_MANAGER"],
        }
    );

    useEffect(() => {
        setPageActive("Programação de Limpeza");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Congregação", link: "/congregacao" },
            { label: "Programação de Limpeza", link: "/congregacao/programacao-limpeza" },
            { label: "Início", link: "/dashboard" }
        ]);
    }, [setPageActive, setCrumbs]);

    useEffect(() => {
        if (data) {
            setSchedule(data);
            if (data?.schedules && data.schedules.length > 0) {
                const sortedDates = data.schedules
                    .map((s) => s.date)
                    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                const lastDate = dayjs(sortedDates[sortedDates.length - 1])
                    .add(1, "day")
                    .format("YYYY-MM-DD");
                setStartDate(lastDate);
                setEndDate(dayjs(lastDate).endOf("month").format("YYYY-MM-DD"));
            } else {
                setStartDate(dayjs().startOf("month").format("YYYY-MM-DD"));
                setEndDate(dayjs().endOf("month").format("YYYY-MM-DD"));
            }
        }
    }, [data]);

    const handleGenerateSchedule = async () => {
        if (!congregation || !startDate || !endDate) return;
        setGenerating(true);
        try {
            await generateCleaningSchedule(congregation.id, {
                start: startDate,
                end: endDate,
            });
            setIsGenerateModalOpen(false);
            await mutate();
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        try {
            await api.delete(`${API_ROUTES.CLEANING_SCHEDULES}/${id}`);
            toast.success("Data de limpeza excluída!");
            await mutate();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao excluir data da limpeza.");
        }
    };

    const totalWeeks = schedule?.schedules?.length || 0;

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Programação de Limpeza"} />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Cabeçalho Principal com Métricas (Estilo Oradores) */}
                <div className="flex flex-col gap-4 p-5 sm:p-6 bg-surface-100 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-primary-200/10 text-primary-200">
                                    <CleanIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-typography-800">
                                        Programação de Limpeza
                                    </h1>
                                    <p className="text-xs sm:text-sm text-typography-500">
                                        Escala e rodízio dos grupos de limpeza do Salão do Reino.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                onClick={() => setIsGenerateModalOpen(true)}
                                className="gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl shadow-sm text-xs font-semibold"
                            >
                                <Wand2 className="w-4 h-4" />
                                <span>Gerar Programação</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsUnavailabilitiesModalOpen(true)}
                                className="gap-1.5 rounded-xl text-xs font-medium"
                            >
                                <UserX className="w-4 h-4 text-amber-500" />
                                <span>Indisponibilidades</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsConfigModalOpen(true)}
                                className="gap-1.5 rounded-xl text-xs font-medium"
                            >
                                <Settings2 className="w-4 h-4" />
                                <span>Configurações</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => setIsExceptionsModalOpen(true)}
                                className="gap-1.5 rounded-xl text-xs font-medium"
                            >
                                <CalendarOff className="w-4 h-4 text-rose-500" />
                                <span>Exceções</span>
                            </Button>

                            {schedule && schedule?.schedules && schedule.schedules.length > 0 && (
                                <BlobProvider
                                    document={
                                        <Document>
                                            <CleaningSchedulePdf
                                                schedule={schedule}
                                                congregationName={congregation?.name}
                                            />
                                        </Document>
                                    }
                                >
                                    {({ blob, url, loading, error }) => (
                                        <a
                                            href={url || "#"}
                                            download={url ? `Programacao_da_Limpeza_${congregation?.name || ""}.pdf` : undefined}
                                            className={loading || !!error || !blob ? "pointer-events-none opacity-50" : ""}
                                        >
                                            <Button
                                                variant="outline"
                                                className="gap-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl text-xs font-medium"
                                                disabled={loading || !!error || !blob}
                                            >
                                                <FileDown className="w-4 h-4" />
                                                <span>{loading ? "Gerando..." : "Exportar PDF"}</span>
                                            </Button>
                                        </a>
                                    )}
                                </BlobProvider>
                            )}
                        </div>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 shrink-0">
                                <Layers className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Datas Programadas</div>
                                <div className="text-base font-bold text-typography-900">
                                    {isLoading || !data ? (
                                        <span className="inline-block h-4 w-7 rounded bg-surface-300/70 animate-pulse align-middle" />
                                    ) : (
                                        totalWeeks
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo: Tabela de Limpeza ou Estado Vazio */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                        <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                        <p className="text-sm text-typography-500">
                            Carregando programação da limpeza...
                        </p>
                    </div>
                ) : !schedule?.schedules || schedule.schedules.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center">
                        <CleanIcon className="w-12 h-12 text-typography-400 mb-3" />
                        <h3 className="text-base font-semibold text-typography-700">
                            Nenhuma programação de limpeza gerada
                        </h3>
                        <p className="text-sm text-typography-500 mt-1 max-w-md">
                            Configure os grupos e gere a programação semanal de limpeza do Salão.
                        </p>
                        <Button
                            onClick={() => setIsGenerateModalOpen(true)}
                            className="mt-6 gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl"
                        >
                            <Wand2 className="w-4 h-4" />
                            <span>Gerar Programação</span>
                        </Button>
                    </div>
                ) : (
                    <CleaningScheduleTable
                        schedule={schedule}
                        onDelete={handleDeleteSchedule}
                        onScheduleUpdated={() => { mutate(); }}
                    />
                )}
            </div>

            {/* Modal: Gerar Programação */}
            <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
                <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <Sparkles className="w-5 h-5 text-primary-200" />
                            <span>Gerar Programação de Limpeza</span>
                        </DialogTitle>
                        <DialogDescription>
                            Selecione o período inicial e final para distribuir os grupos nas semanas.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-3">
                        <Calendar
                            label="Data Inicial"
                            selectedDate={startDate}
                            handleDateChange={setStartDate}
                            full
                        />
                        <Calendar
                            label="Data Final"
                            selectedDate={endDate}
                            handleDateChange={setEndDate}
                            minDate={startDate}
                            full
                        />
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsGenerateModalOpen(false)}
                            disabled={generating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleGenerateSchedule}
                            disabled={generating || !startDate || !endDate}
                            className="bg-primary-200 hover:bg-primary-300 text-white gap-2"
                        >
                            {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                            <span>{generating ? "Gerando..." : "Gerar Programação"}</span>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Modal: Configurações de Limpeza */}
            <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <Settings2 className="w-5 h-5 text-primary-200" />
                            <span>Configurações de Limpeza</span>
                        </DialogTitle>
                        <DialogDescription>
                            Ajuste as preferências e regras de rodízio da limpeza.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <CleaningScheduleConfigCard />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Exceções de Limpeza */}
            <Dialog open={isExceptionsModalOpen} onOpenChange={setIsExceptionsModalOpen}>
                <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <CalendarOff className="w-5 h-5 text-rose-500" />
                            <span>Datas sem Limpeza (Exceções)</span>
                        </DialogTitle>
                        <DialogDescription>
                            Datas cadastradas aqui serão desconsideradas no rodízio.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <CleaningExceptionsCard />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal: Indisponibilidades de Grupos */}
            <Dialog open={isUnavailabilitiesModalOpen} onOpenChange={setIsUnavailabilitiesModalOpen}>
                <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto p-4 sm:p-6">
                    <CleaningGroupUnavailabilitiesCard />
                </DialogContent>
            </Dialog>
        </ContentDashboard>
    );
}

CleaningSchedulePage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "CLEANING_MANAGER",
]);

export default CleaningSchedulePage;
