import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { api } from "@/services/api";
import { CheckCircle, FileCode, Loader2, UploadCloud } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

interface MidweekUploadXmlModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const MidweekUploadXmlModal: React.FC<MidweekUploadXmlModalProps> = ({
    open,
    onClose,
    onSuccess
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

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
            if (droppedFile.name.toLowerCase().endsWith(".xml")) {
                setFile(droppedFile);
            } else {
                toast.error("Por favor, selecione um arquivo .XML válido do Meeting Schedule Assistant.");
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.warning("Selecione um arquivo XML antes de importar.");
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await api.post("/midweek/import-xml", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success(res.data.message || "Apostila importada com sucesso!");
            setFile(null);
            onSuccess();
            onClose();
        } catch (error: any) {
            const msg = error.response?.data?.message || "Erro ao importar arquivo XML.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-md bg-surface-100 border border-surface-300">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-base font-bold text-typography-900">
                        <UploadCloud className="h-5 w-5 text-primary-200" />
                        Importar Apostila XML
                    </DialogTitle>
                    <DialogDescription className="text-xs text-typography-500">
                        Selecione o arquivo XML exportado do programa de reuniões para preencher automaticamente as semanas e partes.
                    </DialogDescription>
                </DialogHeader>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 transition-all ${
                        dragActive
                            ? "border-primary-200 bg-primary-100/10"
                            : "border-surface-300 bg-surface-200/50 hover:bg-surface-200"
                    }`}
                >
                    <input
                        type="file"
                        id="xml-file-input"
                        accept=".xml,text/xml"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {file ? (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <span className="text-xs font-semibold text-typography-900 max-w-[280px] truncate">
                                {file.name}
                            </span>
                            <span className="text-[10px] text-typography-500">
                                {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <label
                                htmlFor="xml-file-input"
                                className="mt-1 text-xs text-primary-200 hover:underline cursor-pointer font-medium"
                            >
                                Escolher outro arquivo
                            </label>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-center cursor-pointer" onClick={() => document.getElementById("xml-file-input")?.click()}>
                            <div className="p-3 bg-primary-100/20 text-primary-200 rounded-full">
                                <FileCode className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-typography-800">
                                    Clique para selecionar ou arraste o arquivo XML aqui
                                </p>
                                <p className="text-[10px] text-typography-500 mt-0.5">
                                    Formato padrão MeetingWorkBook (.xml)
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex items-center justify-between sm:justify-between gap-2 pt-2">
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
                        <span>{loading ? "Processando XML..." : "Importar Programação"}</span>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
