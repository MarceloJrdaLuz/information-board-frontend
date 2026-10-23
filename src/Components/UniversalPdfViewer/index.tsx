import React, { useEffect, useState } from "react";
import { BlobProvider } from "@react-pdf/renderer";
import { Button } from "@/Components/ui/button";
import {
    AlertCircle,
    Download,
    ExternalLink,
    Eye,
    FileText,
    Layers,
    Loader2
} from "lucide-react";

interface UniversalPdfViewerProps {
    document: React.ReactElement;
    title?: string;
    fileName?: string;
    onSwitchToA4?: () => void;
    className?: string;
    minHeight?: string | number;
}

export function UniversalPdfViewer({
    document,
    title,
    fileName = "documento.pdf",
    onSwitchToA4,
    className = "",
    minHeight = "750px"
}: UniversalPdfViewerProps) {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkMobile = () => {
            if (typeof window === "undefined") return;
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera || "";
            const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            setIsMobile(isMobileUA || window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className={`w-full h-full flex flex-col ${className}`}>
            <BlobProvider document={document}>
                {({ url, loading, error }) => {
                    if (loading) {
                        return (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-typography-600 min-h-[350px]">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-200" />
                                <span className="text-sm font-medium">
                                    Preparando visualização do PDF...
                                </span>
                            </div>
                        );
                    }

                    if (error || !url) {
                        return (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 text-rose-500 text-center min-h-[350px]">
                                <AlertCircle className="w-10 h-10" />
                                <span className="text-sm font-semibold">
                                    Erro ao gerar o documento PDF.
                                </span>
                                {onSwitchToA4 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={onSwitchToA4}
                                        className="mt-2 text-xs"
                                    >
                                        Usar visualização em Folha A4
                                    </Button>
                                )}
                            </div>
                        );
                    }

                    // No Mobile (Android/iOS): navegadores não suportam renderizar PDFs dentro de <iframe>.
                    // Exibe um card moderno e intuitivo com botão direto para abrir em tela cheia na nova aba.
                    if (isMobile) {
                        return (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 bg-surface-100 dark:bg-surface-800/60 rounded-2xl border border-surface-300 text-center gap-4 my-auto min-h-[400px]">
                                <div className="w-16 h-16 rounded-2xl bg-primary-100/30 text-primary-200 flex items-center justify-center shadow-xs">
                                    <FileText className="w-8 h-8" />
                                </div>

                                <div className="max-w-md space-y-1.5">
                                    <h4 className="text-base sm:text-lg font-bold text-typography-900">
                                        {title || "Visualização do PDF"}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-typography-500 leading-relaxed">
                                        Navegadores de celular não exibem PDFs dentro da página. Toque no botão abaixo para abrir o documento em tela cheia com alta qualidade:
                                    </p>
                                </div>

                                <div className="flex flex-col w-full max-w-xs gap-2.5 pt-2">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <Button
                                            type="button"
                                            className="w-full bg-primary-200 hover:bg-primary-300 text-white font-bold h-11 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span>Abrir PDF em Tela Cheia</span>
                                        </Button>
                                    </a>

                                    <a
                                        href={url}
                                        download={fileName}
                                        className="w-full"
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-surface-300 text-typography-700 hover:bg-surface-200 h-10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Baixar Arquivo PDF</span>
                                        </Button>
                                    </a>

                                    {onSwitchToA4 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={onSwitchToA4}
                                            className="w-full text-xs text-primary-200 hover:bg-primary-100/10 h-9 font-medium flex items-center justify-center gap-1.5 cursor-pointer"
                                        >
                                            <Layers className="w-3.5 h-3.5" />
                                            <span>Alternar para modo Folha A4</span>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // No Desktop: iframe com barra de ferramentas prática no topo
                    return (
                        <div className="relative w-full h-full flex flex-col min-h-[500px]">
                            <div className="flex items-center justify-between px-4 py-2.5 bg-surface-100 border-b border-surface-300 text-xs font-medium text-typography-700">
                                <span className="font-bold text-typography-800 truncate pr-2">
                                    {title || "Pré-visualização do Documento"}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 px-2.5 text-xs gap-1.5 text-primary-200 hover:bg-primary-100/10 font-semibold cursor-pointer"
                                            title="Abrir PDF em nova aba em tela cheia"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            <span>Abrir em nova aba</span>
                                        </Button>
                                    </a>

                                    <a
                                        href={url}
                                        download={fileName}
                                    >
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 px-2.5 text-xs gap-1.5 text-typography-600 hover:bg-surface-200 cursor-pointer"
                                            title="Baixar arquivo PDF"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>Baixar</span>
                                        </Button>
                                    </a>
                                </div>
                            </div>

                            <iframe
                                src={`${url}#toolbar=0&navpanes=0`}
                                className="w-full flex-1 border-0 bg-white"
                                style={{ minHeight }}
                                title={title || "Pré-visualização do PDF"}
                            />
                        </div>
                    );
                }}
            </BlobProvider>
        </div>
    );
}

export default UniversalPdfViewer;

