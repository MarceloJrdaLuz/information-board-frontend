import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { IMidweekSchedule } from "@/types/midweek";
import { ITimelineItem, ITimerState } from "@/types/midweekChairman";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import html2canvas from "html2canvas";
import { Check, Copy, Download, Image as ImageIcon, Share2, User } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

dayjs.locale("pt-br");

interface MidweekChairmanReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedule: IMidweekSchedule;
    timelineItems: ITimelineItem[];
    timers: Record<string, ITimerState>;
    meetingStartTime: string;
    congregationName?: string;
    formatTime: (seconds: number) => string;
}

export const MidweekChairmanReportModal: React.FC<MidweekChairmanReportModalProps> = ({
    isOpen,
    onClose,
    schedule,
    timelineItems,
    timers,
    meetingStartTime,
    congregationName,
    formatTime,
}) => {
    const reportCardRef = useRef<HTMLDivElement | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [copiedText, setCopiedText] = useState<boolean>(false);
    const [copiedImage, setCopiedImage] = useState<boolean>(false);

    // Filtra e remove os CÂNTICOS do relatório (conforme solicitado pelo usuário)
    const reportItems = useMemo(() => {
        return timelineItems.filter(item => {
            if (item.isSong) return false;
            if (item.songNumber) return false;
            const titleLower = item.title.toLowerCase();
            if (titleLower.includes("cântico") || titleLower.includes("cantico")) return false;
            return true;
        });
    }, [timelineItems]);

    // Agrupa itens por seção para o visual do card
    const groupedSections = useMemo(() => {
        const sections: {
            title: string;
            color: string;
            items: ITimelineItem[];
        }[] = [];

        const sectionColorMap: Record<string, string> = {
            "Início da Reunião": "#345C68",
            "Tesouros da Palavra de Deus": "#345C68",
            "Faça Seu Melhor no Ministério": "#C57E0A",
            "Nossa Vida Cristã": "#8F1D2C",
            "Conclusão da Reunião": "#8F1D2C",
        };

        reportItems.forEach(item => {
            const secTitle = item.sectionTitle || "Outros";
            let sec = sections.find(s => s.title === secTitle);
            if (!sec) {
                sec = {
                    title: secTitle,
                    color: sectionColorMap[secTitle] || "#1E3A5F",
                    items: [],
                };
                sections.push(sec);
            }
            sec.items.push(item);
        });

        return sections;
    }, [reportItems]);

    // Data formatada da reunião
    const formattedDate = schedule.meetingDate
        ? dayjs(schedule.meetingDate).format("dddd, DD [de] MMMM [de] YYYY")
        : dayjs(schedule.weekDate).format("Semana de DD [de] MMMM [de] YYYY");

    // Total de partes concluídas
    const completedCount = reportItems.filter(i => timers[i.id]?.isCompleted).length;

    // Helper para download de blob
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Copia o relatório em formato de texto para WhatsApp
    const handleCopyText = async () => {
        let text = `📋 *RELATÓRIO DE TEMPOS — REUNIÃO DO MEIO DE SEMANA*\n`;
        if (congregationName) {
            text += `🏛 *Congregação:* ${congregationName}\n`;
        }
        text += `🗓 *Data:* ${formattedDate}\n`;
        if (schedule.weeklyBibleReading) {
            text += `📖 *Leitura Bíblica:* ${schedule.weeklyBibleReading}\n`;
        }
        if (schedule.chairman?.fullName) {
            text += `👤 *Presidente:* ${schedule.chairman.fullName}\n`;
        }
        text += `⏱ *Início da Reunião:* ${meetingStartTime}\n`;

        let currentSection = "";

        reportItems.forEach(item => {
            if (item.sectionTitle !== currentSection) {
                currentSection = item.sectionTitle;
                text += `\n*── ${currentSection.toUpperCase()} ──*\n`;
            }

            const t = timers[item.id] || { elapsedSeconds: 0, isCompleted: false };
            const targetSec = item.durationMinutes * 60;
            const elapsedSec = t.elapsedSeconds;
            const isDone = t.isCompleted;

            const timeStr = formatTime(elapsedSec);
            const targetStr = `${String(item.durationMinutes).padStart(2, '0')}:00`;

            let diffStr = "";
            if (elapsedSec > 0) {
                const diff = elapsedSec - targetSec;
                if (diff > 0) {
                    diffStr = ` (+${formatTime(diff)})`;
                } else if (diff < 0) {
                    diffStr = ` (-${formatTime(Math.abs(diff))})`;
                } else {
                    diffStr = ` (exato)`;
                }
            }

            const checkMark = isDone ? "✅ " : elapsedSec > 0 ? "⏱ " : "⚪ ";
            let assigned = item.assignedName ? ` — ${item.assignedName}` : "";
            if (item.assistantName) {
                assigned += ` (Ajudante: ${item.assistantName})`;
            }
            if (item.auxReaderName) {
                assigned += ` (Sala B: ${item.auxReaderName})`;
            }

            text += `${checkMark}*${item.title}* [Previsto: ${targetStr}]\n`;
            text += `   Tempo: ${timeStr}${diffStr}${assigned}\n`;
        });

        text += `\n━━━━━━━━━━━━━━━━━━━━\n`;
        text += `📊 *Total Concluídas:* ${completedCount} de ${reportItems.length} partes\n`;
        text += `⏱ Gerado em ${dayjs().format("DD/MM/YYYY [às] HH:mm")}`;

        try {
            await navigator.clipboard.writeText(text);
            setCopiedText(true);
            toast.success("Texto do relatório copiado!");
            setTimeout(() => setCopiedText(false), 2000);
        } catch {
            toast.error("Não foi possível copiar o texto.");
        }
    };

    // Gera o Canvas com a altura e largura totais completas do card, sem corte por scroll ou modal
    const generateReportCanvas = async (): Promise<HTMLCanvasElement | null> => {
        const el = reportCardRef.current;
        if (!el) return null;

        // Mede a altura e largura totais reais completas do elemento
        const fullWidth = el.scrollWidth || el.offsetWidth || 560;
        const fullHeight = el.scrollHeight;

        const canvas = await html2canvas(el, {
            scale: 2, // 2x para nitidez perfeita em qualquer tela
            useCORS: true,
            backgroundColor: "#FFFFFF",
            logging: false,
            scrollX: 0,
            scrollY: 0,
            x: 0,
            y: 0,
            width: fullWidth,
            height: fullHeight,
            windowWidth: fullWidth + 100,
            windowHeight: fullHeight + 100,
            onclone: (clonedDoc) => {
                if (clonedDoc.body) {
                    clonedDoc.body.style.overflow = "visible";
                    clonedDoc.body.style.height = "auto";
                    clonedDoc.body.style.maxHeight = "none";
                }

                const clonedEl = clonedDoc.querySelector("[data-report-card]") as HTMLElement;
                if (clonedEl) {
                    clonedEl.style.width = `${fullWidth}px`;
                    clonedEl.style.minWidth = `${fullWidth}px`;
                    clonedEl.style.maxWidth = `${fullWidth}px`;
                    clonedEl.style.height = `${fullHeight}px`;
                    clonedEl.style.maxHeight = "none";
                    clonedEl.style.overflow = "visible";
                    clonedEl.style.position = "static";
                    clonedEl.style.transform = "none";

                    // Remove qualquer restrição de overflow e altura de todos os pais no clone
                    let parent = clonedEl.parentElement;
                    while (parent && parent !== clonedDoc.body) {
                        parent.style.overflow = "visible";
                        parent.style.height = "auto";
                        parent.style.maxHeight = "none";
                        parent.style.transform = "none";
                        parent = parent.parentElement;
                    }

                    // Remove classes de truncate para evitar que o html2canvas corte letras pela metade
                    clonedEl.querySelectorAll("*").forEach((node) => {
                        const elNode = node as HTMLElement;
                        if (elNode.classList && elNode.classList.contains("truncate")) {
                            elNode.classList.remove("truncate");
                        }
                    });
                }
            },
        });

        return canvas;
    };

    // Gera a imagem e copia diretamente para o clipboard (Ctrl+V)
    const handleCopyImage = async () => {
        setIsGenerating(true);

        try {
            const canvas = await generateReportCanvas();
            if (!canvas) {
                toast.error("Erro ao processar imagem.");
                setIsGenerating(false);
                return;
            }

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    toast.error("Erro ao processar imagem.");
                    setIsGenerating(false);
                    return;
                }

                try {
                    if (navigator.clipboard && "write" in navigator.clipboard && typeof ClipboardItem !== "undefined") {
                        const item = new ClipboardItem({ "image/png": blob });
                        await navigator.clipboard.write([item]);
                        setCopiedImage(true);
                        toast.success("Imagem copiada! Basta dar Ctrl+V no WhatsApp.");
                        setTimeout(() => setCopiedImage(false), 2500);
                    } else {
                        // Fallback para download se o navegador não suportar ClipboardItem
                        downloadBlob(blob, `relatorio-tempos-${dayjs().format("YYYY-MM-DD")}.png`);
                        toast.info("Imagem baixada! Você pode enviar pelo arquivo.");
                    }
                } catch (clipErr) {
                    console.warn("ClipboardItem write falhou, baixando imagem:", clipErr);
                    downloadBlob(blob, `relatorio-tempos-${dayjs().format("YYYY-MM-DD")}.png`);
                    toast.info("Imagem salva em Downloads para compartilhar.");
                } finally {
                    setIsGenerating(false);
                }
            }, "image/png");
        } catch (err) {
            console.error("Erro ao gerar imagem:", err);
            toast.error("Erro ao gerar imagem do relatório.");
            setIsGenerating(false);
        }
    };

    // Baixa o arquivo PNG completo
    const handleDownloadImage = async () => {
        setIsGenerating(true);

        try {
            const canvas = await generateReportCanvas();
            if (!canvas) {
                toast.error("Erro ao baixar imagem.");
                setIsGenerating(false);
                return;
            }

            canvas.toBlob((blob) => {
                if (blob) {
                    downloadBlob(blob, `relatorio-tempos-${dayjs().format("YYYY-MM-DD")}.png`);
                    toast.success("Imagem baixada com sucesso!");
                }
                setIsGenerating(false);
            }, "image/png");
        } catch {
            toast.error("Erro ao baixar imagem.");
            setIsGenerating(false);
        }
    };

    // Compartilhamento nativo no celular (se suportado pelo navegador)
    const handleNativeShare = async () => {
        setIsGenerating(true);

        try {
            const canvas = await generateReportCanvas();
            if (!canvas) {
                setIsGenerating(false);
                return;
            }

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setIsGenerating(false);
                    return;
                }

                const file = new File([blob], `relatorio-tempos-${dayjs().format("YYYY-MM-DD")}.png`, {
                    type: "image/png",
                });

                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: "Relatório de Tempos",
                            text: `Relatório de Tempos — ${formattedDate}`,
                        });
                    } catch (shareErr) {
                        // Usuário cancelou o share sheet
                    }
                } else {
                    handleCopyImage();
                }
                setIsGenerating(false);
            }, "image/png");
        } catch {
            setIsGenerating(false);
        }
    };

    const canNativeShare = typeof navigator !== "undefined" && !!navigator.share && !!navigator.canShare;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-4 sm:p-6 overflow-hidden">
                <DialogHeader className="pb-2 border-b border-surface-300">
                    <DialogTitle className="text-base sm:text-lg font-bold text-typography-900 flex items-center justify-between gap-2">
                        <span>Compartilhar Relatório de Tempos</span>
                    </DialogTitle>
                </DialogHeader>

                {/* Barra de Ações Rápidas */}
                <div className="flex items-center gap-2 flex-wrap py-2 border-b border-surface-200">
                    <Button
                        size="sm"
                        onClick={handleCopyImage}
                        disabled={isGenerating}
                        className="h-8 gap-1.5 text-xs font-bold bg-primary-200 hover:bg-primary-300 text-white"
                        title="Copia a imagem para colar no WhatsApp"
                    >
                        {copiedImage ? <Check className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                        <span>{copiedImage ? "Imagem Copiada!" : "Copiar Imagem"}</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCopyText}
                        className="h-8 gap-1.5 text-xs font-semibold text-typography-700 hover:text-typography-900"
                        title="Copia o relatório em texto para WhatsApp"
                    >
                        {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedText ? "Texto Copiado!" : "Copiar Texto"}</span>
                    </Button>

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDownloadImage}
                        disabled={isGenerating}
                        className="h-8 gap-1.5 text-xs font-semibold text-typography-700 hover:text-typography-900"
                        title="Baixar imagem PNG"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar Imagem</span>
                    </Button>

                    {canNativeShare && (
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleNativeShare}
                            disabled={isGenerating}
                            className="h-8 gap-1.5 text-xs font-semibold"
                            title="Compartilhar direto no WhatsApp"
                        >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Compartilhar</span>
                        </Button>
                    )}
                </div>

                {/* Área de Visualização e Renderização do Card (com identidade visual oficial do PDF) */}
                <div className="flex-1 overflow-auto thin-scrollbar p-2 flex justify-center items-start bg-surface-200/50 rounded-xl">
                    <div
                        ref={reportCardRef}
                        data-report-card
                        className="w-[560px] min-w-[560px] max-w-[560px] bg-white text-slate-800 rounded-lg shadow-md border border-slate-300 overflow-hidden font-sans select-none"
                        style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
                    >
                        {/* 1. TOPO OFICIAL DO PDF (#1E3A5F) */}
                        <div className="bg-[#1E3A5F] text-white p-4">
                            <div className="flex items-center justify-between border-b border-[#3B5A82] pb-2 mb-2.5">
                                <div>
                                    {congregationName && (
                                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                                            {congregationName}
                                        </span>
                                    )}
                                    <h2 className="text-sm sm:text-base font-black tracking-wide text-white uppercase">
                                        Relatório de Tempos da Reunião
                                    </h2>
                                </div>
                                <div className="text-right">
                                    <span className="text-[11px] font-bold text-white block capitalize">
                                        {formattedDate}
                                    </span>
                                </div>
                            </div>

                            {/* Informações da Reunião: Leitura, Presidente e Início */}
                            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-200 pt-1 leading-normal">
                                {schedule.weeklyBibleReading && (
                                    <div className="leading-normal">
                                        <span className="text-[#94A3B8] font-medium">Leitura:</span>{" "}
                                        <strong className="text-white">{schedule.weeklyBibleReading}</strong>
                                    </div>
                                )}
                                {schedule.chairman?.fullName && (
                                    <div className="text-right leading-normal">
                                        <span className="text-[#94A3B8] font-medium">Presidente:</span>{" "}
                                        <strong className="text-white">{schedule.chairman.fullName}</strong>
                                    </div>
                                )}
                                <div className="leading-normal">
                                    <span className="text-[#94A3B8] font-medium">Início:</span>{" "}
                                    <strong className="text-white font-mono">{meetingStartTime}</strong>
                                </div>
                                <div className="text-right leading-normal">
                                    <span className="text-[#94A3B8] font-medium">Concluídas:</span>{" "}
                                    <strong className="text-white font-bold">{completedCount} de {reportItems.length}</strong>
                                </div>
                            </div>
                        </div>

                        {/* 2. SEÇÕES E PARTES (Sem Cânticos) */}
                        <div className="flex flex-col">
                            {groupedSections.map((sec, secIdx) => (
                                <div key={secIdx} className="flex flex-col">
                                    {/* Faixa da Seção no Estilo PDF */}
                                    <div
                                        className="px-3.5 py-1.5 text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-between leading-normal"
                                        style={{ backgroundColor: sec.color }}
                                    >
                                        <span>{sec.title}</span>
                                        <span className="text-[10px] opacity-80 lowercase font-normal">
                                            {sec.items.length} {sec.items.length === 1 ? "parte" : "partes"}
                                        </span>
                                    </div>

                                    {/* Tabela de Partes da Seção */}
                                    <div className="divide-y divide-slate-200">
                                        {sec.items.map((item) => {
                                            const t = timers[item.id] || { elapsedSeconds: 0, isCompleted: false };
                                            const targetSec = item.durationMinutes * 60;
                                            const elapsedSec = t.elapsedSeconds;
                                            const diffSec = elapsedSec - targetSec;
                                            const isOvertime = elapsedSec > targetSec;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
                                                >
                                                    {/* Lado Esquerdo: Título, Fonte e Irmãos */}
                                                    <div className="flex flex-col min-w-0 flex-1 leading-normal">
                                                        <div className="flex items-center gap-1.5 flex-wrap leading-normal">
                                                            <span className="font-bold text-slate-900 leading-normal text-xs sm:text-sm">
                                                                {item.title}
                                                            </span>
                                                        </div>

                                                        {/* Participantes */}
                                                        {(item.assignedName || item.assistantName || item.readerName || item.auxReaderName) && (
                                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 mt-1 leading-normal flex-wrap">
                                                                <span className="inline-flex items-center gap-1">
                                                                    <User className="w-3 h-3 text-slate-400 shrink-0 inline" />
                                                                    <span className="font-semibold text-slate-800">{item.assignedName || "A designar"}</span>
                                                                </span>
                                                                {item.assistantName && (
                                                                    <span className="text-slate-500">
                                                                        (Ajudante: <span className="font-medium text-slate-700">{item.assistantName}</span>)
                                                                    </span>
                                                                )}
                                                                {item.readerName && (
                                                                    <span className="text-slate-500">
                                                                        (Leitor: <span className="font-medium text-slate-700">{item.readerName}</span>)
                                                                    </span>
                                                                )}
                                                                {item.auxReaderName && (
                                                                    <span className="text-teal-700 font-medium">
                                                                        (Sala B: {item.auxReaderName})
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Lado Direito: Tempos e Diferença com altura garantida para não cortar números */}
                                                    <div className="flex items-center gap-2 shrink-0 py-0.5">
                                                        {/* Tempo Previsto */}
                                                        <span className="text-[11px] font-mono text-slate-600 bg-slate-100 h-6 px-2 rounded border border-slate-200 inline-flex items-center justify-center leading-none">
                                                            {String(item.durationMinutes).padStart(2, '0')}:00
                                                        </span>

                                                        {/* Tempo Realizado */}
                                                        <span className={`text-xs font-mono font-bold h-6 px-2 rounded inline-flex items-center justify-center leading-none ${
                                                            t.isCompleted
                                                                ? "bg-slate-800 text-white"
                                                                : elapsedSec > 0
                                                                ? "bg-amber-100 text-amber-900 font-bold"
                                                                : "bg-slate-100 text-slate-400"
                                                        }`}>
                                                            {formatTime(elapsedSec)}
                                                        </span>

                                                        {/* Badge de Diferença */}
                                                        {elapsedSec > 0 ? (
                                                            <span className={`text-[11px] font-mono font-bold h-6 px-2 rounded min-w-[54px] text-center inline-flex items-center justify-center leading-none ${
                                                                isOvertime
                                                                    ? "bg-rose-100 text-rose-700 border border-rose-200"
                                                                    : diffSec === 0
                                                                    ? "bg-slate-100 text-slate-600"
                                                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                                            }`}>
                                                                {isOvertime
                                                                    ? `+${formatTime(diffSec)}`
                                                                    : diffSec === 0
                                                                    ? "00:00"
                                                                    : `-${formatTime(Math.abs(diffSec))}`}
                                                            </span>
                                                        ) : (
                                                            <span className="text-[11px] text-slate-300 min-w-[54px] h-6 inline-flex items-center justify-center text-center leading-none">
                                                                —
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. RODAPÉ DO CARD */}
                        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500">
                            <span>Quadro Virtual • Registro de Tempos</span>
                            <span>Gerado em {dayjs().format("DD/MM/YYYY [às] HH:mm")}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
