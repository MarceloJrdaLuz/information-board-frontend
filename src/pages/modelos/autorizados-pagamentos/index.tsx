import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import ContentDashboard from "@/Components/ContentDashboard";
import PaymentAuthorizedPdf from "@/Components/DocumentModels/PaymentAuthorizedPdf";
import PaymentAuthorizedPreview from "@/Components/DocumentModels/PaymentAuthorizedPreview";
import UniversalPdfViewer from "@/Components/UniversalPdfViewer";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useCongregationContext } from "@/context/CongregationContext";
import { DEFAULT_PAYMENT_AUTHORIZED, IPaymentAuthorizedData } from "@/types/documentModels";
import { ISignaturePerson } from "@/types/letterGenerator";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import {
    AlertCircle,
    Building2,
    CheckCircle2,
    Download,
    ExternalLink,
    Eye,
    FileEdit,
    FileSignature,
    HardDrive,
    Layers,
    Loader2,
    Plus,
    RotateCcw,
    ShieldCheck,
    Sparkles,
    Trash2,
    UserCheck,
    Users
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const DRAFT_STORAGE_KEY = "@information_board:autorizados_pagamentos_draft";

interface IDraftStorage {
    savedAt: string;
    data: IPaymentAuthorizedData;
}

function PaymentAuthorizedPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();

    const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");
    const [previewMode, setPreviewMode] = useState<"sheets" | "pdf">("sheets");

    const [formData, setFormData] = useState<IPaymentAuthorizedData>(() => ({
        ...DEFAULT_PAYMENT_AUTHORIZED,
        date: dayjs().format("YYYY-MM-DD"),
        congregationName: congregation?.name || "",
        congregationState: "",
    }));

    const [savedDraftInfo, setSavedDraftInfo] = useState<IDraftStorage | null>(null);

    // Carrega rascunho salvo no dispositivo
    useEffect(() => {
        try {
            const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (raw) {
                const parsed: IDraftStorage = JSON.parse(raw);
                if (parsed?.data && parsed?.savedAt) {
                    setSavedDraftInfo(parsed);
                }
            }
        } catch (e) {
            console.error("Erro ao verificar rascunho no dispositivo:", e);
        }
    }, []);

    // Atualiza congregação se carregada
    useEffect(() => {
        if (congregation) {
            setFormData(prev => ({
                ...prev,
                congregationName: prev.congregationName || congregation.name || "",
                
            }));
        }
    }, [congregation]);

    // Configura breadcrumbs e menu ativo
    useEffect(() => {
        setPageActive("/modelos/autorizados-pagamentos");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Modelos", link: "/modelos" },
            { label: "Autorizados a pagar", link: "/modelos/autorizados-pagamentos" }
        ]);
    }, [setCrumbs, setPageActive]);

    // Debounce leve para renderização do PDF
    const [debouncedData, setDebouncedData] = useState<IPaymentAuthorizedData>(formData);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedData(formData), 350);
        return () => clearTimeout(timer);
    }, [formData]);

    const handleFieldChange = (field: keyof IPaymentAuthorizedData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Gerenciamento dos irmãos autorizados
    const handleBrotherChange = (index: number, value: string) => {
        setFormData(prev => {
            const next = [...prev.authorizedBrothers];
            next[index] = value;
            return { ...prev, authorizedBrothers: next };
        });
    };

    const handleAddBrother = () => {
        setFormData(prev => ({
            ...prev,
            authorizedBrothers: [...prev.authorizedBrothers, ""],
        }));
    };

    const handleRemoveBrother = (index: number) => {
        setFormData(prev => ({
            ...prev,
            authorizedBrothers: prev.authorizedBrothers.filter((_, i) => i !== index),
        }));
    };

    // Gerenciamento de assinaturas
    const handleSignatureChange = (index: number, field: keyof ISignaturePerson, value: string) => {
        setFormData(prev => {
            const next = [...prev.signatures];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, signatures: next };
        });
    };

    const handleAddSignature = () => {
        setFormData(prev => ({
            ...prev,
            signatures: [...prev.signatures, { name: "", role: "Ancião" }],
        }));
    };

    const handleRemoveSignature = (index: number) => {
        setFormData(prev => ({
            ...prev,
            signatures: prev.signatures.filter((_, i) => i !== index),
        }));
    };

    const handleSaveDraftToDevice = () => {
        try {
            const payload: IDraftStorage = {
                savedAt: new Date().toISOString(),
                data: formData,
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
            setSavedDraftInfo(payload);
            toast.success("Rascunho salvo exclusivamente neste dispositivo!");
        } catch (e) {
            console.error("Erro ao salvar rascunho:", e);
            toast.error("Não foi possível salvar o rascunho neste dispositivo.");
        }
    };

    const handleRestoreDraftFromDevice = () => {
        if (!savedDraftInfo) return;
        setFormData(savedDraftInfo.data);
        toast.success("Rascunho do dispositivo restaurado com sucesso!");
    };

    const handleDeleteDraftFromDevice = () => {
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            setSavedDraftInfo(null);
            toast.info("Rascunho excluído deste dispositivo.");
        } catch (e) {
            console.error("Erro ao excluir rascunho:", e);
        }
    };

    const handleLoadSample = () => {
        setFormData({
            title: "Autorizados a fazer pagamentos",
            date: dayjs().format("YYYY-MM-DD"),
            congregationName: congregation?.name || "Luís Gomes",
            congregationState: "RN",
            authorizedBrothers: [
                "Carlos Eduardo Silva",
                "Marcelo Roberto de Alencar",
            ],
            bodyText: "Irmãos autorizados a fazer pagamentos usando a conta da congregação:",
            additionalNotes: "",
            signatures: [
                { name: "Carlos Eduardo Silva", role: "Coordenador" },
                { name: "Antônio Marcos Rocha", role: "Secretário" },
                { name: "José Roberto Lima", role: "Supte. Serviço" },
            ],
            documentTitle: "Autorizados a fazer pagamentos",
        });
        toast.success("Exemplo preenchido com sucesso!");
    };

    const handleClearForm = () => {
        setFormData({
            ...DEFAULT_PAYMENT_AUTHORIZED,
            date: dayjs().format("YYYY-MM-DD"),
            congregationName: congregation?.name || "",
            congregationState: "",
        });
        toast.info("Campos da tela limpos.");
    };

    const fileName = useMemo(() => {
        const dateStr = formData.date || dayjs().format("YYYY-MM-DD");
        return `autorizados_pagamentos_${dateStr}.pdf`;
    }, [formData.date]);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Autorizados a pagar" />

                {/* Banner de Cabeçalho */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-3 bg-primary-200/10 text-primary-200 rounded-2xl shrink-0">
                            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                                    Autorizados a Fazer Pagamentos
                                </h1>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    <HardDrive className="w-3 h-3" />
                                    Salvo no Dispositivo
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                                    Apenas Anciãos
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-typography-600 mt-1 leading-relaxed">
                                Documento congregacional com a lista de irmãos autorizados pelo corpo de anciãos a efetuar pagamentos com a conta da congregação.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0 flex-wrap">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleSaveDraftToDevice}
                            className="gap-1.5 text-xs border-primary-200/50 text-primary-200 hover:bg-primary-200/10 font-semibold shadow-2xs"
                            title="Salva os dados no disco deste aparelho"
                        >
                            <HardDrive className="w-3.5 h-3.5" />
                            <span>Salvar Rascunho no Dispositivo</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLoadSample}
                            className="gap-1.5 text-xs border-surface-300 hover:bg-surface-200 text-typography-700"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>Carregar Exemplo</span>
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleClearForm}
                            className="gap-1.5 text-xs border-surface-300 hover:bg-surface-200 text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Limpar</span>
                        </Button>
                    </div>
                </div>

                {/* Card Informativo de Rascunho Salvo no Dispositivo */}
                {savedDraftInfo && (
                    <div className="bg-surface-100 border border-primary-200/40 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-200/10 rounded-xl text-primary-200 shrink-0">
                                <HardDrive className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="font-semibold text-typography-800">
                                    Há um rascunho guardado na memória física deste dispositivo
                                </p>
                                <p className="text-[11px] text-typography-500">
                                    Último salvamento local em:{" "}
                                    <span className="font-medium text-typography-700">
                                        {dayjs(savedDraftInfo.savedAt).format("DD/MM/YYYY [às] HH:mm:ss")}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleRestoreDraftFromDevice}
                                className="gap-1.5 text-xs text-primary-200 border-primary-200/40 hover:bg-primary-200/10"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restaurar Rascunho</span>
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleDeleteDraftFromDevice}
                                className="gap-1 text-xs text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Alternância Mobile */}
                <div className="flex md:hidden items-center p-1 bg-surface-200 rounded-xl border border-surface-300">
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("form")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            activeTabMobile === "form"
                                ? "bg-white dark:bg-surface-100 text-primary-200 shadow-2xs"
                                : "text-typography-600 hover:text-typography-900"
                        }`}
                    >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Formulário</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("preview")}
                        className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                            activeTabMobile === "preview"
                                ? "bg-white dark:bg-surface-100 text-primary-200 shadow-2xs"
                                : "text-typography-600 hover:text-typography-900"
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualização & Exportação</span>
                    </button>
                </div>

                {/* Grid Formulário + Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Painel do Formulário */}
                    <div
                        className={`lg:col-span-5 flex flex-col gap-4 ${
                            activeTabMobile === "preview" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        {/* Seção 1: Congregação & Data */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-surface-200">
                                <Building2 className="w-4 h-4 text-primary-200" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                    Congregação & Data
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Calendar
                                        label="Data do Documento"
                                        selectedDate={formData.date || null}
                                        handleDateChange={d => handleFieldChange("date", d || "")}
                                        full
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Nome da Congregação
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.congregationName}
                                            onChange={e => handleFieldChange("congregationName", e.target.value)}
                                            placeholder="Ex: Luís Gomes"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Estado (UF)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.congregationState}
                                            onChange={e => handleFieldChange("congregationState", e.target.value)}
                                            placeholder="Ex: RN"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 uppercase"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Irmãos Autorizados */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary-200" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                        Irmãos Autorizados
                                    </h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddBrother}
                                    className="gap-1 text-[11px] h-7 px-2 border-surface-300"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Adicionar Irmão</span>
                                </Button>
                            </div>

                            <p className="text-[11px] text-typography-500">
                                Liste os irmãos que têm autorização para emitir pagamentos da congregação.
                            </p>

                            <div className="space-y-2">
                                {formData.authorizedBrothers.map((brother, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-primary-200/10 text-primary-200 flex items-center justify-center font-bold text-[10px] shrink-0">
                                            {idx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={brother}
                                            onChange={e => handleBrotherChange(idx, e.target.value)}
                                            placeholder="Nome completo do irmão autorizado"
                                            className="flex-1 text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                        />
                                        {formData.authorizedBrothers.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBrother(idx)}
                                                className="text-red-400 hover:text-red-600 p-1.5"
                                                title="Remover irmão"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                    Frase de Introdução (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.bodyText}
                                    onChange={e => handleFieldChange("bodyText", e.target.value)}
                                    placeholder="Irmãos autorizados a fazer pagamentos usando a conta da congregação:"
                                    className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                    Observações Adicionais (Opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={formData.additionalNotes || ""}
                                    onChange={e => handleFieldChange("additionalNotes", e.target.value)}
                                    placeholder="Notas de rodapé adicionais..."
                                    className="w-full text-xs p-3 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 resize-y"
                                />
                            </div>
                        </div>

                        {/* Seção 3: Assinaturas dos Anciãos */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary-200" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                        Assinaturas dos Anciãos
                                    </h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddSignature}
                                    className="gap-1 text-[11px] h-7 px-2 border-surface-300"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Adicionar</span>
                                </Button>
                            </div>

                            <p className="text-[11px] text-typography-500">
                                No documento final, o nome do ancião fica acima da linha e a designação/privilégio abaixo.
                            </p>

                            <div className="space-y-3">
                                {formData.signatures.map((sig, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-xl border border-surface-300 bg-surface-50/50 space-y-2 relative"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold text-typography-600 uppercase">
                                                Assinatura {idx + 1}
                                            </span>
                                            {formData.signatures.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSignature(idx)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                    title="Remover assinatura"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[10px] font-semibold text-typography-500 mb-0.5 block">
                                                    Nome (acima da linha)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sig.name}
                                                    onChange={e => handleSignatureChange(idx, "name", e.target.value)}
                                                    placeholder="Nome do irmão"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold text-typography-500 mb-0.5 block">
                                                    Privilégio / Cargo (abaixo da linha)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={sig.role}
                                                    onChange={e => handleSignatureChange(idx, "role", e.target.value)}
                                                    placeholder="Ex: Coordenador"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Painel de Visualização & Ações de Exportação */}
                    <div
                        className={`lg:col-span-7 flex flex-col gap-4 ${
                            activeTabMobile === "form" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        {/* Barra de Ações Superior do Preview */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 bg-surface-200 p-1 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("sheets")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                                        previewMode === "sheets"
                                            ? "bg-white dark:bg-surface-100 text-primary-200 shadow-2xs"
                                            : "text-typography-600 hover:text-typography-900"
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Folha A4</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("pdf")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                                        previewMode === "pdf"
                                            ? "bg-white dark:bg-surface-100 text-primary-200 shadow-2xs"
                                            : "text-typography-600 hover:text-typography-900"
                                    }`}
                                >
                                    <FileSignature className="w-3.5 h-3.5" />
                                    <span>PDF Real</span>
                                </button>
                            </div>

                            {/* Download do PDF */}
                            <BlobProvider document={<PaymentAuthorizedPdf data={debouncedData} />}>
                                {({ url, loading, error }) => {
                                    return (
                                        <div className="flex items-center gap-2">
                                            {url && !loading && (
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border border-surface-300 hover:bg-surface-200 text-typography-700 font-medium"
                                                >
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    <span>Abrir Nova Aba</span>
                                                </a>
                                            )}

                                            <Button
                                                type="button"
                                                disabled={loading || !!error || !url}
                                                onClick={() => {
                                                    if (!url) return;
                                                    const link = document.createElement("a");
                                                    link.href = url;
                                                    link.download = fileName;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    toast.success("PDF baixado com sucesso!");
                                                }}
                                                className="gap-2 text-xs bg-primary-200 hover:bg-primary-300 text-white font-semibold shadow-sm"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Gerando PDF...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Baixar Documento PDF</span>
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    );
                                }}
                            </BlobProvider>
                        </div>

                        {/* Pré-visualização na Folha */}
                        {previewMode === "sheets" ? (
                            <div className="bg-surface-200/50 border border-surface-300 rounded-2xl p-2 sm:p-4 overflow-x-auto shadow-inner">
                                <PaymentAuthorizedPreview data={formData} />
                            </div>
                        ) : (
                            <div className="bg-surface-200/50 border border-surface-300 rounded-2xl overflow-hidden shadow-inner min-h-[600px] flex flex-col">
                                <UniversalPdfViewer
                                    document={<PaymentAuthorizedPdf data={debouncedData} />}
                                    title="Pessoas Autorizadas a Efetuar Pagamentos"
                                    fileName={fileName}
                                    onSwitchToA4={() => setPreviewMode("sheets")}
                                    minHeight="850px"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentDashboard>
    );
}

PaymentAuthorizedPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"]);

export default PaymentAuthorizedPage;

