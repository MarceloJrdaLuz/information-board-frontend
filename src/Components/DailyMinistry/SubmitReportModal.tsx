import React, { useState, useEffect, useMemo } from "react";
import { Send, CheckCircle2, Clock, BookOpen, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { IDailyMinistrySummary, IPublisherFieldActivity } from "@/types/dailyMinistry";
import { api } from "@/services/api";
import { toast } from "react-toastify";

interface SubmitReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    year: string;
    month: string;
    monthName: string;
    summary: IDailyMinistrySummary;
    activities: IPublisherFieldActivity[];
    isUpdate?: boolean;
    submittedReport?: {
        id?: string;
        hours: number;
        studies?: number;
        observations?: string;
    } | null;
}

export default function SubmitReportModal({
    isOpen,
    onClose,
    onSuccess,
    year,
    month,
    monthName,
    summary,
    activities,
    isUpdate = false,
    submittedReport = null
}: SubmitReportModalProps) {
    // Horas de relatório: exclusivamente tempo de campo + saldo herdado do mês anterior
    const ministryMinutesTotal = (summary.totalMinistryMinutes || 0) + (summary.transferredMinutesIn || 0);
    const baseHours = Math.floor(ministryMinutesTotal / 60);
    const leftoverMinutes = ministryMinutesTotal % 60;

    const [minutesHandling, setMinutesHandling] = useState<"transfer" | "round_up" | "round_down">(
        leftoverMinutes > 0 ? "transfer" : "round_down"
    );
    const [finalHours, setFinalHours] = useState(baseHours);
    const [finalStudies, setFinalStudies] = useState(summary.totalStudiesCount || 0);
    const [observations, setObservations] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Estudantes que tiveram estudos realizados pelo menos uma vez no mês
    const studentsWithStudies: string[] = useMemo(() => {
        const set = new Set<string>();
        activities.forEach((act) => {
            if (act.bibleStudents && Array.isArray(act.bibleStudents)) {
                act.bibleStudents.forEach((s) => {
                    if (s?.name) set.add(s.name);
                });
            } else if (act.bibleStudent?.name) {
                set.add(act.bibleStudent.name);
            }
        });
        return Array.from(set);
    }, [activities]);

    // Ajusta as horas finais com base na escolha de minutos
    useEffect(() => {
        if (minutesHandling === "round_up") {
            setFinalHours(baseHours + (leftoverMinutes > 0 ? 1 : 0));
        } else {
            setFinalHours(baseHours);
        }
    }, [minutesHandling, baseHours, leftoverMinutes]);

    // Montar observações sugeridas automaticamente com os créditos
    useEffect(() => {
        const credits = activities
            .filter((a) => (a.credit_minutes || 0) > 0 && a.credit_description)
            .map((a) => {
                const h = Math.floor((a.credit_minutes || 0) / 60);
                const m = (a.credit_minutes || 0) % 60;
                const timeStr = `${h > 0 ? `${h}h` : ""}${m > 0 ? `${m}m` : ""}` || `${a.credit_minutes}m`;
                return `Crédito de horas: ${timeStr} (${a.credit_description})`;
            });

        const uniqueCredits = Array.from(new Set(credits)).join("; ");
        setObservations(uniqueCredits);
        setFinalStudies(summary.totalStudiesCount || 0);
    }, [activities, summary]);

    const handleConfirmSubmit = async () => {
        setSubmitting(true);
        try {
            await api.post("/daily-ministry/submit-report", {
                year,
                month,
                hours: finalHours,
                studies: finalStudies,
                observations: observations.trim() || null,
                minutesHandling,
                leftoverMinutes
            });

            toast.success(
                isUpdate
                    ? "Relatório de serviço atualizado com sucesso!"
                    : "Relatório de serviço enviado com sucesso para a congregação!"
            );
            onSuccess();
            onClose();
        } catch {
            toast.error(isUpdate ? "Erro ao atualizar relatório." : "Erro ao enviar relatório.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md w-[calc(100vw-24px)] sm:w-full bg-surface-100 border border-surface-300 p-4 sm:p-5 rounded-2xl max-h-[92dvh] overflow-y-auto thin-scrollbar">
                <DialogHeader className="pb-3 border-b border-surface-300">
                    <DialogTitle className="text-sm sm:text-base font-bold text-typography-900 flex items-center gap-2">
                        {isUpdate ? (
                            <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                            <Send className="w-5 h-5 text-primary-200 shrink-0" />
                        )}
                        <span>{isUpdate ? "Atualizar Relatório" : "Enviar Relatório"} de {monthName} / {year}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 mt-3">
                    {/* Aviso de relatório existente na congregação */}
                    {isUpdate && submittedReport && (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs flex items-start gap-2.5">
                            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                            <div className="leading-relaxed">
                                <strong className="block font-semibold">Relatório já registrado na congregação:</strong>
                                <span>
                                    Atualmente com {submittedReport.hours}h de campo
                                    {submittedReport.studies ? `, ${submittedReport.studies} estudo(s)` : ""}
                                    {submittedReport.observations ? ` • Obs: "${submittedReport.observations}"` : ""}.
                                    Ao confirmar, os totais serão atualizados para o secretário.
                                </span>
                            </div>
                        </div>
                    )}
                    {/* Resumo do Tempo Calculado */}
                    <div className="p-3.5 rounded-xl bg-surface-200/50 border border-surface-300/80 flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-typography-600">
                            <span>Tempo de campo anotado:</span>
                            <span className="font-bold text-typography-900 font-mono">
                                {Math.floor(summary.totalMinistryMinutes / 60)}h {summary.totalMinistryMinutes % 60}m
                            </span>
                        </div>
                        {summary.transferredMinutesIn > 0 && (
                            <div className="flex items-center justify-between text-xs font-semibold text-typography-600">
                                <span>Saldo vindo do mês anterior:</span>
                                <span className="font-bold text-emerald-600 font-mono">+{summary.transferredMinutesIn}m</span>
                            </div>
                        )}
                        <div className="pt-2 border-t border-surface-300 flex items-center justify-between">
                            <span className="text-xs font-bold text-typography-900">Total de horas para relatório:</span>
                            <span className="text-sm font-bold text-primary-200 font-mono">
                                {baseHours}h {leftoverMinutes > 0 ? `e ${leftoverMinutes}m` : ""}
                            </span>
                        </div>

                        {summary.totalCreditMinutes > 0 && (
                            <div className="mt-1 pt-2 border-t border-amber-500/20 flex flex-col gap-0.5 text-xs">
                                <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-semibold">
                                    <span>Crédito de atividades aprovadas:</span>
                                    <span className="font-bold font-mono">
                                        +{Math.floor(summary.totalCreditMinutes / 60)}h {summary.totalCreditMinutes % 60}m
                                    </span>
                                </div>
                                <span className="text-[10px] text-typography-500 italic">
                                    * Não soma nas horas do relatório; vai automaticamente para as observações abaixo.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Escolha do tratamento de minutos (se houver minutos fracionados) */}
                    {leftoverMinutes > 0 ? (
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-typography-800">
                                O que fazer com os {leftoverMinutes} minutos restantes?
                            </label>

                            <div className="flex flex-col gap-2">
                                <label
                                    onClick={() => setMinutesHandling("transfer")}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        minutesHandling === "transfer"
                                            ? "bg-primary-200/10 border-primary-200 text-typography-900"
                                            : "bg-surface-100 border-surface-300 text-typography-700 hover:bg-surface-200/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="minutesHandling"
                                        checked={minutesHandling === "transfer"}
                                        onChange={() => setMinutesHandling("transfer")}
                                        className="mt-0.5"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-typography-900">
                                            Transferir para o próximo mês (Recomendado)
                                        </span>
                                        <span className="text-[11px] text-typography-500 mt-0.5">
                                            Relatar <strong>{baseHours}h</strong> agora e transferir automaticamente {leftoverMinutes}min para o início do próximo mês.
                                        </span>
                                    </div>
                                </label>

                                <label
                                    onClick={() => setMinutesHandling("round_up")}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        minutesHandling === "round_up"
                                            ? "bg-primary-200/10 border-primary-200 text-typography-900"
                                            : "bg-surface-100 border-surface-300 text-typography-700 hover:bg-surface-200/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="minutesHandling"
                                        checked={minutesHandling === "round_up"}
                                        onChange={() => setMinutesHandling("round_up")}
                                        className="mt-0.5"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-typography-900">
                                            Arredondar para cima
                                        </span>
                                        <span className="text-[11px] text-typography-500 mt-0.5">
                                            Relatar <strong>{baseHours + 1}h</strong> sem transferir saldo para o próximo mês.
                                        </span>
                                    </div>
                                </label>

                                <label
                                    onClick={() => setMinutesHandling("round_down")}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                        minutesHandling === "round_down"
                                            ? "bg-primary-200/10 border-primary-200 text-typography-900"
                                            : "bg-surface-100 border-surface-300 text-typography-700 hover:bg-surface-200/50"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="minutesHandling"
                                        checked={minutesHandling === "round_down"}
                                        onChange={() => setMinutesHandling("round_down")}
                                        className="mt-0.5"
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-typography-900">
                                            Arredondar para baixo
                                        </span>
                                        <span className="text-[11px] text-typography-500 mt-0.5">
                                            Relatar <strong>{baseHours}h</strong> e descartar os {leftoverMinutes} minutos restantes.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    ) : null}

                    {/* Confirmação dos Dados do Relatório Oficial */}
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-300">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-typography-800">
                                Horas a Enviar *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={finalHours}
                                onChange={(e) => setFinalHours(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="w-full px-3 py-2 text-sm rounded-xl bg-surface-200/70 border border-surface-300 text-typography-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary-200/20"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-typography-800">
                                Estudos Bíblicos *
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={finalStudies}
                                onChange={(e) => setFinalStudies(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="w-full px-3 py-2 text-sm rounded-xl bg-surface-200/70 border border-surface-300 text-typography-900 text-center font-bold focus:outline-none focus:ring-2 focus:ring-primary-200/20"
                            />
                            <span className="text-[10px] text-typography-400 text-center">
                                Estudantes diferentes no mês
                            </span>
                        </div>
                    </div>

                    {/* Lista visual dos estudantes com estudos realizados */}
                    {studentsWithStudies.length > 0 && (
                        <div className="p-3 rounded-xl bg-surface-200/50 border border-surface-300 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-typography-600 uppercase tracking-wider flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-primary-200" />
                                Estudos realizados no mês ({studentsWithStudies.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {studentsWithStudies.map((name) => (
                                    <span
                                        key={name}
                                        className="px-2.5 py-1 rounded-lg bg-surface-100 border border-surface-300 text-[11px] font-semibold text-typography-800 flex items-center gap-1 shadow-2xs"
                                    >
                                        <span>📖</span>
                                        <span>{name}</span>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Observações */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-typography-800">
                            Observações do Relatório <span className="text-typography-400 font-normal">(créditos etc.)</span>
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Crédito de horas, justificativas..."
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                            className="w-full p-2.5 text-xs rounded-xl bg-surface-200/70 border border-surface-300 text-typography-900 focus:outline-none focus:ring-2 focus:ring-primary-200/20 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter className="pt-4 border-t border-surface-300 gap-2 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="text-xs border-surface-300 hover:bg-surface-200"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        disabled={submitting}
                        onClick={handleConfirmSubmit}
                        className="bg-primary-200 hover:bg-primary-150 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                        {isUpdate ? <RefreshCw className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span>
                            {submitting
                                ? "Salvando..."
                                : isUpdate
                                ? "Atualizar Relatório"
                                : "Confirmar e Enviar"}
                        </span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

