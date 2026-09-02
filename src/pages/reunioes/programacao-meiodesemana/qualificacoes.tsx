import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { Button } from "@/Components/ui/button";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { useAuthContext } from "@/context/AuthContext";
import { api } from "@/services/api";
import { IPublisherMidweekQualification, IPublisherMini } from "@/types/midweek";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import {
    ArrowLeft,
    Check,
    ChevronUp,
    Loader2,
    Save,
    Search,
    ShieldCheck,
    Users
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

interface IPublisherWithPrivileges extends IPublisherMini {
    privileges?: string[];
}

function MidweekQualificationsPage() {
    const router = useRouter();
    const { user } = useAuthContext();
    const congregationId = user?.congregation?.id;

    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const [publishers, setPublishers] = useState<IPublisherWithPrivileges[]>([]);
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisherWithPrivileges | null>(null);
    const [qualification, setQualification] = useState<IPublisherMidweekQualification | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const listRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setPageActive("Qualificações");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Programação do Meio de Semana", link: "/reunioes/programacao-meiodesemana" }
        ]);
    }, [setPageActive, setCrumbs]);

    const fetchPublishers = async () => {
        if (!congregationId) return;
        setLoading(true);
        try {
            const res = await api.get(`/publishers/congregationId/${congregationId}`);
            setPublishers(res.data);
            if (res.data && res.data.length > 0) {
                loadPublisherQualification(res.data[0]);
            }
        } catch (error) {
            console.error("Erro ao carregar publicadores:", error);
            toast.error("Erro ao carregar publicadores.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublishers();
    }, [congregationId]);

    const loadPublisherQualification = async (pub: IPublisherWithPrivileges) => {
        setSelectedPublisher(pub);
        try {
            const res = await api.get(`/midweek/publishers/${pub.id}/qualification`);
            setQualification(res.data);
        } catch (error) {
            console.error("Erro ao carregar qualificações:", error);
            toast.error("Erro ao carregar qualificações do publicador.");
        }
    };

    const handleSelectPublisher = (pub: IPublisherWithPrivileges) => {
        loadPublisherQualification(pub);
        // Em telas mobile/tablet, rola suavemente para o editor de qualificações
        if (typeof window !== "undefined" && window.innerWidth < 768) {
            setTimeout(() => {
                editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    };

    const handleScrollToList = () => {
        listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleToggleField = (field: keyof IPublisherMidweekQualification) => {
        if (!qualification) return;
        setQualification(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [field]: !prev[field]
            };
        });
    };

    const handleSave = async () => {
        if (!selectedPublisher || !qualification) return;
        setSaving(true);
        try {
            await api.put(
                `/midweek/publishers/${selectedPublisher.id}/qualification`,
                qualification
            );
            toast.success(`Qualificações de ${selectedPublisher.fullName} salvas com sucesso!`);
        } catch (error) {
            console.error("Erro ao salvar:", error);
            toast.error("Erro ao salvar qualificações.");
        } finally {
            setSaving(false);
        }
    };

    const filteredPublishers = useMemo(() => {
        if (!searchTerm.trim()) return publishers;
        const term = searchTerm.toLowerCase();
        return publishers.filter(p =>
            p.fullName.toLowerCase().includes(term) ||
            (p.nickname && p.nickname.toLowerCase().includes(term))
        );
    }, [publishers, searchTerm]);

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Qualificações"} />

            <div className="flex flex-col gap-4 w-full max-w-7xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between bg-surface-100 p-4 rounded-xl border border-surface-300 shadow-sm">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/reunioes/programacao-meiodesemana")}
                            className="h-9 w-9 text-typography-700 hover:bg-surface-200"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h2 className="text-base font-bold text-typography-900 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5 text-primary-200" />
                                Qualificações para a Reunião de Meio de Semana
                            </h2>
                            <p className="text-xs text-typography-500">
                                Defina quais partes e funções cada irmão ou irmã está habilitado a receber no auto-preenchimento e sugestões.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Grid Duplo: Lista de Publicadores & Editor de Qualificações */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Coluna 1: Lista de Publicadores */}
                    <div
                        ref={listRef}
                        className="md:col-span-4 bg-surface-100 rounded-xl border border-surface-300 p-3 flex flex-col gap-3 shadow-sm h-[360px] md:h-[700px]"
                    >
                        <div className="flex items-center justify-between px-1">
                            <span className="text-xs font-bold text-typography-900 flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-primary-200" />
                                Publicadores ({filteredPublishers.length})
                            </span>
                        </div>

                        <div className="relative">
                            <Search className="h-4 w-4 text-typography-400 absolute left-2.5 top-2.5" />
                            <input
                                type="text"
                                placeholder="Buscar publicador..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-surface-300 bg-surface-200 text-typography-900 focus:outline-none focus:ring-1 focus:ring-primary-200"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1">
                            {loading ? (
                                <div className="py-12 flex justify-center text-typography-500">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary-200" />
                                </div>
                            ) : filteredPublishers.map((pub) => {
                                const isSelected = selectedPublisher?.id === pub.id;
                                return (
                                    <button
                                        key={pub.id}
                                        type="button"
                                        onClick={() => handleSelectPublisher(pub)}
                                        className={`flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                                            isSelected
                                                ? "bg-primary-100/20 border border-primary-200 text-typography-900 font-semibold"
                                                : "hover:bg-surface-200 border border-transparent text-typography-800"
                                        }`}
                                    >
                                        <div className="flex flex-col truncate">
                                            <span className="text-xs truncate font-medium text-typography-900">
                                                {pub.fullName}
                                            </span>
                                        </div>
                                        {isSelected && <Check className="h-4 w-4 text-primary-200 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Coluna 2: Formulário de Qualificações */}
                    <div
                        ref={editorRef}
                        className="md:col-span-8 bg-surface-100 rounded-xl border border-surface-300 p-4 sm:p-5 flex flex-col justify-between shadow-sm scroll-mt-4"
                    >
                        {selectedPublisher ? (
                            <div className="flex flex-col gap-5">
                                {/* Cabeçalho do Editor com Botão Voltar para Lista no Mobile */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-surface-300 gap-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-bold text-typography-900">
                                                {selectedPublisher.fullName}
                                            </h3>
                                            <span className="text-xs text-typography-500">
                                                Gênero: {selectedPublisher.gender} {selectedPublisher.privileges && selectedPublisher.privileges.length > 0 ? `• ${selectedPublisher.privileges.join(", ")}` : ""}
                                            </span>
                                        </div>

                                        {/* Botão para subir de volta para a lista (visível apenas no celular) */}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleScrollToList}
                                            className="md:hidden text-xs flex items-center gap-1 border-surface-300 hover:bg-surface-200 h-8"
                                        >
                                            <ChevronUp className="h-3.5 w-3.5" />
                                            <span>Trocar</span>
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm h-8"
                                    >
                                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                        <span>Salvar Qualificações</span>
                                    </Button>
                                </div>

                                {qualification && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Bloco 1: Presidência e Orações */}
                                        <div className="flex flex-col gap-2 p-3.5 bg-surface-200 rounded-lg border border-surface-300">
                                            <span className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                                                Presidência e Orações
                                            </span>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canBeChairman}
                                                    onChange={() => handleToggleField("canBeChairman")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Pode Presidir a Reunião</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canPray}
                                                    onChange={() => handleToggleField("canPray")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Pode Fazer Orações (Inicial/Final)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canAuxCounselor}
                                                    onChange={() => handleToggleField("canAuxCounselor")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Conselheiro de Sala Auxiliar</span>
                                            </label>
                                        </div>

                                        {/* Bloco 2: Tesouros da Palavra */}
                                        <div className="flex flex-col gap-2 p-3.5 bg-surface-200 rounded-lg border border-surface-300">
                                            <span className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                                                Tesouros da Palavra
                                            </span>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canTreasuresTalk}
                                                    onChange={() => handleToggleField("canTreasuresTalk")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Discurso dos Tesouros (10 min)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canSpiritualGems}
                                                    onChange={() => handleToggleField("canSpiritualGems")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Joias Espirituais (10 min)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canBibleReading}
                                                    onChange={() => handleToggleField("canBibleReading")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Leitura da Bíblia (Estudante)</span>
                                            </label>
                                        </div>

                                        {/* Bloco 3: Faça Seu Melhor no Ministério */}
                                        <div className="flex flex-col gap-2 p-3.5 bg-surface-200 rounded-lg border border-surface-300">
                                            <span className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                                                Faça Seu Melhor no Ministério
                                            </span>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canStudentInitialCall}
                                                    onChange={() => handleToggleField("canStudentInitialCall")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Iniciando Conversas (Titular)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canStudentReturnVisit}
                                                    onChange={() => handleToggleField("canStudentReturnVisit")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Cultivando o Interesse (Titular)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canStudentBibleStudy}
                                                    onChange={() => handleToggleField("canStudentBibleStudy")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Fazendo Discípulos / Explique suas Crenças</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canStudentTalk}
                                                    onChange={() => handleToggleField("canStudentTalk")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Discurso de Estudante</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canBeAssistant}
                                                    onChange={() => handleToggleField("canBeAssistant")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Pode ser Ajudante</span>
                                            </label>
                                        </div>

                                        {/* Bloco 4: Nossa Vida Cristã */}
                                        <div className="flex flex-col gap-2 p-3.5 bg-surface-200 rounded-lg border border-surface-300">
                                            <span className="text-xs font-bold text-typography-800 uppercase tracking-wider">
                                                Nossa Vida Cristã
                                            </span>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canLivingParts}
                                                    onChange={() => handleToggleField("canLivingParts")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Partes da Vida Cristã (15 min)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canLocalNeeds}
                                                    onChange={() => handleToggleField("canLocalNeeds")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Necessidades Locais</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canCbsConductor}
                                                    onChange={() => handleToggleField("canCbsConductor")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Dirigente do Estudo Bíblico (CBS)</span>
                                            </label>
                                            <label className="flex items-center gap-2.5 text-xs text-typography-800 cursor-pointer select-none py-1">
                                                <input
                                                    type="checkbox"
                                                    checked={qualification.canCbsReader}
                                                    onChange={() => handleToggleField("canCbsReader")}
                                                    className="rounded border-surface-300 text-primary-200 focus:ring-primary-200 h-4 w-4"
                                                />
                                                <span>Leitor do Estudo Bíblico (CBS)</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Botão de Salvar no Rodapé (muito prático no celular) */}
                                <div className="flex justify-end pt-3 border-t border-surface-300">
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="w-full sm:w-auto bg-primary-200 hover:opacity-90 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm h-9"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        <span>Salvar Qualificações de {selectedPublisher.nickname || selectedPublisher.fullName}</span>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center text-xs text-typography-500">
                                Selecione um publicador à esquerda para gerenciar suas qualificações.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ContentDashboard>
    );
}

MidweekQualificationsPage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "DOCUMENTS_MANAGER",
    "MIDWEEK_MANAGER"
]);

export default MidweekQualificationsPage;
