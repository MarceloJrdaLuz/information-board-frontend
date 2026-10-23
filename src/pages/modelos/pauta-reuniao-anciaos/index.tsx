import BreadCrumbs from "@/Components/BreadCrumbs";
import Calendar from "@/Components/Calendar";
import ContentDashboard from "@/Components/ContentDashboard";
import EldersMeetingAgendaPdf from "@/Components/DocumentModels/EldersMeetingAgendaPdf";
import EldersMeetingAgendaPreview from "@/Components/DocumentModels/EldersMeetingAgendaPreview";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useCongregationContext } from "@/context/CongregationContext";
import {
    DEFAULT_AGENDA_FOOTER_NOTE,
    DEFAULT_ELDERS_MEETING_AGENDA,
    IAgendaRecommendationItem,
    IAgendaRemovalItem,
    IAgendaTopicItem,
    IEldersMeetingAgendaData
} from "@/types/documentModels";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { BlobProvider } from "@react-pdf/renderer";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import {
    AlertCircle,
    Building2,
    CalendarDays,
    ClipboardList,
    ClipboardPaste,
    Clock,
    Download,
    ExternalLink,
    Eye,
    FileEdit,
    FileSignature,
    HardDrive,
    Layers,
    Loader2,
    Plus,
    Quote,
    RotateCcw,
    Sparkles,
    Trash2,
    UserCheck,
    UserMinus,
    Users
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const DRAFT_STORAGE_KEY = "@information_board:pauta_reuniao_anciaos_draft";

interface IDraftStorage {
    savedAt: string;
    data: IEldersMeetingAgendaData;
}

function EldersMeetingAgendaPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();

    const [activeTabMobile, setActiveTabMobile] = useState<"form" | "preview">("form");
    const [previewMode, setPreviewMode] = useState<"sheets" | "pdf">("sheets");
    const [openExcerptIds, setOpenExcerptIds] = useState<Record<string, boolean>>({});

    const [formData, setFormData] = useState<IEldersMeetingAgendaData>(() => ({
        ...DEFAULT_ELDERS_MEETING_AGENDA,
        congregationName: congregation?.name || "",
        locationAndDate: `Salão do Reino — ${dayjs().format("DD/MM/YYYY")}`,
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
        if (congregation?.name) {
            setFormData(prev => ({
                ...prev,
                congregationName: prev.congregationName || congregation.name,
            }));
        }
    }, [congregation]);

    // Configura breadcrumbs e menu ativo
    useEffect(() => {
        setPageActive("/modelos/pauta-reuniao-anciaos");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Modelos", link: "/modelos" },
            { label: "Pauta de reunião de anciãos", link: "/modelos/pauta-reuniao-anciaos" }
        ]);
    }, [setCrumbs, setPageActive]);

    // Debounce leve para renderização do PDF
    const [debouncedData, setDebouncedData] = useState<IEldersMeetingAgendaData>(formData);
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedData(formData), 350);
        return () => clearTimeout(timer);
    }, [formData]);

    const handleFieldChange = (field: keyof IEldersMeetingAgendaData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Assuntos da Pauta
    const handleAddTopic = () => {
        const newId = `topic_${Date.now()}`;
        setFormData(prev => ({
            ...prev,
            topics: [
                ...prev.topics,
                { id: newId, subject: "", reference: "", referenceText: "", duration: "", suggestedBy: "" }
            ]
        }));
    };

    const handleRemoveTopic = (index: number) => {
        setFormData(prev => ({
            ...prev,
            topics: prev.topics.filter((_, i) => i !== index)
        }));
    };

    const handleTopicChange = (index: number, field: keyof IAgendaTopicItem, value: string) => {
        setFormData(prev => {
            const next = [...prev.topics];
            next[index] = {
                ...next[index],
                [field]: field === "subject" ? value.toUpperCase() : value
            };
            return { ...prev, topics: next };
        });
    };

    const handlePasteParagraph = async (index: number, topicId: string) => {
        setOpenExcerptIds(prev => ({ ...prev, [topicId]: true }));
        try {
            if (navigator?.clipboard?.readText) {
                const text = await navigator.clipboard.readText();
                if (text && text.trim()) {
                    setFormData(prev => {
                        const next = [...prev.topics];
                        const current = next[index]?.referenceText?.trim() || "";
                        const merged = current ? `${current}\n\n${text.trim()}` : text.trim();
                        next[index] = { ...next[index], referenceText: merged };
                        return { ...prev, topics: next };
                    });
                    toast.info(`Parágrafo colado com sucesso no Assunto #${index + 1}!`);
                } else {
                    toast.warning("A área de transferência está vazia ou sem texto.");
                }
            } else {
                toast.warning("Seu navegador não suporta colar automático. Cole manualmente no campo.");
            }
        } catch (e) {
            console.error("Erro ao colar da área de transferência:", e);
            toast.info("Permita o acesso à área de transferência para colar automaticamente.");
        }
    };

    // Recomendações
    const handleAddRecommendation = (type: "elder" | "servant") => {
        const item: IAgendaRecommendationItem = {
            id: `${type}_${Date.now()}`,
            name: "",
            decision: "",
            notes: "",
            birthDate: "",
            baptismDate: "",
            yearsAsServant: type === "elder" ? "" : undefined,
        };

        setFormData(prev => {
            if (type === "elder") {
                return { ...prev, elderRecommendations: [...prev.elderRecommendations, item] };
            }
            return { ...prev, servantRecommendations: [...prev.servantRecommendations, item] };
        });
    };

    const handleRemoveRecommendation = (type: "elder" | "servant", index: number) => {
        setFormData(prev => {
            if (type === "elder") {
                return {
                    ...prev,
                    elderRecommendations: prev.elderRecommendations.filter((_, i) => i !== index)
                };
            }
            return {
                ...prev,
                servantRecommendations: prev.servantRecommendations.filter((_, i) => i !== index)
            };
        });
    };

    const handleRecommendationChange = (
        type: "elder" | "servant",
        index: number,
        field: keyof IAgendaRecommendationItem,
        value: string
    ) => {
        setFormData(prev => {
            if (type === "elder") {
                const next = [...prev.elderRecommendations];
                next[index] = { ...next[index], [field]: value };
                return { ...prev, elderRecommendations: next };
            }
            const next = [...prev.servantRecommendations];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, servantRecommendations: next };
        });
    };

    // Remoções
    const handleAddRemoval = () => {
        const item: IAgendaRemovalItem = {
            id: `removal_${Date.now()}`,
            role: "elder",
            name: "",
            reason: ""
        };
        setFormData(prev => ({
            ...prev,
            removals: [...prev.removals, item]
        }));
    };

    const handleRemoveRemoval = (index: number) => {
        setFormData(prev => ({
            ...prev,
            removals: prev.removals.filter((_, i) => i !== index)
        }));
    };

    const handleRemovalChange = (
        index: number,
        field: keyof IAgendaRemovalItem,
        value: any
    ) => {
        setFormData(prev => {
            const next = [...prev.removals];
            next[index] = { ...next[index], [field]: value };
            return { ...prev, removals: next };
        });
    };

    // Rascunho Local no Dispositivo
    const handleSaveDraftToDevice = () => {
        try {
            const payload: IDraftStorage = {
                savedAt: new Date().toISOString(),
                data: formData,
            };
            localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
            setSavedDraftInfo(payload);
            toast.success("Rascunho da pauta salvo exclusivamente neste dispositivo!");
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

    // Carregar Exemplo Prático Completo
    const handleLoadSample = () => {
        setFormData({
            congregationName: congregation?.name || "Luís Gomes",
            locationAndDate: `Salão do Reino — ${dayjs().format("DD/MM/YYYY")}`,
            openingPrayer: "Antônio Marcos Rocha",
            closingPrayer: "José Roberto Lima",
            topics: [
                {
                    id: "topic_1",
                    subject: "PASTOREIO E ASSISTÊNCIA ESPIRITUAL",
                    reference: "sfl cap. 25 §§ 1-6; 1 Ped. 5:2, 3",
                    referenceText: "Os anciãos devem se esforçar para visitar cada publicador da congregação pelo menos uma vez por ano, dando encorajamento amoroso e suporte bíblico personalizado.",
                    duration: "15 min",
                    suggestedBy: "Coordenador",
                },
                {
                    id: "topic_2",
                    subject: "ARRANJO DE SAÍDAS DE CAMPO E TESTEMUNHO PÚBLICO",
                    reference: "Carta 15/01/2026; od cap. 9 §§ 14-18",
                    referenceText: "Revisar a cobertura dos territórios durante os fins de semana e os pontos de testemunho público com carrinho para assegurar que todos os pioneiros tenham apoio.",
                    duration: "10 min",
                    suggestedBy: "Supte. Serviço",
                },
                {
                    id: "topic_3",
                    subject: "LIMPEZA E MANUTENÇÃO PREVENTIVA DO SALÃO DO REINO",
                    reference: "sfl cap. 20 §§ 12-14",
                    referenceText: "Avaliar o cronograma dos grupos de limpeza e a revisão semestral dos condicionadores de ar e instalações elétricas.",
                    duration: "10 min",
                    suggestedBy: "Secretário",
                },
            ],
            elderRecommendations: [
                {
                    id: "elder_rec_1",
                    name: "Marcos Paulo de Freitas",
                    decision: "Aprovado por unanimidade",
                    notes: "Excelente pastor, boa oratória e família exemplar.",
                    birthDate: "14/05/1982",
                    baptismDate: "20/09/1998",
                    yearsAsServant: "8 anos",
                }
            ],
            servantRecommendations: [
                {
                    id: "servant_rec_1",
                    name: "Lucas Gabriel Santos",
                    decision: "Aprovado",
                    notes: "Zeloso no som e literatura, pontual e exemplar no campo.",
                    birthDate: "03/11/1997",
                    baptismDate: "12/04/2014",
                }
            ],
            removals: [
                {
                    id: "removal_1",
                    role: "servant",
                    name: "Thiago Ramos Lima",
                    reason: "Mudança de congregação para Mossoró/RN",
                }
            ],
            footerNote: DEFAULT_AGENDA_FOOTER_NOTE,
            documentTitle: "Pauta da Reunião do Corpo de Anciãos",
        });
        toast.success("Exemplo prático preenchido com sucesso!");
    };

    const handleClearForm = () => {
        setFormData({
            ...DEFAULT_ELDERS_MEETING_AGENDA,
            congregationName: congregation?.name || "",
            locationAndDate: `Salão do Reino — ${dayjs().format("DD/MM/YYYY")}`,
        });
        toast.info("Campos da pauta limpos.");
    };

    const fileName = useMemo(() => {
        const dateStr = dayjs().format("YYYY-MM-DD");
        return `pauta_reuniao_anciaos_${dateStr}.pdf`;
    }, []);

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-[1600px] mx-auto w-full">
                <BreadCrumbs crumbs={crumbs} pageActive="Pauta de reunião de anciãos" />

                {/* Banner de Cabeçalho */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3.5">
                        <div className="p-3 bg-[#1e3a5f]/10 text-[#1e3a5f] dark:text-sky-400 rounded-2xl shrink-0">
                            <ClipboardList className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-lg sm:text-xl font-bold text-typography-900">
                                    Pauta da Reunião do Corpo de Anciãos
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
                                Formate a pauta oficial de reuniões de anciãos com assuntos, durações, referências, trechos colados com 1 clique e recomendações.
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
                                    Há uma pauta guardada na memória física deste dispositivo
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
                        {/* Seção 1: Dados Gerais da Reunião */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-surface-200">
                                <Building2 className="w-4 h-4 text-primary-200" />
                                <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                    Dados Gerais da Reunião
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

                                <div>
                                    <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                        Local e Data
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.locationAndDate}
                                        onChange={e => handleFieldChange("locationAndDate", e.target.value)}
                                        placeholder="Ex: Salão do Reino — 25/10/2026"
                                        className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Oração Inicial
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.openingPrayer}
                                            onChange={e => handleFieldChange("openingPrayer", e.target.value)}
                                            placeholder="Nome do irmão"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-typography-700 mb-1 block">
                                            Oração Final
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.closingPrayer}
                                            onChange={e => handleFieldChange("closingPrayer", e.target.value)}
                                            placeholder="Nome do irmão"
                                            className="w-full text-xs px-3 py-2 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Assuntos da Pauta */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-200">
                                <div className="flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-primary-200" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                        Assuntos da Pauta ({formData.topics.length})
                                    </h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleAddTopic}
                                    className="gap-1 text-[11px] h-7 px-2 border-surface-300"
                                >
                                    <Plus className="w-3 h-3" />
                                    <span>Adicionar Assunto</span>
                                </Button>
                            </div>

                            <p className="text-[11px] text-typography-500">
                                Digite os assuntos em discussão. O botão <strong>Colar trecho</strong> permite anexar o parágrafo copiado do JW Library/WOL com 1 clique.
                            </p>

                            <div className="space-y-4">
                                {formData.topics.map((topic, idx) => {
                                    const topicKey = topic.id || `topic_${idx}`;
                                    const isExcerptOpen = Boolean(topic.referenceText?.trim() || openExcerptIds[topicKey]);

                                    return (
                                        <div
                                            key={topicKey}
                                            className="p-3.5 rounded-2xl border border-surface-300 bg-surface-50/60 space-y-3 relative transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-typography-600 uppercase flex items-center gap-1.5">
                                                    <span className="w-5 h-5 rounded-full bg-primary-200/10 text-primary-200 flex items-center justify-center text-[10px]">
                                                        {idx + 1}
                                                    </span>
                                                    Assunto #{idx + 1}
                                                </span>
                                                {formData.topics.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTopic(idx)}
                                                        className="text-red-400 hover:text-red-600 p-1 rounded-lg"
                                                        title="Remover assunto"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Assunto e Duração */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                                                <div className="sm:col-span-3">
                                                    <label className="text-[10px] font-semibold text-typography-500 mb-0.5 block">
                                                        Tema / Assunto (Caixa Alta)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={topic.subject}
                                                        onChange={e => handleTopicChange(idx, "subject", e.target.value)}
                                                        placeholder="Ex: PASTOREIO E ASSISTÊNCIA"
                                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 font-bold uppercase focus:outline-hidden focus:border-primary-200 text-typography-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-semibold text-typography-500 mb-0.5 block">
                                                        Tempo (Opcional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={topic.duration || ""}
                                                        onChange={e => handleTopicChange(idx, "duration", e.target.value)}
                                                        placeholder="Ex: 10 min"
                                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-center focus:outline-hidden focus:border-primary-200 text-typography-800 font-semibold"
                                                    />
                                                </div>
                                            </div>

                                            {/* Referência e Indicado por */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div>
                                                    <label className="text-[10px] font-semibold text-typography-500 mb-0.5 block">
                                                        Referência Teocrática
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={topic.reference}
                                                        onChange={e => handleTopicChange(idx, "reference", e.target.value)}
                                                        placeholder="Ex: sfl cap. 25 §§ 1-6"
                                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-semibold text-typography-500 mb-0.5 block">
                                                        Indicado por (Opcional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={topic.suggestedBy || ""}
                                                        onChange={e => handleTopicChange(idx, "suggestedBy", e.target.value)}
                                                        placeholder="Ex: Coordenador"
                                                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800"
                                                    />
                                                </div>
                                            </div>

                                            {/* Parágrafo de Referência Colado */}
                                            {!isExcerptOpen ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handlePasteParagraph(idx, topicKey)}
                                                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary-200 hover:underline pt-0.5"
                                                >
                                                    <ClipboardPaste className="w-3.5 h-3.5" />
                                                    <span>+ Colar parágrafo da referência da área de transferência</span>
                                                </button>
                                            ) : (
                                                <div className="bg-primary-200/5 border-l-4 border-l-primary-200 border border-surface-300 rounded-r-xl rounded-l-xs p-2.5 space-y-2">
                                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200 flex items-center gap-1">
                                                            <Quote className="w-3 h-3" />
                                                            Trecho / Parágrafo da Referência
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => handlePasteParagraph(idx, topicKey)}
                                                                className="text-[10px] font-bold text-primary-200 hover:underline inline-flex items-center gap-1"
                                                            >
                                                                <ClipboardPaste className="w-3 h-3" />
                                                                <span>Colar copiado</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    handleTopicChange(idx, "referenceText", "");
                                                                    setOpenExcerptIds(prev => ({ ...prev, [topicKey]: false }));
                                                                }}
                                                                className="text-[10px] font-semibold text-typography-400 hover:text-red-500"
                                                            >
                                                                Remover
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        rows={3}
                                                        value={topic.referenceText || ""}
                                                        onChange={e => handleTopicChange(idx, "referenceText", e.target.value)}
                                                        placeholder="Cole aqui o trecho copiado do JW Library ou WOL para ser exibido na pauta..."
                                                        className="w-full text-xs p-2 rounded-lg border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 resize-y leading-relaxed"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Seção 3: Recomendações e Remoções (Opcional) */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-surface-200 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <UserCheck className="w-4 h-4 text-primary-200" />
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                        Recomendações & Remoções
                                    </h3>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddRecommendation("elder")}
                                        className="gap-1 text-[10px] h-6 px-2 border-surface-300"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>+ Ancião</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleAddRecommendation("servant")}
                                        className="gap-1 text-[10px] h-6 px-2 border-surface-300"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>+ Servo</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddRemoval}
                                        className="gap-1 text-[10px] h-6 px-2 border-surface-300"
                                    >
                                        <Plus className="w-3 h-3" />
                                        <span>+ Remoção</span>
                                    </Button>
                                </div>
                            </div>

                            {/* Recomendações de Anciãos */}
                            {formData.elderRecommendations.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-typography-700 block">
                                        Indicações de Anciãos ({formData.elderRecommendations.length})
                                    </span>
                                    {formData.elderRecommendations.map((rec, idx) => (
                                        <div key={rec.id || idx} className="p-3 rounded-xl border border-surface-300 bg-surface-50/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-typography-500 uppercase">
                                                    Ancião #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRecommendation("elder", idx)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={rec.name}
                                                    onChange={e => handleRecommendationChange("elder", idx, "name", e.target.value)}
                                                    placeholder="Nome completo do irmão"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800"
                                                />
                                                <input
                                                    type="text"
                                                    value={rec.decision}
                                                    onChange={e => handleRecommendationChange("elder", idx, "decision", e.target.value)}
                                                    placeholder="Decisão (ex: Aprovado)"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <input
                                                    type="text"
                                                    value={rec.birthDate || ""}
                                                    onChange={e => handleRecommendationChange("elder", idx, "birthDate", e.target.value)}
                                                    placeholder="Nascimento (ex: 12/04/1980)"
                                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-surface-300 bg-surface-50 text-typography-700"
                                                />
                                                <input
                                                    type="text"
                                                    value={rec.baptismDate || ""}
                                                    onChange={e => handleRecommendationChange("elder", idx, "baptismDate", e.target.value)}
                                                    placeholder="Batismo (ex: 15/09/1998)"
                                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-surface-300 bg-surface-50 text-typography-700"
                                                />
                                                <input
                                                    type="text"
                                                    value={rec.yearsAsServant || ""}
                                                    onChange={e => handleRecommendationChange("elder", idx, "yearsAsServant", e.target.value)}
                                                    placeholder="Anos como servo (ex: 6 anos)"
                                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-surface-300 bg-surface-50 text-typography-700"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={rec.notes || ""}
                                                onChange={e => handleRecommendationChange("elder", idx, "notes", e.target.value)}
                                                placeholder="Observações complementares..."
                                                className="w-full text-[11px] px-2 py-1 rounded-lg border border-surface-300 bg-surface-50 text-typography-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Recomendações de Servos Ministeriais */}
                            {formData.servantRecommendations.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-typography-700 block">
                                        Indicações de Servos Ministeriais ({formData.servantRecommendations.length})
                                    </span>
                                    {formData.servantRecommendations.map((rec, idx) => (
                                        <div key={rec.id || idx} className="p-3 rounded-xl border border-surface-300 bg-surface-50/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-typography-500 uppercase">
                                                    Servo #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRecommendation("servant", idx)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={rec.name}
                                                    onChange={e => handleRecommendationChange("servant", idx, "name", e.target.value)}
                                                    placeholder="Nome completo do irmão"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800"
                                                />
                                                <input
                                                    type="text"
                                                    value={rec.decision}
                                                    onChange={e => handleRecommendationChange("servant", idx, "decision", e.target.value)}
                                                    placeholder="Decisão (ex: Aprovado)"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <input
                                                    type="text"
                                                    value={rec.birthDate || ""}
                                                    onChange={e => handleRecommendationChange("servant", idx, "birthDate", e.target.value)}
                                                    placeholder="Nascimento (ex: 03/11/1997)"
                                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-surface-300 bg-surface-50 text-typography-700"
                                                />
                                                <input
                                                    type="text"
                                                    value={rec.baptismDate || ""}
                                                    onChange={e => handleRecommendationChange("servant", idx, "baptismDate", e.target.value)}
                                                    placeholder="Batismo (ex: 12/04/2014)"
                                                    className="w-full text-[11px] px-2 py-1 rounded-lg border border-surface-300 bg-surface-50 text-typography-700"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Remoções / Renúncias */}
                            {formData.removals.length > 0 && (
                                <div className="space-y-2">
                                    <span className="text-[11px] font-bold text-typography-700 block">
                                        Remoções ou Renúncias ({formData.removals.length})
                                    </span>
                                    {formData.removals.map((rem, idx) => (
                                        <div key={rem.id || idx} className="p-3 rounded-xl border border-surface-300 bg-surface-50/50 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-typography-500 uppercase">
                                                    Registro #{idx + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveRemoval(idx)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                                <select
                                                    value={rem.role}
                                                    onChange={e => handleRemovalChange(idx, "role", e.target.value)}
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800 font-semibold"
                                                >
                                                    <option value="elder">Ancião</option>
                                                    <option value="servant">Servo Ministerial</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    value={rem.name}
                                                    onChange={e => handleRemovalChange(idx, "name", e.target.value)}
                                                    placeholder="Nome do irmão"
                                                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800 sm:col-span-2"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={rem.reason}
                                                onChange={e => handleRemovalChange(idx, "reason", e.target.value)}
                                                placeholder="Motivo ou congregação de destino..."
                                                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-surface-300 bg-surface-50 text-typography-800"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {formData.elderRecommendations.length === 0 &&
                                formData.servantRecommendations.length === 0 &&
                                formData.removals.length === 0 && (
                                    <div className="text-center py-4 px-3 border border-dashed border-surface-300 rounded-xl text-xs text-typography-400">
                                        Nenhuma recomendação ou remoção inserida. (Esta seção não aparecerá no documento impresso se estiver vazia).
                                    </div>
                                )}
                        </div>

                        {/* Seção 4: Rodapé Bíblico */}
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-typography-700">
                                Lembrete Bíblico do Rodapé
                            </h3>
                            <textarea
                                rows={2}
                                value={formData.footerNote}
                                onChange={e => handleFieldChange("footerNote", e.target.value)}
                                placeholder="Texto do rodapé bíblico..."
                                className="w-full text-xs p-2.5 rounded-xl border border-surface-300 bg-surface-50 focus:outline-hidden focus:border-primary-200 text-typography-800 italic resize-y leading-relaxed"
                            />
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
                            <BlobProvider document={<EldersMeetingAgendaPdf data={debouncedData} />}>
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
                                                    toast.success("Pauta baixada com sucesso!");
                                                }}
                                                className="gap-2 text-xs bg-[#1e3a5f] hover:bg-[#162c46] text-white font-semibold shadow-sm"
                                            >
                                                {loading ? (
                                                    <>
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        <span>Gerando PDF...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Download className="w-3.5 h-3.5" />
                                                        <span>Baixar Pauta em PDF</span>
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
                                <EldersMeetingAgendaPreview data={formData} />
                            </div>
                        ) : (
                            <div className="bg-surface-200/50 border border-surface-300 rounded-2xl overflow-hidden shadow-inner min-h-[850px] flex items-center justify-center">
                                <BlobProvider document={<EldersMeetingAgendaPdf data={debouncedData} />}>
                                    {({ url, loading, error }) => {
                                        if (loading) {
                                            return (
                                                <div className="flex flex-col items-center justify-center gap-2 p-8 text-typography-600">
                                                    <Loader2 className="w-6 h-6 animate-spin text-primary-200" />
                                                    <span className="text-xs font-medium">Renderizando PDF da Pauta...</span>
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
                                                title="Pré-visualização da Pauta da Reunião de Anciãos"
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

EldersMeetingAgendaPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"]);

export default EldersMeetingAgendaPage;

