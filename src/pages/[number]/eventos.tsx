'use client';

import { domainUrl } from '@/atoms/atom';
import { themeAtom } from '@/atoms/themeAtoms';
import Footer from '@/Components/Footer';
import HeadComponent from '@/Components/HeadComponent';
import NotFoundDocument from '@/Components/NotFoundDocument';
import PdfViewer from '@/Components/PdfViewer';
import Spiner from '@/Components/Spiner';
import { usePublicDocumentsContext } from '@/context/PublicDocumentsContext';
import { removeMimeType } from '@/functions/removeMimeType';
import { useFetch } from '@/hooks/useFetch';
import PublicDocumentsProviderLayout from '@/layouts/providers/publicDocuments/_layout';
import { ISpecialEvent, SpecialEventType } from '@/types/specialEvent';
import { Categories, ICongregation, IDocument } from '@/types/types';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
import {
    ArrowLeft,
    Calendar,
    CalendarDays,
    ChevronRight,
    Clock,
    FileText,
    Heart,
    MapPin,
    Mic,
    Radio,
    Sparkles,
    Users
} from 'lucide-react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

dayjs.locale('pt-br');

function getPublicEventBadge(type: SpecialEventType) {
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

function Eventos() {
    const router = useRouter();
    const { number } = router.query;
    const domain = useAtomValue(domainUrl);

    const [congregationData, setCongregationData] = useState<ICongregation>();

    const fetchConfigCongregationData = number ? `/congregation/${number}` : "";
    const { data: congregation, isLoading: isLoadingCongregation } =
        useFetch<ICongregation>(fetchConfigCongregationData);

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation);
        }
    }, [congregation]);

    // Busca eventos especiais públicos
    const fetchSpecialEventsRoute = congregation?.id
        ? `/congregation/${congregation.id}/special-events/public`
        : "";
    const { data: specialEvents, isLoading: isLoadingSpecialEvents } =
        useFetch<ISpecialEvent[]>(fetchSpecialEventsRoute);

    // Documentos PDF
    const { setCongregationNumber, documents, filterDocuments } =
        usePublicDocumentsContext();

    const [pdfShow, setPdfShow] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>();

    useEffect(() => {
        if (number) {
            setCongregationNumber(number as string);
        }
    }, [number, setCongregationNumber]);

    useEffect(() => {
        if (documents) {
            setDocumentsFilter(filterDocuments(Categories.eventos));
        }
    }, [documents, filterDocuments]);

    function handleButtonClick(url: string) {
        setPdfUrl(url);
        setPdfShow(true);
    }

    const theme = useAtomValue(themeAtom);
    const isLoading = isLoadingCongregation || isLoadingSpecialEvents;

    const hasSpecialEvents = Boolean(specialEvents && specialEvents.length > 0);
    const hasPdfDocs = Boolean(documentsFilter && documentsFilter.length > 0);

    return !pdfShow ? (
        <div className="min-h-screen w-full bg-surface-200 text-typography-800 flex flex-col justify-between selection:bg-primary-200 selection:text-white transition-colors duration-300">
            <Head>
                <link
                    key="manifest-link"
                    rel="manifest"
                    href={`/api/manifest?number=${number}${theme ? `&theme=${theme}` : ''}`}
                />
            </Head>

            <HeadComponent
                title={`Eventos Especiais - Congregação ${congregationData?.name ?? ""}`}
                urlMiniatura={`${domain}/images/eventos.png`}
            />

            {/* Top Bar de Navegação */}
            <div className="w-full bg-surface-100 border-b border-surface-300/80 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-surface-100/90">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                    <Link
                        href={`/${number}`}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-200 hover:text-primary-150 transition active:scale-95 px-2.5 py-1.5 rounded-lg hover:bg-surface-200"
                    >
                        <ArrowLeft size={17} />
                        <span>Voltar ao Quadro</span>
                    </Link>

                    {congregationData?.name && (
                        <span className="text-xs text-typography-500 font-medium hidden sm:inline-block">
                            Congregação {congregationData.name}
                        </span>
                    )}
                </div>
            </div>

            {/* Conteúdo Principal */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
                {/* Título da Seção */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary-200 font-bold text-xs uppercase tracking-wider">
                        <CalendarDays size={15} />
                        <span>Assembleias, Congressos e Visitas</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                        Eventos Especiais
                    </h1>
                    <p className="text-xs sm:text-sm text-typography-500">
                        Consulte as datas, programações e informativos de assembleias, congressos e visitas
                    </p>
                </div>

                {isLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-typography-400">
                        <Spiner size="w-8 h-8" />
                        <span className="text-xs">Carregando eventos especiais...</span>
                    </div>
                ) : !hasSpecialEvents && !hasPdfDocs ? (
                    <div className="py-16">
                        <NotFoundDocument message="Nenhum evento especial programado para as próximas semanas." />
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {/* Seção 1: Eventos Especiais Cadastrados */}
                        {hasSpecialEvents && (
                            <div className="flex flex-col gap-3">
                                <h2 className="text-xs font-bold text-typography-500 uppercase tracking-wider">
                                    Próximos Eventos da Congregação
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                    {specialEvents!.map((evt) => {
                                        const badge = getPublicEventBadge(evt.type);
                                        const BadgeIcon = badge.icon;

                                        return (
                                            <motion.div
                                                key={evt.id}
                                                whileHover={{ scale: 1.01, y: -2 }}
                                                className="p-4 sm:p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm flex flex-col justify-between gap-3 text-left group hover:border-primary-200/60 transition-all"
                                            >
                                                <div className="flex flex-col gap-2.5">
                                                    {/* Badge de tipo */}
                                                    <div className="flex items-center justify-between">
                                                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg}`}>
                                                            <BadgeIcon className="h-3.5 w-3.5" />
                                                            <span>{badge.label}</span>
                                                        </div>
                                                    </div>

                                                    {/* Título do evento */}
                                                    <div>
                                                        <h3 className="font-extrabold text-base sm:text-lg text-typography-900 group-hover:text-primary-200 transition-colors leading-tight">
                                                            {evt.title}
                                                        </h3>
                                                        {evt.theme && (
                                                            <p className="text-xs text-primary-200 font-semibold italic mt-0.5">
                                                                &ldquo;{evt.theme}&rdquo;
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Data e Local */}
                                                    <div className="flex flex-col gap-1.5 text-xs text-typography-600 pt-1">
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={14} className="text-primary-200 shrink-0" />
                                                            <span className="font-semibold text-typography-800">
                                                                {formatDateRange(evt.startDate, evt.endDate)}
                                                            </span>
                                                        </div>

                                                        {evt.location && (
                                                            <div className="flex items-center gap-2">
                                                                <MapPin size={14} className="text-red-500 shrink-0" />
                                                                <span className="truncate">{evt.location}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Observações / Descrição */}
                                                    {evt.notes && (
                                                        <p className="text-xs text-typography-500 mt-1 line-clamp-3 leading-relaxed">
                                                            {evt.notes}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Mini pills informativas sobre as reuniões */}
                                                <div className="pt-2 border-t border-surface-300/70 flex flex-wrap gap-1.5 text-[10px]">
                                                    {evt.cancelMidweekMeeting && (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                                                            Sem reunião no meio de semana
                                                        </span>
                                                    )}
                                                    {evt.cancelWeekendMeeting && (
                                                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                                                            Sem reunião no fim de semana
                                                        </span>
                                                    )}
                                                    {evt.isCircuitOverseerVisit && (
                                                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                                                            Discurso de Serviço do SC
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Seção 2: Documentos e Programações em PDF */}
                        {hasPdfDocs && (
                            <div className="flex flex-col gap-3">
                                <h2 className="text-xs font-bold text-typography-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText size={14} />
                                    <span>Programações e Arquivos para Download</span>
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {documentsFilter!.map((document) => (
                                        <motion.button
                                            key={document.id}
                                            whileHover={{ scale: 1.015, y: -2 }}
                                            whileTap={{ scale: 0.985 }}
                                            onClick={() => handleButtonClick(document.url)}
                                            className="flex items-center justify-between p-4 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-11 h-11 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                    <FileText size={22} />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-200 block mb-0.5">
                                                        PDF
                                                    </span>
                                                    <h3 className="font-bold text-sm sm:text-base text-typography-800 group-hover:text-primary-200 transition-colors">
                                                        {removeMimeType(document.fileName)}
                                                    </h3>
                                                </div>
                                            </div>

                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-typography-400 group-hover:text-primary-200 group-hover:bg-primary-200/10 transition-all">
                                                <ChevronRight
                                                    size={18}
                                                    className="group-hover:translate-x-0.5 transition-transform"
                                                />
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Footer Oficial */}
            <Footer
                nCong={number as string}
                ano={new Date().getFullYear()}
                nomeCongregacao={`Congregação ${congregationData?.name ?? ""} ${
                    congregationData?.circuit ? `- ${congregationData.circuit}` : ""
                }`}
                aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação."
            />
        </div>
    ) : (
        <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
    );
}

Eventos.getLayout = (page: React.ReactElement) => {
    return (
        <PublicDocumentsProviderLayout>
            {page}
        </PublicDocumentsProviderLayout>
    );
};

export default Eventos;
