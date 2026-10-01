'use client';

import { crumbsAtom, pageActiveAtom } from "@/atoms/atom";
import BreadCrumbs from "@/Components/BreadCrumbs";
import ContentDashboard from "@/Components/ContentDashboard";
import { SpecialEventModal } from "@/Components/SpecialEvents/SpecialEventModal";
import { Button } from "@/Components/ui/button";
import { useCongregationContext } from "@/context/CongregationContext";
import { api } from "@/services/api";
import { CreateSpecialEventDTO, EventImpactScope, ISpecialEvent, SpecialEventType } from "@/types/specialEvent";
import { withProtectedLayout } from "@/utils/withProtectedLayout";
import dayjs from "dayjs";
import 'dayjs/locale/pt-br';
import { useAtom } from "jotai";
import {
    Calendar,
    CalendarDays,
    CalendarPlus,
    CheckCircle,
    Clock,
    Edit2,
    Globe,
    Heart,
    Loader2,
    MapPin,
    Mic,
    Plus,
    Radio,
    Sparkles,
    Users,
    XCircle
} from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

dayjs.locale('pt-br');

function getEventBadge(type: SpecialEventType) {
    switch (type) {
        case SpecialEventType.CIRCUIT_ASSEMBLY:
            return {
                label: "Assembleia de Circuito",
                icon: Users,
                bg: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30"
            };
        case SpecialEventType.REGIONAL_CONVENTION:
            return {
                label: "Congresso Regional",
                icon: Sparkles,
                bg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30"
            };
        case SpecialEventType.MEMORIAL:
            return {
                label: "Celebração",
                icon: Heart,
                bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
            };
        case SpecialEventType.CIRCUIT_OVERSEER_VISIT:
            return {
                label: "Visita do Superintendente",
                icon: Mic,
                bg: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30"
            };
        case SpecialEventType.SPECIAL_TALK:
            return {
                label: "Discurso Especial",
                icon: Radio,
                bg: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/30"
            };
        default:
            return {
                label: "Evento Especial",
                icon: Calendar,
                bg: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30"
            };
    }
}

function formatDateRange(startDate: string, endDate: string) {
    const s = dayjs(startDate);
    const e = dayjs(endDate);

    if (startDate === endDate) {
        return s.format("DD [de] MMMM [de] YYYY");
    }

    if (s.isSame(e, 'month')) {
        return `${s.format("DD")} a ${e.format("DD [de] MMMM [de] YYYY")}`;
    }

    return `${s.format("DD [de] MMM")} a ${e.format("DD [de] MMM [de] YYYY")}`;
}

function EventosEspeciaisPage() {
    const { congregation } = useCongregationContext();
    const router = useRouter();
    const [crumbs, setCrumbs] = useAtom(crumbsAtom);
    const [, setPageActive] = useAtom(pageActiveAtom);

    const [events, setEvents] = useState<ISpecialEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'future' | 'all'>('future');

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ISpecialEvent | null>(null);

    useEffect(() => {
        if (router.query.action === 'new') {
            setSelectedEvent(null);
            setModalOpen(true);
        }
    }, [router.query.action]);

    useEffect(() => {
        setPageActive("Eventos Especiais");
        setCrumbs([
            { label: "Eventos Especiais", link: "/congregacao/eventos-especiais" }
        ]);
    }, [setPageActive, setCrumbs]);

    const loadEvents = async () => {
        if (!congregation?.id) return;
        setLoading(true);
        try {
            const res = await api.get(`/congregation/${congregation.id}/special-events`, {
                params: {
                    futureOnly: filter === 'future' ? 'true' : 'false'
                }
            });
            setEvents(res.data);
        } catch (error) {
            console.error("Erro ao carregar eventos:", error);
            toast.error("Não foi possível carregar os eventos especiais.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, [congregation?.id, filter]);

    const handleCreateOrUpdate = async (dto: CreateSpecialEventDTO) => {
        if (!congregation?.id) return;

        if (selectedEvent?.id) {
            await api.put(`/special-events/${selectedEvent.id}`, dto);
        } else {
            await api.post(`/congregation/${congregation.id}/special-events`, dto);
        }
        await loadEvents();
    };

    const handleDelete = async (id: string) => {
        await api.delete(`/special-events/${id}`);
        await loadEvents();
    };

    const handleOpenNew = () => {
        setSelectedEvent(null);
        setModalOpen(true);
    };

    const handleOpenEdit = (evt: ISpecialEvent) => {
        setSelectedEvent(evt);
        setModalOpen(true);
    };

    return (
        <ContentDashboard>
            <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto pb-12">
                <BreadCrumbs crumbs={crumbs} pageActive="Eventos Especiais" />

                {/* Header Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                            <CalendarDays className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-typography-900 tracking-tight">
                                Central de Eventos Especiais
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Configure assembleias, congressos, visitas e celebrações uma única vez com sincronização automática em todo o sistema.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleOpenNew}
                        className="bg-primary-200 hover:opacity-90 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs shrink-0"
                    >
                        <Plus size={16} />
                        <span>Novo Evento Especial</span>
                    </Button>
                </div>

                {/* Filtros e Abas */}
                <div className="flex items-center justify-between gap-3 border-b border-surface-300 pb-2">
                    <div className="flex items-center gap-1.5 p-1 bg-surface-200/80 rounded-xl border border-surface-300">
                        <button
                            onClick={() => setFilter('future')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                filter === 'future'
                                    ? "bg-surface-100 text-primary-200 shadow-2xs"
                                    : "text-typography-600 hover:text-typography-900"
                            }`}
                        >
                            Próximos e Ativos
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                filter === 'all'
                                    ? "bg-surface-100 text-primary-200 shadow-2xs"
                                    : "text-typography-600 hover:text-typography-900"
                            }`}
                        >
                            Todos os Registrados
                        </button>
                    </div>

                    <span className="text-xs text-typography-500 font-medium">
                        {events.length} {events.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
                    </span>
                </div>

                {/* Lista de Eventos */}
                {loading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-typography-400">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-200" />
                        <span className="text-xs">Carregando eventos especiais...</span>
                    </div>
                ) : events.length === 0 ? (
                    <div className="py-16 px-4 flex flex-col items-center justify-center gap-3 text-center bg-surface-100/60 rounded-2xl border border-dashed border-surface-300">
                        <div className="w-14 h-14 rounded-2xl bg-surface-200 flex items-center justify-center text-typography-400">
                            <CalendarPlus size={28} />
                        </div>
                        <div className="flex flex-col gap-1 max-w-sm">
                            <h3 className="text-sm font-bold text-typography-800">
                                Nenhum evento especial {filter === 'future' ? 'programado para as próximas semanas' : 'cadastrado'}
                            </h3>
                            <p className="text-xs text-typography-500">
                                Cadastre assembleias, congressos, visitas ou celebrações para sincronizar com reuniões, campo e mural público.
                            </p>
                        </div>
                        <Button
                            onClick={handleOpenNew}
                            variant="outline"
                            size="sm"
                            className="text-xs font-semibold mt-2"
                        >
                            <Plus size={14} className="mr-1.5" />
                            Cadastrar Primeiro Evento
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((evt) => {
                            const badge = getEventBadge(evt.type);
                            const BadgeIcon = badge.icon;
                            const isPast = dayjs(evt.endDate).isBefore(dayjs().startOf('day'));

                            return (
                                <div
                                    key={evt.id}
                                    className={`flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-xs hover:border-primary-200/50 transition-all ${
                                        isPast ? "opacity-75" : ""
                                    }`}
                                >
                                    <div className="flex flex-col gap-3">
                                        {/* Top row: badge + edit */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg}`}>
                                                <BadgeIcon className="h-3.5 w-3.5" />
                                                <span>{badge.label}</span>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                {isPast && (
                                                    <span className="text-[10px] uppercase font-bold text-typography-400 bg-surface-200 px-2 py-0.5 rounded-md">
                                                        Passado
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleOpenEdit(evt)}
                                                    className="p-1.5 rounded-lg text-typography-500 hover:text-primary-200 hover:bg-surface-200 transition-colors"
                                                    title="Editar evento"
                                                >
                                                    <Edit2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Título e Tema */}
                                        <div className="flex flex-col gap-0.5">
                                            <h3 className="text-base sm:text-lg font-bold text-typography-900 leading-tight">
                                                {evt.title}
                                            </h3>
                                            {evt.theme && (
                                                <p className="text-xs text-primary-200 font-medium italic">
                                                    &ldquo;{evt.theme}&rdquo;
                                                </p>
                                            )}
                                        </div>

                                        {/* Datas e Local */}
                                        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-typography-600">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5 text-typography-400" />
                                                <span>{formatDateRange(evt.startDate, evt.endDate)}</span>
                                            </div>

                                            {evt.location && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                                                    <span className="truncate max-w-[200px]">{evt.location}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Impact Matrix Badges */}
                                        <div className="pt-2.5 border-t border-surface-300/80 flex flex-col gap-1.5">
                                            <span className="text-[10px] font-bold text-typography-400 uppercase tracking-wider">
                                                Impactos na Programação:
                                            </span>

                                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                                                {/* Reunião Meio */}
                                                {evt.cancelMidweekMeeting ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 font-medium">
                                                        <XCircle size={11} /> Reunião Meio: Cancelada
                                                    </span>
                                                ) : evt.isCircuitOverseerVisit ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                                                        <Mic size={11} /> Meio: Discurso do SC
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                                                        <CheckCircle size={11} /> Reunião Meio: Normal
                                                    </span>
                                                )}

                                                {/* Reunião Fim */}
                                                {evt.cancelWeekendMeeting ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 font-medium">
                                                        <XCircle size={11} /> Reunião Fim: Cancelada
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium">
                                                        <CheckCircle size={11} /> Reunião Fim: Normal
                                                    </span>
                                                )}

                                                {/* Limpeza */}
                                                {evt.cancelCleaning ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                                                        <XCircle size={11} /> Limpeza: Suspensa
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface-200 text-typography-600 font-medium">
                                                        Limpeza: Mantida
                                                    </span>
                                                )}

                                                {/* Campo */}
                                                {evt.fieldServiceImpact !== EventImpactScope.NONE && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-medium">
                                                        Campo: {evt.fieldServiceImpact === EventImpactScope.EVENT_DAYS_ONLY ? "Pausa nos dias do evento" : "Pausa na semana"}
                                                    </span>
                                                )}

                                                {/* Mural */}
                                                {evt.showOnPublicBoard && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                                                        <Globe size={11} /> Mural Público
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {evt.notes && (
                                            <p className="text-[11px] text-typography-500 italic line-clamp-2 mt-1">
                                                {evt.notes}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Modal de Cadastro / Edição */}
                <SpecialEventModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    event={selectedEvent}
                    onSave={handleCreateOrUpdate}
                    onDelete={handleDelete}
                />
            </div>
        </ContentDashboard>
    );
}

EventosEspeciaisPage.getLayout = withProtectedLayout([
    "ADMIN",
    "ADMIN_CONGREGATION",
    "MIDWEEK_MANAGER",
    "TALK_MANAGER",
    "CLEANING_MANAGER",
    "FIELD_SERVICE_MANAGER",
    "PUBLIC_WITNESS_MANAGER",
    "VIEWER"
]);

export default EventosEspeciaisPage;
