import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { MidweekCustomPartModal } from "@/Components/Midweek/MidweekCustomPartModal";
import { MidweekMonthSchedulePdfModal } from "@/Components/Midweek/MidweekMonthSchedulePdf";
import { MidweekS89PdfModal } from "@/Components/Midweek/MidweekS89Pdf";
import { MidweekSectionLiving } from "@/Components/Midweek/MidweekSectionLiving";
import { MidweekSectionMinistry } from "@/Components/Midweek/MidweekSectionMinistry";
import { MidweekSectionTreasures } from "@/Components/Midweek/MidweekSectionTreasures";
import { MidweekSpecialWeekModal } from "@/Components/Midweek/MidweekSpecialWeekModal";
import { MidweekUploadXmlModal } from "@/Components/Midweek/MidweekUploadXmlModal";
import { MidweekWeekHeader } from "@/Components/Midweek/MidweekWeekHeader";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import {
    IMidweekMeetingPart,
    IMidweekSchedule,
    MidweekRoom,
    MidweekSection,
    MidweekSpecialType
} from "@/types/midweek";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import {
    Calendar as CalendarIcon,
    CalendarOff,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    FileText,
    Loader2,
    Printer,
    Sparkles,
    UploadCloud,
    Users,
    Wand2
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const MONTH_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function MidweekScheduleAssistantPage() {
    const router = useRouter();
    const { user } = useAuthContext();
    const congregationId = user?.congregation?.id;

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const now = new Date();
    const [year, setYear] = useState<number>(now.getFullYear());
    const [month, setMonth] = useState<number>(now.getMonth() + 1);

    const [schedules, setSchedules] = useState<IMidweekSchedule[]>([]);
    const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoAssigning, setAutoAssigning] = useState(false);

    // Modais
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isCustomPartModalOpen, setIsCustomPartModalOpen] = useState(false);
    const [isSpecialWeekModalOpen, setIsSpecialWeekModalOpen] = useState(false);
    const [isS89ModalOpen, setIsS89ModalOpen] = useState(false);
    const [isPrintMonthModalOpen, setIsPrintMonthModalOpen] = useState(false);

    useEffect(() => {
        setPageActive("Programação do Meio de Semana");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Reuniões", link: "/reunioes/programacao-meiodesemana" }
        ]);
    }, [setPageActive, setCrumbs]);

    const fetchSchedules = async () => {
        if (!congregationId) return;
        setLoading(true);
        try {
            const res = await api.get(
                `/midweek/schedules/congregation/${congregationId}?year=${year}&month=${month}`
            );
            setSchedules(res.data);
            if (res.data && res.data.length > 0) {
                if (!selectedScheduleId || !res.data.some((s: IMidweekSchedule) => s.id === selectedScheduleId)) {
                    setSelectedScheduleId(res.data[0].id);
                }
            } else {
                setSelectedScheduleId(null);
            }
        } catch (error) {
            console.error("Erro ao carregar programação:", error);
            toast.error("Erro ao carregar programação de meio de semana.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchedules();
    }, [congregationId, year, month]);

    const handlePrevMonth = () => {
        if (month === 1) {
            setMonth(12);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    const handleNextMonth = () => {
        if (month === 12) {
            setMonth(1);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const handleUpdateSchedule = async (data: Partial<IMidweekSchedule>) => {
        if (!currentSchedule || !congregationId) return;
        try {
            const res = await api.patch(
                `/midweek/schedules/${currentSchedule.id}/congregation/${congregationId}`,
                data
            );
            setSchedules(prev => prev.map(s => s.id === currentSchedule.id ? res.data : s));
            toast.success("Programação atualizada!");
        } catch (error) {
            toast.error("Erro ao atualizar programação.");
        }
    };

    const handleUpdatePart = async (partId: string, data: Partial<IMidweekMeetingPart>) => {
        if (!currentSchedule || !congregationId) return;
        try {
            const res = await api.patch(
                `/midweek/parts/${partId}/congregation/${congregationId}`,
                data
            );
            setSchedules(prev => prev.map(s => {
                if (s.id === currentSchedule.id) {
                    return {
                        ...s,
                        parts: s.parts.map(p => p.id === partId ? res.data : p)
                    };
                }
                return s;
            }));
        } catch (error) {
            toast.error("Erro ao atualizar designação.");
        }
    };

    const handleDuplicateRoom = async (targetRoom: MidweekRoom) => {
        if (!currentSchedule || !congregationId) return;
        try {
            await api.post(
                `/midweek/schedules/${currentSchedule.id}/rooms/${targetRoom}/duplicate/congregation/${congregationId}`
            );
            await fetchSchedules();
            toast.success("Sala auxiliar duplicada com sucesso!");
        } catch (error) {
            toast.error("Erro ao duplicar sala auxiliar.");
        }
    };

    const handleAddCustomPart = async (data: {
        title: string;
        timeMinutes: number;
        method?: string;
        assigned_publisher_id?: string;
    }) => {
        if (!currentSchedule || !congregationId) return;
        try {
            const res = await api.post(
                `/midweek/schedules/${currentSchedule.id}/custom-part/congregation/${congregationId}`,
                data
            );
            setSchedules(prev => prev.map(s => {
                if (s.id === currentSchedule.id) {
                    return {
                        ...s,
                        parts: [...s.parts, res.data]
                    };
                }
                return s;
            }));
            toast.success("Parte personalizada adicionada!");
            setIsCustomPartModalOpen(false);
        } catch (error) {
            toast.error("Erro ao adicionar parte.");
        }
    };

    const handleDeletePart = async (partId: string) => {
        if (!currentSchedule || !congregationId) return;
        try {
            await api.delete(`/midweek/parts/${partId}/congregation/${congregationId}`);
            setSchedules(prev => prev.map(s => {
                if (s.id === currentSchedule.id) {
                    return {
                        ...s,
                        parts: s.parts.filter(p => p.id !== partId)
                    };
                }
                return s;
            }));
            toast.success("Parte removida.");
        } catch (error) {
            toast.error("Erro ao remover parte.");
        }
    };

    const handleAutoAssignSchedule = async () => {
        if (!currentSchedule || !congregationId) return;
        setAutoAssigning(true);
        try {
            const res = await api.post(
                `/midweek/schedules/${currentSchedule.id}/auto-assign/congregation/${congregationId}`,
                { chairmanPrays: true }
            );
            setSchedules(prev => prev.map(s => s.id === currentSchedule.id ? res.data : s));
            toast.success("Designações preenchidas automaticamente!");
        } catch (error) {
            toast.error("Erro no preenchimento automático.");
        } finally {
            setAutoAssigning(false);
        }
    };

    const handleAutoAssignMonth = async () => {
        if (!congregationId) return;
        setAutoAssigning(true);
        try {
            const res = await api.post(
                `/midweek/schedules/month-auto-assign/congregation/${congregationId}`,
                { year, month, chairmanPrays: true }
            );
            setSchedules(res.data);
            toast.success("Mês inteiro preenchido automaticamente com sucesso!");
        } catch (error) {
            toast.error("Erro no preenchimento automático do mês.");
        } finally {
            setAutoAssigning(false);
        }
    };

    const currentSchedule = schedules.find(s => s.id === selectedScheduleId);

    // Verifica se a reunião normal foi cancelada por evento (Assembleia, Congresso, Celebração)
    const isCancelledMeeting = currentSchedule?.isSpecial && (
        currentSchedule.specialType === MidweekSpecialType.CIRCUIT_ASSEMBLY ||
        currentSchedule.specialType === MidweekSpecialType.REGIONAL_CONVENTION ||
        currentSchedule.specialType === MidweekSpecialType.MEMORIAL
    );

    const currentTreasuresParts = currentSchedule?.parts?.filter(p => p.section === MidweekSection.TREASURES && p.isActive) || [];
    const currentMinistryParts = currentSchedule?.parts?.filter(p => p.section === MidweekSection.MINISTRY && p.isActive) || [];
    const currentLivingParts = currentSchedule?.parts?.filter(p => p.section === MidweekSection.LIVING && p.isActive) || [];

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Programação do Meio de Semana"} />

            <div className="flex flex-col gap-5 w-full max-w-7xl mx-auto p-4 sm:p-6">
                {/* Barra Superior de Controles e Ações */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-100 p-4 rounded-xl border border-surface-300 shadow-sm">
                    {/* Seletor de Mês e Ano */}
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-9 w-9 border-surface-300 hover:bg-surface-200">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-200 rounded-lg">
                            <CalendarIcon className="h-4 w-4 text-primary-200" />
                            <span className="font-bold text-sm text-typography-900">
                                {MONTH_NAMES[month - 1]} de {year}
                            </span>
                        </div>

                        <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-9 w-9 border-surface-300 hover:bg-surface-200">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-800"
                        >
                            <UploadCloud className="h-4 w-4 text-primary-200" />
                            <span>Importar XML</span>
                        </Button>

                        <Button
                            size="sm"
                            onClick={handleAutoAssignSchedule}
                            disabled={autoAssigning || !currentSchedule || isCancelledMeeting}
                            className="text-xs bg-primary-200 hover:opacity-90 text-white font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                        >
                            {autoAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                            <span>Auto-Preencher Semana</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleAutoAssignMonth}
                            disabled={autoAssigning || schedules.length === 0}
                            className="text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-800"
                        >
                            <Sparkles className="h-4 w-4 text-purple-500" />
                            <span>Auto-Preencher Mês</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsS89ModalOpen(true)}
                            disabled={!currentSchedule || isCancelledMeeting}
                            className="text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-800 disabled:opacity-50"
                        >
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span>Folhas S-89</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsPrintMonthModalOpen(true)}
                            disabled={schedules.length === 0}
                            className="text-xs flex items-center gap-1.5 border-surface-300 hover:bg-surface-200 text-typography-800"
                        >
                            <Printer className="h-4 w-4 text-emerald-500" />
                            <span>Imprimir Quadro</span>
                        </Button>

                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push("/reunioes/programacao-meiodesemana/qualificacoes")}
                            className="text-xs flex items-center gap-1.5 text-typography-700 hover:bg-surface-200"
                        >
                            <Users className="h-4 w-4" />
                            <span>Qualificações</span>
                        </Button>
                    </div>
                </div>

                {/* Abas das Semanas do Mês */}
                {schedules.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {schedules.map((s) => {
                            const isSelected = s.id === selectedScheduleId;
                            const weekDay = dayjs(s.meetingDate || s.weekDate).format("DD/MM");
                            const isWeekCancelled = s.isSpecial && (
                                s.specialType === MidweekSpecialType.CIRCUIT_ASSEMBLY ||
                                s.specialType === MidweekSpecialType.REGIONAL_CONVENTION ||
                                s.specialType === MidweekSpecialType.MEMORIAL
                            );
                            const isCompleted = isWeekCancelled || (
                                Boolean(s.parts && s.parts.length > 0) &&
                                s.parts.every(p => !p.isActive || Boolean(p.assigned_publisher_id)) &&
                                Boolean(s.chairman_id)
                            );

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => setSelectedScheduleId(s.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                                        isSelected
                                            ? "bg-primary-200 text-white shadow-md font-bold"
                                            : "bg-surface-100 text-typography-700 border border-surface-300 hover:bg-surface-200"
                                    }`}
                                >
                                    <span>Semana de {weekDay}</span>
                                    {isCompleted && (
                                        <CheckCircle2 className={`h-3.5 w-3.5 ${isSelected ? "text-white" : "text-emerald-500"}`} />
                                    )}
                                    {s.isSpecial && (
                                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                            isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                        }`}>
                                            {isWeekCancelled ? "Evento" : "Especial"}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Conteúdo Principal da Semana */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-typography-500">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-200" />
                        <span className="text-xs">Carregando programação da apostila...</span>
                    </div>
                ) : schedules.length === 0 ? (
                    <div className="py-16 text-center bg-surface-100 rounded-xl border border-surface-300 p-8 flex flex-col items-center gap-3">
                        <UploadCloud className="h-12 w-12 text-primary-200" />
                        <h3 className="font-bold text-base text-typography-900">
                            Nenhuma semana encontrada para este mês
                        </h3>
                        <p className="text-xs text-typography-500 max-w-md">
                            Importe o arquivo XML da apostila para que as semanas e partes sejam cadastradas automaticamente para a congregação.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => setIsUploadModalOpen(true)}
                            className="mt-2 bg-primary-200 hover:opacity-90 text-white text-xs font-semibold flex items-center gap-2"
                        >
                            <UploadCloud className="h-4 w-4" />
                            Importar Arquivo XML da Apostila
                        </Button>
                    </div>
                ) : currentSchedule && isCancelledMeeting ? (
                    /* Banner de Semana Especial sem Reunião Regular */
                    <div className="flex flex-col items-center justify-center p-12 bg-surface-100 rounded-xl border border-surface-300 text-center gap-4 shadow-sm">
                        <div className="p-4 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full">
                            <CalendarOff className="h-10 w-10" />
                        </div>
                        <div className="max-w-lg flex flex-col gap-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                                Evento Especial da Semana
                            </span>
                            <h3 className="text-xl font-bold text-typography-900">
                                {currentSchedule.specialName || "Semana de Evento Especial"}
                            </h3>
                            <p className="text-xs text-typography-500 leading-relaxed mt-1">
                                Não haverá reunião de meio de semana normal na congregação nesta semana. Todas as designações regulares estão suspensas para que os irmãos possam participar do evento.
                            </p>
                            {currentSchedule.notes && (
                                <div className="text-xs text-typography-800 bg-surface-200/70 p-3.5 rounded-xl border border-surface-300 mt-2 text-left whitespace-pre-line leading-relaxed">
                                    <strong className="block font-bold text-typography-900 mb-1">Informações / Observações do Evento:</strong>
                                    {currentSchedule.notes}
                                </div>
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsSpecialWeekModalOpen(true)}
                            className="mt-2 text-xs border-surface-300 text-typography-700 hover:bg-surface-200"
                        >
                            Alterar Configuração do Evento
                        </Button>
                    </div>
                ) : currentSchedule ? (
                    <div className="flex flex-col gap-6">
                        {/* Cabeçalho da Semana (Presidente, Orações, Conselheiros, Cânticos) */}
                        <MidweekWeekHeader
                            schedule={currentSchedule}
                            onUpdateSchedule={handleUpdateSchedule}
                            onOpenSpecialWeekModal={() => setIsSpecialWeekModalOpen(true)}
                        />

                        {/* Seção 1: Tesouros da Palavra de Deus */}
                        <MidweekSectionTreasures
                            parts={currentTreasuresParts}
                            onUpdatePart={handleUpdatePart}
                        />

                        {/* Seção 2: Faça Seu Melhor no Ministério */}
                        <MidweekSectionMinistry
                            parts={currentMinistryParts}
                            onUpdatePart={handleUpdatePart}
                            onDuplicateRoom={handleDuplicateRoom}
                        />

                        {/* Seção 3: Nossa Vida Cristã */}
                        <MidweekSectionLiving
                            schedule={currentSchedule}
                            parts={currentLivingParts}
                            onUpdateSchedule={handleUpdateSchedule}
                            onUpdatePart={handleUpdatePart}
                            onAddCustomPart={handleAddCustomPart}
                            onDeletePart={handleDeletePart}
                            onOpenCustomPartModal={() => setIsCustomPartModalOpen(true)}
                        />
                    </div>
                ) : null}
            </div>

            {/* Modais */}
            <MidweekUploadXmlModal
                open={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={fetchSchedules}
            />

            <MidweekCustomPartModal
                open={isCustomPartModalOpen}
                onClose={() => setIsCustomPartModalOpen(false)}
                onCreate={handleAddCustomPart}
            />

            {currentSchedule && (
                <>
                    <MidweekSpecialWeekModal
                        open={isSpecialWeekModalOpen}
                        onClose={() => setIsSpecialWeekModalOpen(false)}
                        schedule={currentSchedule}
                        onSave={handleUpdateSchedule}
                    />

                    <MidweekS89PdfModal
                        open={isS89ModalOpen}
                        onClose={() => setIsS89ModalOpen(false)}
                        schedule={currentSchedule}
                    />
                </>
            )}

            {schedules.length > 0 && (
                <MidweekMonthSchedulePdfModal
                    open={isPrintMonthModalOpen}
                    onClose={() => setIsPrintMonthModalOpen(false)}
                    schedules={schedules}
                    year={year}
                    month={month}
                    congregationName={user?.congregation?.name}
                />
            )}
        </ContentDashboard>
    );
}

MidweekScheduleAssistantPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "DOCUMENTS_MANAGER",
    "MIDWEEK_MANAGER"
]);

export default MidweekScheduleAssistantPage;
