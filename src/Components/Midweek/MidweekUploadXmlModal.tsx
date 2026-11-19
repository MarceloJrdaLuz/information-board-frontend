import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { api } from "@/services/api";
import { Check, CheckCircle, Copy, ExternalLink, FileCode, FolderArchive, Loader2, Mail, UploadCloud } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface MidweekUploadXmlModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const PTS_EMAIL_TO = "support@publictalksoftware.co.uk";
const PTS_EMAIL_SUBJECT = "Request for Latest Monthly Workbook Data";
const PTS_EMAIL_BODY = `Dear Brothers,

May I kindly request the latest monthly workbook data when convenient?

Language: Português Brasil (Portuguese Brazil) (PTB)

Thank you for your ongoing support.

Warm Christian love,`;

export const MidweekUploadXmlModal: React.FC<MidweekUploadXmlModalProps> = ({
    open,
    onClose,
    onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [copied, setCopied] = useState(false);
    const [congregationEmail, setCongregationEmail] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedEmail = localStorage.getItem("@quadro:mwb_congregation_email") || "";
            if (savedEmail) {
                setCongregationEmail(savedEmail);
            }
        }
    }, []);

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCongregationEmail(val);
        if (typeof window !== "undefined") {
            localStorage.setItem("@quadro:mwb_congregation_email", val.trim());
        }
    };

    const trimmedEmail = congregationEmail.trim();
    const gmailAuthUser = trimmedEmail ? `&authuser=${encodeURIComponent(trimmedEmail)}` : "";
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1${gmailAuthUser}&to=${encodeURIComponent(PTS_EMAIL_TO)}&su=${encodeURIComponent(PTS_EMAIL_SUBJECT)}&body=${encodeURIComponent(PTS_EMAIL_BODY)}`;
    const mailtoUrl = `mailto:${PTS_EMAIL_TO}?${trimmedEmail ? `cc=${encodeURIComponent(trimmedEmail)}&` : ""}subject=${encodeURIComponent(PTS_EMAIL_SUBJECT)}&body=${encodeURIComponent(PTS_EMAIL_BODY)}`;

    const isAllowedFile = (fileName: string) => {
        const lower = fileName.toLowerCase();
        return lower.endsWith(".xml") || lower.endsWith(".zip");
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (isAllowedFile(droppedFile.name)) {
                setFile(droppedFile);
            } else {
                toast.error("Por favor, selecione o arquivo MWBDataUpdate.zip ou um arquivo .XML válido.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (isAllowedFile(selected.name)) {
                setFile(selected);
            } else {
                toast.error("Por favor, selecione um arquivo .ZIP ou .XML.");
            }
        }
    };

    const handleCopyEmailData = async () => {
        try {
            const fromLine = trimmedEmail ? `De (sua congregação): ${trimmedEmail}\n` : "";
            const fullText = `${fromLine}Para: ${PTS_EMAIL_TO}\nAssunto: ${PTS_EMAIL_SUBJECT}\n\n${PTS_EMAIL_BODY}`;
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            toast.info("Texto da solicitação copiado!");
            setTimeout(() => setCopied(false), 2500);
        } catch {
            toast.error("Não foi possível copiar o texto.");
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.warning("Selecione um arquivo ZIP ou XML antes de importar.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/midweek/import-xml", formData);

            toast.success(res.data.message || "Apostila importada com sucesso!");
            setFile(null);
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao importar apostila.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const isZipSelected = file && file.name.toLowerCase().endsWith(".zip");

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md bg-surface-100 border border-surface-300">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold text-typography-900">
                        <UploadCloud className="h-5 w-5 text-primary-200" />
                        Importar Apostila (ZIP ou XML)
                    </DialogTitle>
                    <DialogDescription className="text-xs text-typography-500">
                        Envie o arquivo oficial <strong>MWBDataUpdate.zip</strong> diretamente ou o arquivo XML da apostila. O sistema localiza o português (PTB) de forma automática.
                    </DialogDescription>
                </DialogHeader>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-5 transition-all ${
                        dragActive
                            ? "border-primary-200 bg-primary-100/10"
                            : "border-surface-300 bg-surface-200/50 hover:bg-surface-200"
                    }`}
                >
                    <input
                        type="file"
                        id="xml-file-input"
                        accept=".zip,.xml,application/zip,application/x-zip-compressed,text/xml"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {file ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                                {isZipSelected ? (
                                    <FolderArchive className="h-8 w-8 text-emerald-500" />
                                ) : (
                                    <CheckCircle className="h-8 w-8" />
                                )}
                            </div>
                            <span className="text-xs font-semibold text-typography-900 max-w-[280px] truncate">
                                {file.name}
                            </span>
                            <span className="text-[10px] text-typography-500">
                                {(file.size / 1024).toFixed(1)} KB
                                {isZipSelected && " • Extração automática do PTB"}
                            </span>
                            <label
                                htmlFor="xml-file-input"
                                className="mt-1 text-xs text-primary-200 hover:underline cursor-pointer font-medium"
                            >
                                Escolher outro arquivo
                            </label>
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center gap-2 text-center cursor-pointer"
                            onClick={() => document.getElementById("xml-file-input")?.click()}
                        >
                            <div className="flex items-center gap-1.5 p-2.5 bg-primary-100/20 text-primary-200 rounded-full">
                                <FolderArchive className="h-6 w-6" />
                                <span className="text-xs text-primary-200/70 font-bold">/</span>
                                <FileCode className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-typography-800">
                                    Clique para selecionar ou arraste o arquivo aqui
                                </p>
                                <p className="text-[10px] text-typography-500 mt-0.5">
                                    Arquivo oficial <strong>MWBDataUpdate.zip</strong> ou <strong>.xml</strong>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Seção para solicitar o arquivo por e-mail */}
                <div className="rounded-xl border border-surface-300 bg-surface-200/40 p-3.5 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-typography-800">
                            <Mail className="h-4 w-4 text-primary-200" />
                            <span>Precisa do arquivo da matéria?</span>
                        </div>
                        <button
                            type="button"
                            onClick={handleCopyEmailData}
                            className="text-[11px] text-typography-500 hover:text-typography-800 flex items-center gap-1 transition-colors"
                            title="Copiar texto padrão da solicitação"
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3 text-emerald-500" />
                                    <span className="text-emerald-500 font-medium">Copiado!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3 w-3" />
                                    <span>Copiar texto</span>
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="mwb-cong-email-input" className="text-[11px] font-medium text-typography-700 flex items-center justify-between">
                            <span>E-mail da congregação (para receber o anexo):</span>
                            {trimmedEmail && (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                    ✓ Salvo
                                </span>
                            )}
                        </label>
                        <input
                            id="mwb-cong-email-input"
                            type="email"
                            value={congregationEmail}
                            onChange={handleEmailChange}
                            placeholder="ex: congregacao...@gmail.com"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-100 text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                        <a
                            href={gmailComposeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-800 transition-colors shadow-sm"
                        >
                            <Mail className="h-3.5 w-3.5 text-red-500" />
                            <span>
                                {trimmedEmail ? `Solicitar via Gmail (${trimmedEmail.split("@")[0]})` : "Solicitar via Gmail"}
                            </span>
                            <ExternalLink className="h-3 w-3 text-typography-400" />
                        </a>

                        <a
                            href={mailtoUrl}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 hover:bg-surface-200 border border-surface-300 text-typography-700 transition-colors shadow-sm"
                            title="Abrir no Outlook, app padrão do computador ou celular"
                        >
                            <span>Outro App</span>
                        </a>
                    </div>

                    <p className="text-[10px] text-typography-400 leading-snug">
                        💡 <em>O Gmail abrirá diretamente na conta informada acima (se conectada no seu navegador), garantindo que a resposta chegue nela.</em>
                    </p>
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        disabled={loading}
                        className="text-xs text-typography-700 hover:bg-surface-200"
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                    >
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        <span>{loading ? "Processando arquivo..." : "Importar Programação"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
