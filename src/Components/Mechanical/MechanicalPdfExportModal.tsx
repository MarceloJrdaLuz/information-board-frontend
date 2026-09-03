import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/Components/ui/dialog";
import { api } from "@/services/api";
import { IMechanicalConfig, IMechanicalMonthResponse, IMechanicalWeek } from "@/types/mechanical";
import { BlobProvider } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { CalendarRange, Check, Download, FileText, Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MechanicalSchedulePdf } from "./MechanicalSchedulePdf";

interface MechanicalPdfExportModalProps {
    open: boolean;
    onClose: () => void;
    congregationId: string;
    congregationName?: string;
    initialYear: number;
    initialMonth: number;
    config: IMechanicalConfig | null;
}

const MONTH_OPTIONS = [
    { count: 1, label: "1 Mês", desc: "Apenas o mês atual selecionado" },
    { count: 2, label: "2 Meses", desc: "Dois meses consecutivos" },
    { count: 3, label: "3 Meses (Recomendado)", desc: "Preenche perfeitamente 1 folha A4 vertical" },
    { count: 4, label: "4 Meses", desc: "Quatro meses em folha compacta" }
];

export const MechanicalPdfExportModal: React.FC<MechanicalPdfExportModalProps> = ({
    open,
    onClose,
    congregationId,
    congregationName,
    initialYear,
    initialMonth,
    config
}) => {
    const [monthsCount, setMonthsCount] = useState<number>(3);
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [weeks, setWeeks] = useState<IMechanicalWeek[]>([]);
    const [monthFormatted, setMonthFormatted] = useState<string>("");

    const fetchPeriodData = async (count: number) => {
        if (!congregationId) return;
        setLoadingData(true);
        try {
            const res = await api.get<IMechanicalMonthResponse>(
                `/congregations/${congregationId}/mechanical-schedules`,
                {
                    params: {
                        year: initialYear,
                        month: initialMonth,
                        monthsCount: count
                    }
                }
            );

            const fetchedWeeks = res.data.weeks || [];
            setWeeks(fetchedWeeks);

            // Formata o período exibido no título do PDF
            const startDate = dayjs(`${initialYear}-${String(initialMonth).padStart(2, "0")}-01`);
            const endDate = startDate.add(count - 1, "month");

            if (count === 1) {
                setMonthFormatted(startDate.format("MMMM [de] YYYY"));
            } else if (startDate.year() === endDate.year()) {
                setMonthFormatted(`${startDate.format("MMMM")} a ${endDate.format("MMMM [de] YYYY")}`);
            } else {
                setMonthFormatted(`${startDate.format("MMMM [de] YYYY")} a ${endDate.format("MMMM [de] YYYY")}`);
            }
        } catch (error) {
            console.error("Erro ao carregar programação para PDF:", error);
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchPeriodData(monthsCount);
        }
    }, [open, monthsCount, initialYear, initialMonth, congregationId]);

    const fileName = `Programacao_Mecanica_${initialMonth}_${initialYear}_${monthsCount}meses.pdf`;

    return (
        <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">Exportar Programação em PDF</DialogTitle>
                            <DialogDescription className="text-xs">
                                Escolha a quantidade de meses para otimizar o uso da folha de impressão.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                            Período a Incluir no PDF
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                            {MONTH_OPTIONS.map(opt => {
                                const isSelected = monthsCount === opt.count;
                                return (
                                    <button
                                        key={opt.count}
                                        type="button"
                                        onClick={() => setMonthsCount(opt.count)}
                                        className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                                            isSelected
                                                ? "border-blue-600 bg-blue-50/50 shadow-sm"
                                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2 font-medium text-sm text-slate-800">
                                                <span>{opt.label}</span>
                                                {opt.count === 3 && (
                                                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-700 rounded">
                                                        Ideal A4
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500">{opt.desc}</p>
                                        </div>
                                        <div
                                            className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors ${
                                                isSelected
                                                    ? "bg-blue-600 border-blue-600 text-white"
                                                    : "border-slate-300 bg-white"
                                            }`}
                                        >
                                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Resumo do Período */}
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <CalendarRange className="w-4 h-4 text-blue-600" />
                            <span>Período: <strong className="capitalize text-slate-900">{monthFormatted || "Carregando..."}</strong></span>
                        </div>
                        <div className="text-slate-500 pl-5">
                            {loadingData ? (
                                <span className="flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" /> Carregando semanas...
                                </span>
                            ) : (
                                <span>{weeks.length} semanas • Tabela Vertical Consolidada</span>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loadingData}>
                        Cancelar
                    </Button>

                    {!loadingData && weeks.length > 0 ? (
                        <BlobProvider
                            document={
                                <MechanicalSchedulePdf
                                    weeks={weeks}
                                    congregationName={congregationName}
                                    monthFormatted={monthFormatted}
                                    combineSoundAndMedia={config?.combineSoundAndMedia}
                                    config={config}
                                />
                            }
                        >
                            {({ url, loading: pdfGenerating }) => (
                                <Button
                                    asChild
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                                    disabled={pdfGenerating || !url}
                                >
                                    <a
                                        href={url || "#"}
                                        download={fileName}
                                        onClick={() => {
                                            setTimeout(onClose, 800);
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        {pdfGenerating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Gerando PDF...
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                Baixar PDF ({monthsCount} {monthsCount === 1 ? "mês" : "meses"})
                                            </>
                                        )}
                                    </a>
                                </Button>
                            )}
                        </BlobProvider>
                    ) : (
                        <Button disabled className="bg-blue-600 text-white">
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Preparando...
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MechanicalPdfExportModal;
