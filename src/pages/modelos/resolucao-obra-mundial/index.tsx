import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import ContentDashboard from "@/Components/ContentDashboard";
import WorldwideWorkResolutionPdf from "@/Components/DocumentModels/WorldwideWorkResolutionPdf";
import WorldwideWorkResolutionPreview from "@/Components/DocumentModels/WorldwideWorkResolutionPreview";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useCongregationContext } from "@/context/CongregationContext";
import { DEFAULT_WORLDWIDE_WORK_RESOLUTION, IWorldwideWorkResolutionData } from "@/types/documentModels";
import { ISignaturePerson } from "@/types/letterGenerator";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    DollarSign,
    Download,
    ExternalLink,
    Eye,
    FileEdit,
    FileSignature,
    Globe,
    HardDrive,
    Layers,
    Loader2,
    Plus,
    RotateCcw,
    Sparkles,
    Trash2,
    UserCheck
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const DRAFT_STORAGE_KEY = "@information_board:resolucao_obra_mundial_draft";

interface IDraftStorage {
    savedAt: string;
    data: IWorldwideWorkResolutionData;
}

function WorldwideWorkResolutionPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();

    const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");
    const [previewMode, setPreviewMode] = useState<"sheets" | "pdf">("sheets");

    const [formData, setFormData] = useState<IWorldwideWorkResolutionData>(() => ({
        ...DEFAULT_WORLDWIDE_WORK_RESOLUTION,
        approvalDate: dayjs().format("YYYY-MM-DD"),
        congregationName: congregation?.name || "",
        congregationState: "",
        congregationNumber: congregation?.number ? String(congregation.number) : "",
    }));

    const [savedDraftInfo, setSavedDraftInfo] = useState<IDraftStorage | null>(null);

    // Carrega rascunho do dispositivo
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
                
                congregationNumber: prev.congregationNumber || (congregation.number ? String(congregation.number) : ""),
            }));
        }
    }, [congregation]);

    // Configura breadcrumbs e menu ativo
    useEffect(() => {
        setPageActive("/modelos/resolucao-obra-mundial");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Modelos", link: "/modelos" },
            { label: "Resolução obra mundial", link: "/modelos/resolucao-obra-mundial" }
        ]);
    }, [setCrumbs, setPageActive]);

    // Debounce leve para renderização do PDF
    const [debouncedData, setDebouncedData] = useState<IWorldwideWorkResolutionData>(formData);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedData(formData), 350);
        return () => clearTimeout(timer);
    }, [formData]);

    const handleFieldChange = (field: keyof IWorldwideWorkResolutionData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Assinaturas
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
            title: "Resolução para Obra Mundial",
            congregationName: congregation?.name || "Luís Gomes",
            congregationState: "RN",
            congregationNumber: congregation?.number ? String(congregation.number) : "12345",
            monthlyAmount: "150,00",
            serviceYear: String(new Date().getFullYear() + 1),
            approvalDate: dayjs().format("YYYY-MM-DD"),
            bodyText: "",
            additionalNotes: "",
            signatures: [
                { name: "Carlos Eduardo Silva", role: "Coordenador" },
                { name: "Antônio Marcos Rocha", role: "Secretário" },
                { name: "José Roberto Lima", role: "Supte. Serviço" },
            ],
            documentTitle: "Resolução para Obra Mundial",
        });
        toast.success("Exemplo preenchido com sucesso!");
    };

    const handleClearForm = () => {
        setFormData({
            ...DEFAULT_WORLDWIDE_WORK_RESOLUTION,
            approvalDate: dayjs().format("YYYY-MM-DD"),
            congregationName: congregation?.name || "",
            congregationState: "",
            congregationNumber: congregation?.number ? String(congregation.number) : "",
        });
        toast.info("Campos da tela limpos.");
    };

    const fileName = useMemo(() => {
        const year = formData.serviceYear || dayjs().format("YYYY");
        return `resolucao_obra_mundial_${year}.pdf`;
    }, [formData.serviceYear]);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Resolução obra mundial" />

                {/* Banner de Cabeçalho */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-3 bg-primary-200/10 text-primary-200 rounded-2xl shrink-0">
                            <Globe className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                                    Resolução para Obra Mundial
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
                                Documento formalizando a resolução adotada pela congregação para envio mensal de donativo à Obra Mundial.
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
                                    Dados da Congregação
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div>
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

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                    <div>
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Número da Congregação
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.congregationNumber}
                                            onChange={e => handleFieldChange("congregationNumber", e.target.value)}
                                            placeholder="Ex: 12345"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Calendar
                                        label="Data de Aprovação"
                                        selectedDate={formData.approvalDate || null}
                                        handleDateChange={d => handleFieldChange("approvalDate", d || "")}
                                        full
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Detalhes da Resolução */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-surface-200">
                                <DollarSign className="w-4 h-4 text-primary-200" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                    Valor & Ano de Serviço
                                </h3>
                            </div>

                            <div className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Donativo Mensal (R$)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.monthlyAmount}
                                            onChange={e => handleFieldChange("monthlyAmount", e.target.value)}
                                            placeholder="Ex: 150,00"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 font-semibold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Ano de Serviço
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.serviceYear}
                                            onChange={e => handleFieldChange("serviceYear", e.target.value)}
                                            placeholder="Ex: 2027"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 font-semibold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-typography-700 mb-1 flex items-center justify-between">
                                        <span>Texto Customizado (Opcional)</span>
                                        <span className="text-[10px] text-typography-400 font-normal">
                                            Deixe em branco para usar a redação padrão
                                        </span>
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={formData.bodyText}
                                        onChange={e => handleFieldChange("bodyText", e.target.value)}
                                        placeholder="Caso queira alterar ou acrescentar termos específicos, digite aqui..."
                                        className="w-full text-xs p-3 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 resize-y leading-relaxed"
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
                            <BlobProvider document={<WorldwideWorkResolutionPdf data={debouncedData} />}>
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
                                <WorldwideWorkResolutionPreview data={formData} />
                            </div>
                        ) : (
                            <div className="bg-surface-200/50 border border-surface-300 rounded-2xl overflow-hidden shadow-inner min-h-[850px] flex items-center justify-center">
                                <BlobProvider document={<WorldwideWorkResolutionPdf data={debouncedData} />}>
                                    {({ url, loading, error }) => {
                                        if (loading) {
                                            return (
                                                <div className="flex flex-col items-center justify-center gap-2 p-8 text-typography-600">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary-200" />
                                                    <span className="text-xs font-medium">Renderizando PDF...</span>
                                                </div>
                                            );
                                        }
                                        if (error || !url) {
                                            return (
                                                <div className="flex flex-col items-center justify-center gap-2 p-8 text-red-500 text-center">
                                                    <AlertCircle className="w-8 h-8" />
                                                    <span className="text-xs font-semibold">
                                                        Erro ao renderizar PDF. Use a visualização em Folha A4.
                                                    </span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <iframe
                                                src={`${url}#toolbar=0&navpanes=0`}
                                                className="w-full h-full border-0 bg-white min-h-[850px]"
                                                title="Pré-visualização do Documento PDF Oficial"
                                            />
                                        );
                                    }}
                                </BlobProvider>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentDashboard>
    );
}

WorldwideWorkResolutionPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"]);

export default WorldwideWorkResolutionPage;

