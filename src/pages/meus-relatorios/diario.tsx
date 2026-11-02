import React, { useState, useEffect } from "react";
import ContentDashboard from "@/Components/ContentDashboard";
import BreadCrumbs from "@/Components/BreadCrumbs";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    BookOpen,
    Send,
    Edit3,
    Trash2,
    Award,
    FileSpreadsheet,
    ChevronLeft,
    ChevronRight,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/Components/ui/button";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";

import MinistryStopwatch from "@/Components/DailyMinistry/MinistryStopwatch";
import BibleStudentsManager from "@/Components/DailyMinistry/BibleStudentsManager";
import ActivityFormModal from "@/Components/DailyMinistry/ActivityFormModal";
import SubmitReportModal from "@/Components/DailyMinistry/SubmitReportModal";
import { IDailyMinistryMonthData, IPublisherBibleStudent, IPublisherFieldActivity } from "@/types/dailyMinistry";

dayjs.locale("pt-br");

const MONTHS_NAMES = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function DailyMinistryPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const [currentDate, setCurrentDate] = useState(dayjs());
    const [activeTab, setActiveTab] = useState<"diary" | "students">("diary");

    const [monthData, setMonthData] = useState<IDailyMinistryMonthData | null>(null);
    const [students, setStudents] = useState<IPublisherBibleStudent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modais
    const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
    const [initialMinutesForModal, setInitialMinutesForModal] = useState(0);
    const [activityToEdit, setActivityToEdit] = useState<IPublisherFieldActivity | null>(null);
    const [isSubmitReportModalOpen, setIsSubmitReportModalOpen] = useState(false);

    useEffect(() => {
        setPageActive("Diário do Ministério");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Meus Relatórios", link: "/meus-relatorios" }
        ]);
    }, [setPageActive, setCrumbs]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const year = currentDate.format("YYYY");
            const month = currentDate.format("MM");

            const [activitiesRes, studentsRes] = await Promise.all([
                api.get(`/daily-ministry/activities?year=${year}&month=${month}`),
                api.get("/daily-ministry/students")
            ]);

            setMonthData(activitiesRes.data);
            setStudents(studentsRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados do ministério:", error);
            toast.error("Erro ao carregar dados do ministério.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const handlePrevMonth = () => {
        setCurrentDate((prev) => prev.subtract(1, "month"));
    };

    const handleNextMonth = () => {
        setCurrentDate((prev) => prev.add(1, "month"));
    };

    const handleStopwatchFinish = (elapsedMinutes: number) => {
        setActivityToEdit(null);
        setInitialMinutesForModal(elapsedMinutes);
        setIsActivityModalOpen(true);
    };

    const handleDeleteActivity = async (id: string) => {
        try {
            await api.delete(`/daily-ministry/activities/${id}`);
            toast.success("Atividade removida com sucesso!");
            fetchData();
        } catch {
            toast.error("Erro ao remover atividade.");
        }
    };

    const formatMinutesToString = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        if (h === 0) return `${m}min`;
        if (m === 0) return `${h}h`;
        return `${h}h ${m}m`;
    };

    const monthIndex = parseInt(currentDate.format("MM"), 10) - 1;
    const currentMonthName = MONTHS_NAMES[monthIndex] || "";

    const summary = monthData?.summary || {
        transferredMinutesIn: 0,
        totalMinistryMinutes: 0,
        totalCreditMinutes: 0,
        totalMinutesOverall: 0,
        totalStudiesCount: 0
    };

    const isMonthClosed = Boolean(monthData?.balance?.is_closed);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Diário de Campo"} />

            <section className="flex flex-col flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-6 overflow-y-auto thin-scrollbar">
                {/* Header Principal */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface-100 p-5 rounded-2xl border border-surface-300 shadow-sm">
                    <div className="flex items-center gap-3.5">
                        <div className="p-3 bg-primary-200/10 text-primary-200 rounded-xl shrink-0 ring-1 ring-primary-200/20">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900 tracking-tight flex items-center gap-2">
                                Meu Ministério de Campo
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500 mt-0.5">
                                Anote suas horas, créditos e estudos ao longo do mês para enviar seu relatório com facilidade.
                            </p>
                        </div>
                    </div>

                    {/* Navegação de Mês */}
                    <div className="flex items-center gap-1.5 bg-surface-200/80 p-1 rounded-xl border border-surface-300 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePrevMonth}
                            className="h-8 w-8 text-typography-600 hover:text-typography-900 rounded-lg cursor-pointer"
                            title="Mês anterior"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        <span className="px-3 text-xs sm:text-sm font-bold text-typography-900 min-w-[130px] text-center select-none">
                            {currentMonthName} {currentDate.format("YYYY")}
                        </span>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleNextMonth}
                            className="h-8 w-8 text-typography-600 hover:text-typography-900 rounded-lg cursor-pointer"
                            title="Próximo mês"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Cronômetro de Ministério */}
                <MinistryStopwatch onFinish={handleStopwatchFinish} />

                {/* Cards de Resumo do Mês Atual */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-typography-500">
                            Tempo de Campo
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-typography-900 font-mono">
                            {formatMinutesToString(summary.totalMinistryMinutes)}
                        </span>
                        {summary.transferredMinutesIn > 0 && (
                            <span className="text-[10px] font-semibold text-emerald-600">
                                +{summary.transferredMinutesIn}m do mês anterior
                            </span>
                        )}
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-typography-500">
                            Crédito de Horas
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-amber-600 font-mono">
                            {formatMinutesToString(summary.totalCreditMinutes)}
                        </span>
                        <span className="text-[10px] text-typography-400">Atividades aprovadas</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-typography-500">
                            Total Geral
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-primary-200 font-mono">
                            {formatMinutesToString(summary.totalMinutesOverall)}
                        </span>
                        <span className="text-[10px] font-medium text-typography-500">
                            (~{Math.floor(summary.totalMinutesOverall / 60)}h oficiais)
                        </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs flex flex-col gap-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-typography-500">
                            Estudos Bíblicos
                        </span>
                        <span className="text-lg sm:text-2xl font-bold text-typography-900 font-mono">
                            {summary.totalStudiesCount}
                        </span>
                        <span className="text-[10px] text-typography-400">Pessoas atendidas</span>
                    </div>
                </div>

                {/* Banner de Ação de Fechamento / Envio do Relatório */}
                <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${
                    isMonthClosed
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                        : "bg-primary-200/5 border-primary-200/20 text-typography-800"
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                            isMonthClosed ? "bg-emerald-500/20 text-emerald-600" : "bg-primary-200/10 text-primary-200"
                        }`}>
                            {isMonthClosed ? <CheckCircle2 className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
                        </div>
                        <div>
                            <span className="text-sm font-bold block">
                                {isMonthClosed
                                    ? `Relatório de ${currentMonthName} já enviado!`
                                    : `Pronto para enviar seu relatório de ${currentMonthName}?`}
                            </span>
                            <span className="text-xs text-typography-500">
                                {isMonthClosed
                                    ? "Você pode reenviar a qualquer momento caso tenha feito novas atividades."
                                    : "Transfira ou arredonde os minutos e envie diretamente para o secretário da congregação."}
                            </span>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsSubmitReportModalOpen(true)}
                        className={`text-white font-semibold text-xs h-9 px-4 rounded-xl flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer ${
                            isMonthClosed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary-200 hover:opacity-90"
                        }`}
                    >
                        <Send className="w-4 h-4" />
                        <span>{isMonthClosed ? "Reenviar Relatório" : "Enviar Relatório"}</span>
                    </Button>
                </div>

                {/* Abas: Diário de Atividades vs Estudantes */}
                <div className="flex items-center gap-2 border-b border-surface-300 pb-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("diary")}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === "diary"
                                ? "bg-primary-200 text-white shadow-xs"
                                : "bg-surface-100 text-typography-600 hover:bg-surface-200 hover:text-typography-900 border border-surface-300"
                        }`}
                    >
                        <Clock className="w-4 h-4" />
                        <span>Atividades do Mês ({monthData?.activities?.length || 0})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("students")}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                            activeTab === "students"
                                ? "bg-primary-200 text-white shadow-xs"
                                : "bg-surface-100 text-typography-600 hover:bg-surface-200 hover:text-typography-900 border border-surface-300"
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Meus Estudantes ({students.length})</span>
                    </button>
                </div>

                {/* Conteúdo da Aba Ativa */}
                {activeTab === "diary" ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-typography-500 uppercase tracking-wider">
                                Registros em {currentMonthName}
                            </span>

                            <Button
                                onClick={() => {
                                    setActivityToEdit(null);
                                    setInitialMinutesForModal(0);
                                    setIsActivityModalOpen(true);
                                }}
                                className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs h-9 px-3.5 rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Anotar Atividade</span>
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-xs text-typography-400">
                                Carregando atividades...
                            </div>
                        ) : !monthData?.activities || monthData.activities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-surface-100 rounded-2xl border border-dashed border-surface-300 text-center gap-2">
                                <div className="p-3 bg-surface-200/60 rounded-full text-typography-400">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <span className="text-sm font-semibold text-typography-700">
                                    Nenhuma atividade anotada neste mês
                                </span>
                                <p className="text-xs text-typography-400 max-w-sm">
                                    Use o botão acima ou o cronômetro para começar a registrar seu tempo de campo.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2.5">
                                {monthData.activities.map((act) => (
                                    <div
                                        key={act.id}
                                        className="p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-2xs hover:border-primary-200/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-surface-200 border border-surface-300/80 shrink-0">
                                                <span className="text-[10px] font-bold text-typography-400 uppercase">
                                                    {dayjs(act.date).format("ddd")}
                                                </span>
                                                <span className="text-sm font-bold text-typography-900 leading-none">
                                                    {dayjs(act.date).format("DD")}
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {act.minutes > 0 && (
                                                        <span className="text-xs font-bold text-typography-900 bg-surface-200/70 px-2.5 py-0.5 rounded-md border border-surface-300/60">
                                                            ⏱️ {formatMinutesToString(act.minutes)} campo
                                                        </span>
                                                    )}

                                                    {act.credit_minutes > 0 && (
                                                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                                                            ⭐ +{formatMinutesToString(act.credit_minutes)} crédito ({act.credit_description})
                                                        </span>
                                                    )}

                                                    {act.bibleStudent && (
                                                        <span className="text-xs font-bold text-primary-200 bg-primary-200/10 px-2.5 py-0.5 rounded-md border border-primary-200/20">
                                                            📖 Estudo: {act.bibleStudent.name}
                                                        </span>
                                                    )}
                                                </div>

                                                {act.notes && (
                                                    <p className="text-xs text-typography-600 mt-1 italic">
                                                        "{act.notes}"
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActivityToEdit(act);
                                                    setIsActivityModalOpen(true);
                                                }}
                                                className="p-1.5 rounded-lg text-typography-400 hover:text-typography-900 hover:bg-surface-200 transition-colors cursor-pointer"
                                                title="Editar"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteActivity(act.id)}
                                                className="p-1.5 rounded-lg text-typography-400 hover:text-rose-500 hover:bg-surface-200 transition-colors cursor-pointer"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <BibleStudentsManager students={students} onRefresh={fetchData} />
                )}

                {/* Modais */}
                <ActivityFormModal
                    isOpen={isActivityModalOpen}
                    onClose={() => setIsActivityModalOpen(false)}
                    onSuccess={fetchData}
                    initialMinutes={initialMinutesForModal}
                    activityToEdit={activityToEdit}
                    students={students}
                />

                <SubmitReportModal
                    isOpen={isSubmitReportModalOpen}
                    onClose={() => setIsSubmitReportModalOpen(false)}
                    onSuccess={fetchData}
                    year={currentDate.format("YYYY")}
                    month={currentDate.format("MM")}
                    monthName={currentMonthName}
                    summary={summary}
                    activities={monthData?.activities || []}
                />
            </section>
        </ContentDashboard>
    );
}

DailyMinistryPage.getLayout = withProtectedLayout();

export default DailyMinistryPage;
