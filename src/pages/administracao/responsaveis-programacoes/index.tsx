import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import CleanIcon from "@/Components/Icons/CleanIcon";
import LifeAndMinistryIcon from "@/Components/Icons/LifeAndMinistryIcon";
import PreachingHomeIcon from "@/Components/Icons/PreachingHomeIcon";
import PublicPreachingIcon from "@/Components/Icons/PublicPreachingIcon";
import SpeakerIcon from "@/Components/Icons/SpeakerIcon";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import { API_ROUTES } from "@/constants/apiRoutes";
import { useCongregationContext } from "@/context/CongregationContext";
import { useAuthorizedFetch } from "@/hooks/useFetch";
import { api } from "@/services/api";
import {
    IScheduleReminderConfig,
    IScheduleResponsiblesResponse,
    IUserSimple,
} from "@/types/scheduleReminder";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import { useAtom } from "jotai";
import {
    AlertCircle,
    Bell,
    Check,
    Clock,
    Info,
    Loader2,
    Plus,
    Save,
    ShieldCheck,
    Trash2,
    UserCheck,
    Users,
    X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ModuleDefinition {
    key: "CLEANING_MANAGER" | "TALK_MANAGER" | "MIDWEEK_MANAGER" | "FIELD_SERVICE_MANAGER" | "PUBLIC_WITNESS_MANAGER";
    title: string;
    description: string;
    icon: React.ReactNode;
    colorBadge: string;
    configKeyEnabled: keyof IScheduleReminderConfig;
    configKeyDays: keyof IScheduleReminderConfig;
    defaultDays: number;
}

const MODULES: ModuleDefinition[] = [
    {
        key: "CLEANING_MANAGER",
        title: "Programação de Limpeza",
        description: "Responsável por organizar grupos de limpeza e gerar a escala semanal do Salão.",
        icon: <CleanIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
        colorBadge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
        configKeyEnabled: "cleaning_enabled",
        configKeyDays: "cleaning_days_before",
        defaultDays: 15,
    },
    {
        key: "TALK_MANAGER",
        title: "Reunião de Fim de Semana (Oradores)",
        description: "Responsável por coordenar oradores visitantes, discursos públicos e presidência.",
        icon: <SpeakerIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
        colorBadge: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20",
        configKeyEnabled: "weekend_meeting_enabled",
        configKeyDays: "weekend_meeting_days_before",
        defaultDays: 20,
    },
    {
        key: "MIDWEEK_MANAGER",
        title: "Reunião de Meio de Semana (RVM)",
        description: "Responsável por designar partes, estudantes e oradores da reunião Nossa Vida e Ministério.",
        icon: <LifeAndMinistryIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
        colorBadge: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
        configKeyEnabled: "midweek_meeting_enabled",
        configKeyDays: "midweek_meeting_days_before",
        defaultDays: 30,
    },
    {
        key: "FIELD_SERVICE_MANAGER",
        title: "Saídas de Campo",
        description: "Responsável por programar dirigentes, grupos e horários das saídas para a pregação.",
        icon: <PreachingHomeIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        colorBadge: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
        configKeyEnabled: "field_service_enabled",
        configKeyDays: "field_service_days_before",
        defaultDays: 15,
    },
    {
        key: "PUBLIC_WITNESS_MANAGER",
        title: "Testemunho Público",
        description: "Responsável pelas escalas dos carrinhos e mesas de testemunho público.",
        icon: <PublicPreachingIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
        colorBadge: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
        configKeyEnabled: "public_witnessing_enabled",
        configKeyDays: "public_witnessing_days_before",
        defaultDays: 15,
    },
];

function ScheduleResponsiblesPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);
    const { congregation } = useCongregationContext();

    const [activeTab, setActiveTab] = useState<"responsibles" | "settings">("responsibles");
    const [updatingRole, setUpdatingRole] = useState<string | null>(null);
    const [savingConfig, setSavingConfig] = useState(false);

    useEffect(() => {
        setPageActive("Responsáveis por Escalas");
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Administração", link: "/administracao" },
            { label: "Responsáveis por Escalas", link: "/administracao/responsaveis-programacoes" },
        ]);
    }, [setPageActive, setCrumbs]);

    // Busca responsáveis por área
    const responsiblesUrl = congregation
        ? `${API_ROUTES.SCHEDULE_REMINDERS_RESPONSIBLES}/congregation/${congregation.id}`
        : "";
    const {
        data: responsiblesData,
        mutate: mutateResponsibles,
        isLoading: isLoadingResponsibles,
    } = useAuthorizedFetch<IScheduleResponsiblesResponse>(responsiblesUrl);

    // Busca configurações de lembretes
    const configUrl = congregation
        ? `${API_ROUTES.SCHEDULE_REMINDERS_CONFIG}/congregation/${congregation.id}`
        : "";
    const {
        data: configData,
        mutate: mutateConfig,
        isLoading: isLoadingConfig,
    } = useAuthorizedFetch<IScheduleReminderConfig>(configUrl);

    const [localConfig, setLocalConfig] = useState<Partial<IScheduleReminderConfig>>({
        cleaning_days_before: 15,
        cleaning_enabled: true,
        field_service_days_before: 15,
        field_service_enabled: true,
        public_witnessing_days_before: 15,
        public_witnessing_enabled: true,
        midweek_meeting_days_before: 30,
        midweek_meeting_enabled: true,
        weekend_meeting_days_before: 20,
        weekend_meeting_enabled: true,
    });

    useEffect(() => {
        if (configData) {
            setLocalConfig(configData);
        }
    }, [configData]);

    const handleAddResponsible = async (roleName: string, userId: string) => {
        if (!congregation || !responsiblesData) return;
        const currentList = responsiblesData.responsiblesByRole[roleName as keyof typeof responsiblesData.responsiblesByRole] || [];
        if (currentList.some((u) => u.id === userId)) {
            toast.info("Este usuário já é responsável por esta área.");
            return;
        }

        const newUserIds = [...currentList.map((u) => u.id), userId];
        setUpdatingRole(roleName);
        try {
            await api.post(
                `${API_ROUTES.SCHEDULE_REMINDERS_RESPONSIBLES}/congregation/${congregation.id}`,
                {
                    roleName,
                    userIds: newUserIds,
                }
            );
            toast.success("Responsável adicionado com sucesso!");
            await mutateResponsibles();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao adicionar responsável.");
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleRemoveResponsible = async (roleName: string, userId: string) => {
        if (!congregation || !responsiblesData) return;
        const currentList = responsiblesData.responsiblesByRole[roleName as keyof typeof responsiblesData.responsiblesByRole] || [];
        const newUserIds = currentList.filter((u) => u.id !== userId).map((u) => u.id);

        setUpdatingRole(roleName);
        try {
            await api.post(
                `${API_ROUTES.SCHEDULE_REMINDERS_RESPONSIBLES}/congregation/${congregation.id}`,
                {
                    roleName,
                    userIds: newUserIds,
                }
            );
            toast.success("Responsável removido com sucesso!");
            await mutateResponsibles();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao remover responsável.");
        } finally {
            setUpdatingRole(null);
        }
    };

    const handleSaveConfig = async () => {
        if (!congregation) return;
        setSavingConfig(true);
        try {
            await api.put(
                `${API_ROUTES.SCHEDULE_REMINDERS_CONFIG}/congregation/${congregation.id}`,
                localConfig
            );
            toast.success("Configurações de lembretes salvas com sucesso!");
            await mutateConfig();
        } catch (err) {
            console.error(err);
            toast.error("Erro ao salvar configurações.");
        } finally {
            setSavingConfig(false);
        }
    };

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Responsáveis por Escalas"} />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
                {/* Header da Página */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-300">
                    <div>
                        <div className="flex items-center gap-2 text-primary-200 text-xs font-bold uppercase tracking-wider mb-1">
                            <ShieldCheck size={16} />
                            <span>Gestão de Escalas & Lembretes</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                            Responsáveis pelas Programações
                        </h1>
                        <p className="text-xs sm:text-sm text-typography-500 mt-1">
                            Defina quais publicadores cuidam de cada escala e configure os prazos de avisos no Dashboard.
                        </p>
                    </div>

                    {/* Navegação entre Abas */}
                    <div className="flex items-center gap-2 p-1 bg-surface-200 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setActiveTab("responsibles")}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                activeTab === "responsibles"
                                    ? "bg-surface-100 text-primary-200 shadow-xs"
                                    : "text-typography-600 hover:text-typography-900"
                            }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <Users className="w-4 h-4" />
                                <span>Responsáveis por Área</span>
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("settings")}
                            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                                activeTab === "settings"
                                    ? "bg-surface-100 text-primary-200 shadow-xs"
                                    : "text-typography-600 hover:text-typography-900"
                            }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <Bell className="w-4 h-4" />
                                <span>Prazos dos Avisos</span>
                            </span>
                        </button>
                    </div>
                </div>

                {/* Banner Informativo */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary-200/5 border border-primary-200/20 text-xs text-typography-600">
                    <Info className="w-5 h-5 text-primary-200 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                        <strong>Como funciona:</strong> Ao adicionar um publicador como responsável, o sistema concede a permissão necessária para gerenciar aquela escala e direciona os alertas do Dashboard para ele. Administradores da Congregação têm acesso irrestrito a todas as telas, mas só recebem lembretes no Dashboard das áreas onde estiverem designados (ou caso nenhuma pessoa tenha sido designada para aquela função).
                    </p>
                </div>

                {/* Aba 1: Responsáveis por Área */}
                {activeTab === "responsibles" && (
                    <div className="space-y-4">
                        {isLoadingResponsibles ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                                <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                                <p className="text-sm text-typography-500">Carregando responsáveis...</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {MODULES.map((module) => {
                                    const assignedUsers =
                                        responsiblesData?.responsiblesByRole[module.key] || [];
                                    const availableUsers = responsiblesData?.availableUsers || [];
                                    const isUpdating = updatingRole === module.key;

                                    return (
                                        <div
                                            key={module.key}
                                            className="flex flex-col justify-between p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-2xs space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 rounded-xl bg-surface-200/70 border border-surface-300/60 shrink-0">
                                                            {module.icon}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-base font-bold text-typography-900">
                                                                {module.title}
                                                            </h3>
                                                            <span
                                                                className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${module.colorBadge}`}
                                                            >
                                                                {module.key}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-typography-500 leading-relaxed">
                                                    {module.description}
                                                </p>
                                            </div>

                                            {/* Lista de Responsáveis Atuais */}
                                            <div className="space-y-2 pt-2 border-t border-surface-300">
                                                <div className="flex items-center justify-between text-xs font-semibold text-typography-600">
                                                    <span>Responsáveis Atuais ({assignedUsers.length}):</span>
                                                </div>

                                                {assignedUsers.length === 0 ? (
                                                    <div className="p-3 rounded-xl bg-amber-500/5 border border-dashed border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
                                                        Nenhum responsável específico atribuído. Os administradores da congregação serão alertados no Dashboard até que alguém seja designado.
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignedUsers.map((u) => (
                                                            <div
                                                                key={u.id}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-200/80 border border-surface-300 text-xs text-typography-800"
                                                            >
                                                                <span className="font-semibold">{u.name}</span>
                                                                <button
                                                                    type="button"
                                                                    disabled={isUpdating}
                                                                    onClick={() => handleRemoveResponsible(module.key, u.id)}
                                                                    className="text-typography-400 hover:text-rose-500 rounded p-0.5 transition-colors cursor-pointer"
                                                                    title="Remover este responsável"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Seletor para adicionar novo responsável */}
                                            <div className="pt-2">
                                                <Select
                                                    value=""
                                                    disabled={isUpdating}
                                                    onValueChange={(userId) => {
                                                        if (userId) handleAddResponsible(module.key, userId);
                                                    }}
                                                >
                                                    <SelectTrigger className="w-full text-xs rounded-xl bg-surface-200/50 truncate">
                                                        <SelectValue
                                                            placeholder={
                                                                isUpdating
                                                                    ? "Atualizando..."
                                                                    : "+ Adicionar publicador responsável..."
                                                            }
                                                        />
                                                    </SelectTrigger>
                                                    <SelectContent className="max-h-60 max-w-[300px] sm:max-w-sm">
                                                        {availableUsers
                                                            .filter(
                                                                (u) =>
                                                                    !assignedUsers.some((assigned) => assigned.id === u.id)
                                                            )
                                                            .map((u) => (
                                                                <SelectItem key={u.id} value={u.id} className="text-xs py-1.5 cursor-pointer">
                                                                    <div className="flex flex-col text-left truncate">
                                                                        <span className="font-semibold text-typography-800 truncate">
                                                                            {u.name}
                                                                        </span>
                                                                        {u.email && u.email !== u.name && (
                                                                            <span className="text-[10px] text-typography-400 truncate">
                                                                                {u.email}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Aba 2: Prazos e Lembretes */}
                {activeTab === "settings" && (
                    <div className="space-y-6">
                        {isLoadingConfig ? (
                            <div className="flex flex-col items-center justify-center p-16 bg-surface-100 rounded-2xl border border-surface-300">
                                <Loader2 className="w-8 h-8 text-primary-200 animate-spin mb-3" />
                                <p className="text-sm text-typography-500">Carregando configurações...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="p-4 rounded-2xl bg-surface-100 border border-surface-300 space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary-200" />
                                        <h3 className="text-base font-bold text-typography-800">
                                            Antecedência dos Avisos no Dashboard
                                        </h3>
                                    </div>
                                    <p className="text-xs text-typography-500">
                                        Defina com quantos dias de antecedência antes do término do mês atual os responsáveis devem ser lembrados de gerar as programações do mês seguinte.
                                    </p>

                                    <div className="divide-y divide-surface-300 pt-2">
                                        {MODULES.map((m) => {
                                            const enabled = localConfig[m.configKeyEnabled] !== false;
                                            const days = (localConfig[m.configKeyDays] as number) ?? m.defaultDays;

                                            return (
                                                <div
                                                    key={m.key}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-xl bg-surface-200/80 shrink-0">
                                                            {m.icon}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="text-sm font-bold text-typography-800">
                                                                    {m.title}
                                                                </h4>
                                                                <span
                                                                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold border uppercase ${m.colorBadge}`}
                                                                >
                                                                    {days} dias antes
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-typography-500 mt-0.5">
                                                                {enabled
                                                                    ? `Aviso dispara a partir do dia ${Math.max(1, 31 - days)} do mês caso o próximo mês não esteja gerado.`
                                                                    : "Lembretes desativados para esta área."}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 self-end sm:self-center">
                                                        <div className="flex items-center gap-2">
                                                            <label
                                                                htmlFor={`days-${m.key}`}
                                                                className="text-xs font-semibold text-typography-600 whitespace-nowrap"
                                                            >
                                                                Dias antes:
                                                            </label>
                                                            <input
                                                                id={`days-${m.key}`}
                                                                type="number"
                                                                min={1}
                                                                max={60}
                                                                disabled={!enabled}
                                                                value={days}
                                                                onChange={(e) =>
                                                                    setLocalConfig({
                                                                        ...localConfig,
                                                                        [m.configKeyDays]: parseInt(e.target.value, 10) || 1,
                                                                    })
                                                                }
                                                                className="w-16 px-2.5 py-1.5 text-xs text-center font-bold rounded-xl border border-surface-300 bg-surface-200/50 disabled:opacity-40"
                                                            />
                                                        </div>

                                                        <div className="flex items-center gap-2 pl-2 border-l border-surface-300">
                                                            <span className="text-xs font-medium text-typography-500">
                                                                {enabled ? "Ativo" : "Inativo"}
                                                            </span>
                                                            <Switch
                                                                checked={enabled}
                                                                onCheckedChange={(val) =>
                                                                    setLocalConfig({
                                                                        ...localConfig,
                                                                        [m.configKeyEnabled]: val,
                                                                    })
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Botão de Salvar Configurações */}
                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={handleSaveConfig}
                                        disabled={savingConfig}
                                        className="gap-2 bg-primary-200 hover:bg-primary-300 text-white rounded-xl shadow-sm text-xs font-semibold px-6 py-2.5"
                                    >
                                        {savingConfig ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        <span>Salvar Configurações de Prazos</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ContentDashboard>
    );
}

ScheduleResponsiblesPage.getLayout = withProtectedLayout(["ADMIN", "ADMIN_CONGREGATION"]);

export default ScheduleResponsiblesPage;
