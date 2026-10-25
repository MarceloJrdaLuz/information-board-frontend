import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import ContentDashboard from "@/Components/ContentDashboard";
import BankAccountDeclarationPdf from "@/Components/DocumentModels/BankAccountDeclarationPdf";
import BankAccountDeclarationPreview from "@/Components/DocumentModels/BankAccountDeclarationPreview";
import UniversalPdfViewer from "@/Components/UniversalPdfViewer";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useCongregationContext } from "@/context/CongregationContext";
import { DEFAULT_BANK_ACCOUNT_DECLARATION, IBankAccountDeclarationData } from "@/types/documentModels";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import {
    AlertCircle,
    Building2,
    CreditCard,
    Download,
    ExternalLink,
    Eye,
    FileEdit,
    FileSignature,
    HardDrive,
    Layers,
    Loader2,
    Lock,
    RotateCcw,
    Save,
    Sparkles,
    Trash2,
    UserCheck
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const DRAFT_STORAGE_KEY = "@information_board:declaracao_conta_draft";

interface IDraftStorage {
    savedAt: string;
    data: IBankAccountDeclarationData;
}

function BankAccountDeclarationPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();

    const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");
    const [previewMode, setPreviewMode] = useState<"sheets" | "pdf">("sheets");

    const [formData, setFormData] = useState<IBankAccountDeclarationData>(() => ({
        ...DEFAULT_BANK_ACCOUNT_DECLARATION,
        date: dayjs().format("YYYY-MM-DD"),
        congregationName: congregation?.name || "",
        city: congregation?.city || "",
        state: "",
    }));

    const [savedDraftInfo, setSavedDraftInfo] = useState<IDraftStorage | null>(null);

    // Carrega rascunho salvo no dispositivo ao abrir
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

    // Atualiza com os dados da congregação
    useEffect(() => {
        if (congregation) {
            setFormData(prev => ({
                ...prev,
                congregationName: prev.congregationName || congregation.name || "",
                city: prev.city || congregation.city || "",
                
            }));
        }
    }, [congregation]);

    // Configura breadcrumbs e menu ativo
    useEffect(() => {
        setPageActive("/modelos/declaracao-conta");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Modelos", link: "/modelos" },
            { label: "Declaração de conta", link: "/modelos/declaracao-conta" }
        ]);
    }, [setCrumbs, setPageActive]);

    // Debounce leve para renderização do PDF
    const [debouncedData, setDebouncedData] = useState<IBankAccountDeclarationData>(formData);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedData(formData), 350);
        return () => clearTimeout(timer);
    }, [formData]);

    const handleFieldChange = (field: keyof IBankAccountDeclarationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            declarantName: "Carlos Eduardo da Silva",
            declarantNationality: "brasileiro",
            declarantCivilStatus: "casado, servidor público",
            declarantRg: "1.234.567 SSP/RN",
            declarantCpf: "123.456.789-00",
            bankName: "Banco do Brasil",
            agencyNumber: "1234-5",
            accountNumber: "98765-4",
            congregationName: congregation?.name || "Luís Gomes",
            associationName: "Associação Bíblica e Cultural de Luís Gomes",
            associationCnpj: "00.000.000/0001-00",
            associationAddress: "Rua das Flores, 120, Centro, Luís Gomes - RN",
            city: congregation?.city || "Luís Gomes",
            state: "RN",
            date: dayjs().format("YYYY-MM-DD"),
            bodyText: "",
            additionalNotes: "",
            documentTitle: "Declaração de Titularidade de Conta Bancária",
        });
        toast.success("Exemplo preenchido com sucesso!");
    };

    const handleClearForm = () => {
        setFormData({
            ...DEFAULT_BANK_ACCOUNT_DECLARATION,
            date: dayjs().format("YYYY-MM-DD"),
            congregationName: congregation?.name || "",
            city: congregation?.city || "",
            state: "",
        });
        toast.info("Campos da tela limpos.");
    };

    const fileName = useMemo(() => {
        const dateStr = formData.date || dayjs().format("YYYY-MM-DD");
        return `declaracao_conta_bancaria_${dateStr}.pdf`;
    }, [formData.date]);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Declaração de conta" />

                {/* Banner de Cabeçalho */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-3 bg-primary-200/10 text-primary-200 rounded-2xl shrink-0">
                            <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                                    Declaração de Titularidade de Conta Bancária
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
                                Declaração atestando que os valores depositados na conta bancária pertencem à Congregação.
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
                            <div className="p-2.5 bg-primary-200/10 text-primary-200 rounded-xl shrink-0">
                                <HardDrive className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-typography-800">
                                        Rascunho salvo neste dispositivo
                                    </span>
                                    <span className="text-[11px] bg-primary-200/10 text-primary-200 px-2 py-0.5 rounded-full font-semibold">
                                        Salvo em {dayjs(savedDraftInfo.savedAt).format("DD/MM/YYYY [às] HH:mm")}
                                    </span>
                                </div>
                                <p className="text-[11px] text-typography-500 mt-0.5">
                                    Armazenado <strong>apenas na memória física deste aparelho</strong> (offline e 100% privado).
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleRestoreDraftFromDevice}
                                className="h-8 text-xs gap-1.5 bg-primary-200 hover:bg-primary-300 text-white font-semibold"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Restaurar Rascunho</span>
                            </Button>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={handleDeleteDraftFromDevice}
                                className="h-8 text-xs gap-1.5 border-surface-300 text-red-500 hover:bg-red-500/10"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Excluir do dispositivo</span>
                            </Button>
                        </div>
                    </div>
                )}

                {/* Alternador Mobile */}
                <div className="flex lg:hidden bg-surface-200/80 p-1 rounded-xl border border-surface-300 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("form")}
                        className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            activeTabMobile === "form"
                                ? "bg-surface-100 text-primary-200 shadow-xs"
                                : "text-typography-600 hover:text-typography-800"
                        }`}
                    >
                        <FileEdit className="w-4 h-4" />
                        <span>Preencher Formulário</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTabMobile("preview")}
                        className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-2 ${
                            activeTabMobile === "preview"
                                ? "bg-surface-100 text-primary-200 shadow-xs"
                                : "text-typography-600 hover:text-typography-800"
                        }`}
                    >
                        <Eye className="w-4 h-4" />
                        <span>Visualização Folha A4</span>
                    </button>
                </div>

                {/* Grid Principal */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Formulário (Esquerda) */}
                    <div className={`lg:col-span-6 flex flex-col gap-4 ${activeTabMobile === "preview" ? "hidden lg:flex" : ""}`}>
                        {/* 1. Dados do Declarante */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200">
                                <UserCheck className="w-4 h-4 text-primary-200" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                    Dados do Declarante (Titular da Conta)
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={formData.declarantName}
                                        onChange={e => handleFieldChange("declarantName", e.target.value)}
                                        placeholder="Ex: Carlos Eduardo da Silva"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800 font-semibold"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Nacionalidade</label>
                                    <input
                                        type="text"
                                        value={formData.declarantNationality}
                                        onChange={e => handleFieldChange("declarantNationality", e.target.value)}
                                        placeholder="Ex: brasileiro"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Estado Civil / Profissão</label>
                                    <input
                                        type="text"
                                        value={formData.declarantCivilStatus}
                                        onChange={e => handleFieldChange("declarantCivilStatus", e.target.value)}
                                        placeholder="Ex: casado, autônomo"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">RG nº</label>
                                    <input
                                        type="text"
                                        value={formData.declarantRg}
                                        onChange={e => handleFieldChange("declarantRg", e.target.value)}
                                        placeholder="Ex: 1.234.567 SSP/RN"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">CPF nº</label>
                                    <input
                                        type="text"
                                        value={formData.declarantCpf}
                                        onChange={e => handleFieldChange("declarantCpf", e.target.value)}
                                        placeholder="Ex: 123.456.789-00"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Dados da Conta Bancária */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200">
                                <CreditCard className="w-4 h-4 text-primary-200" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                    Dados Bancários
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Banco</label>
                                    <input
                                        type="text"
                                        value={formData.bankName}
                                        onChange={e => handleFieldChange("bankName", e.target.value)}
                                        placeholder="Ex: Banco do Brasil"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Agência nº</label>
                                    <input
                                        type="text"
                                        value={formData.agencyNumber}
                                        onChange={e => handleFieldChange("agencyNumber", e.target.value)}
                                        placeholder="Ex: 1234-5"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Conta Corrente nº</label>
                                    <input
                                        type="text"
                                        value={formData.accountNumber}
                                        onChange={e => handleFieldChange("accountNumber", e.target.value)}
                                        placeholder="Ex: 98765-4"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Congregação e Associação */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center gap-2 pb-2.5 border-b border-surface-200">
                                <Building2 className="w-4 h-4 text-primary-200" />
                                <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                    Congregação e Associação Legal
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Congregação</label>
                                    <input
                                        type="text"
                                        value={formData.congregationName}
                                        onChange={e => handleFieldChange("congregationName", e.target.value)}
                                        placeholder="Ex: Luís Gomes"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800 font-semibold"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Associação Bíblica e Cultural</label>
                                    <input
                                        type="text"
                                        value={formData.associationName}
                                        onChange={e => handleFieldChange("associationName", e.target.value)}
                                        placeholder="Ex: Associação Bíblica e Cultural de..."
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">CNPJ da Associação</label>
                                    <input
                                        type="text"
                                        value={formData.associationCnpj}
                                        onChange={e => handleFieldChange("associationCnpj", e.target.value)}
                                        placeholder="Ex: 00.000.000/0001-00"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="sm:col-span-2 flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Endereço Completo da Sede</label>
                                    <input
                                        type="text"
                                        value={formData.associationAddress}
                                        onChange={e => handleFieldChange("associationAddress", e.target.value)}
                                        placeholder="Ex: Rua das Flores, 120, Centro, Luís Gomes - RN"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. Data e Localização */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">Cidade</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => handleFieldChange("city", e.target.value)}
                                        placeholder="Ex: Luís Gomes"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                    />
                                </div>

                                <div className="flex flex-col gap-1">
                                    <label className="text-xs font-semibold text-typography-700">UF</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={e => handleFieldChange("state", e.target.value)}
                                        placeholder="Ex: RN"
                                        className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800 uppercase"
                                    />
                                </div>

                                <Calendar
                                    label="Data da Declaração"
                                    selectedDate={formData.date || null}
                                    handleDateChange={(d) => handleFieldChange("date", d || "")}
                                    full
                                />
                            </div>
                        </div>

                        {/* 5. Texto Customizado / Edição Livre */}
                        <div className="bg-surface-100 p-4 sm:p-5 rounded-2xl border border-surface-300 shadow-xs flex flex-col gap-3">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <FileEdit className="w-4 h-4 text-primary-200" />
                                    <h3 className="font-bold text-xs uppercase tracking-wider text-typography-800">
                                        Texto da Declaração (Opcional para personalização)
                                    </h3>
                                </div>
                                <span className="text-[11px] text-typography-500 italic">
                                    Gera automaticamente se em branco
                                </span>
                            </div>

                            <p className="text-[11px] text-typography-500 leading-relaxed">
                                Se desejar alterar a redação ou incluir termos específicos, digite abaixo. Deixe em branco para usar a redação padrão com os campos preenchidos acima.
                            </p>

                            <textarea
                                rows={6}
                                value={formData.bodyText}
                                onChange={e => handleFieldChange("bodyText", e.target.value)}
                                placeholder="Deixe em branco para usar o texto padrão oficial ou personalize como preferir..."
                                className="w-full p-3 text-xs font-mono leading-relaxed border rounded-xl bg-surface-100 border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary-200 text-typography-800"
                            />

                            <div className="flex flex-col gap-1 pt-1">
                                <label className="text-xs font-semibold text-typography-700">
                                    Observações Adicionais (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.additionalNotes || ""}
                                    onChange={e => handleFieldChange("additionalNotes", e.target.value)}
                                    placeholder="Ex: Declaração solicitada para fins bancários de rotina..."
                                    className="p-2 text-xs border rounded-lg bg-surface-100 border-surface-300 text-typography-800"
                                />
                            </div>
                        </div>

                        {/* Barra de Ações Flutuante */}
                        <div className="sticky bottom-4 z-20 flex items-center gap-3 p-3.5 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-2xl shadow-lg">
                            <BlobProvider document={<BankAccountDeclarationPdf data={debouncedData} />}>
                                {({ url, loading, error }) => {
                                    const isDisabled = loading || !!error || !url;
                                    return (
                                        <>
                                            <a
                                                href={url || "#"}
                                                download={fileName}
                                                className={`flex-1 ${isDisabled ? "pointer-events-none" : ""}`}
                                            >
                                                <Button
                                                    disabled={isDisabled}
                                                    className="w-full bg-primary-200 hover:bg-primary-300 text-white font-bold text-xs gap-2 h-10 shadow-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    <span>{loading ? "Gerando PDF..." : "Baixar Declaração em PDF"}</span>
                                                </Button>
                                            </a>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={isDisabled}
                                                onClick={() => {
                                                    if (url) window.open(url, "_blank");
                                                }}
                                                className="h-10 text-xs gap-1.5 border-surface-300 hover:bg-surface-200 shrink-0"
                                                title="Visualizar PDF no navegador"
                                            >
                                                <ExternalLink className="w-4 h-4 text-typography-600" />
                                                <span className="hidden sm:inline">Visualizar</span>
                                            </Button>
                                        </>
                                    );
                                }}
                            </BlobProvider>
                        </div>
                    </div>

                    {/* Preview (Direita) */}
                    <div className={`lg:col-span-6 flex flex-col gap-3 sticky top-4 ${activeTabMobile === "form" ? "hidden lg:flex" : ""}`}>
                        {/* Seletor de Modo */}
                        <div className="flex items-center justify-between px-1 flex-wrap gap-2">
                            <div className="flex items-center gap-1.5 bg-surface-200/90 p-1 rounded-xl border border-surface-300 text-xs font-semibold">
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("sheets")}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        previewMode === "sheets"
                                            ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                                            : "text-typography-600 hover:text-typography-800"
                                    }`}
                                >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>Folha A4</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewMode("pdf")}
                                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                                        previewMode === "pdf"
                                            ? "bg-surface-100 text-primary-200 shadow-2xs font-bold"
                                            : "text-typography-600 hover:text-typography-800"
                                    }`}
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>PDF Oficial</span>
                                </button>
                            </div>

                            <BlobProvider document={<BankAccountDeclarationPdf data={debouncedData} />}>
                                {({ url, loading }) => (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={loading || !url}
                                        onClick={() => {
                                            if (url) window.open(url, "_blank");
                                        }}
                                        className="h-8 text-xs border-surface-300 gap-1.5 hover:bg-surface-200"
                                    >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        <span>Abrir em Nova Aba</span>
                                    </Button>
                                )}
                            </BlobProvider>
                        </div>

                        {/* Visualizador */}
                        {previewMode === "sheets" ? (
                            <div className="max-h-[85vh] overflow-y-auto p-3 sm:p-5 bg-zinc-200/70 dark:bg-zinc-900/70 rounded-2xl border border-surface-300 shadow-inner flex justify-center">
                                <BankAccountDeclarationPreview data={formData} />
                            </div>
                        ) : (
                            <div className="h-[85vh] w-full rounded-2xl border border-surface-300 shadow-inner bg-zinc-200/50 overflow-hidden flex flex-col">
                                <UniversalPdfViewer
                                    document={<BankAccountDeclarationPdf data={debouncedData} />}
                                    title="Declaração de Abertura de Conta Bancária"
                                    fileName={fileName}
                                    onSwitchToA4={() => setPreviewMode("sheets")}
                                    minHeight="85vh"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentDashboard>
    );
}

BankAccountDeclarationPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"]);

export default BankAccountDeclarationPage;

