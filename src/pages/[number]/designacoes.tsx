'use client'

import { domainUrl } from '@/atoms/atom'
import Footer from '@/Components/Footer'
import HeadComponent from '@/Components/HeadComponent'
import LifeAndMinistryIcon from '@/Components/Icons/LifeAndMinistryIcon'
import PublicMeetingIcon from '@/Components/Icons/PublicMeetingIcon'
import MidweekPublicCarousel, { MidweekScheduleResponse } from '@/Components/Midweek/MidweekPublicCarousel'
import NotFoundDocument from '@/Components/NotFoundDocument'
import PdfViewer from '@/Components/PdfViewer'
import SchedulesCarousel from '@/Components/SchedulesCarousel'
import Spiner from '@/Components/Spiner'
import { usePublicDocumentsContext } from '@/context/PublicDocumentsContext'
import { getWeekPageOfMonth } from '@/functions/getWeekPageOfMonth'
import DateConverter, { meses } from '@/functions/meses'
import { removeMimeType } from '@/functions/removeMimeType'
import { threeMonths } from '@/functions/threeMonths'
import { useFetch } from '@/hooks/useFetch'
import PublicDocumentsProviderLayout from '@/layouts/providers/publicDocuments/_layout'
import { Categories, ICongregation, IDocument } from '@/types/types'
import { IPublicSchedule } from '@/types/weekendSchedule'
import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import {
    ArrowLeft,
    ChevronRight,
    Clock,
    FileText,
    Users
} from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function Designacoes() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)

    const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

    const [activeTab, setActiveTab] = useState<'midweek' | 'weekend'>('midweek')
    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [pdfInitialPage, setPdfInitialPage] = useState(1)
    const [isCurrentWeek, setIsCurrentWeek] = useState(false)
    const [documentsLifeAndMinistryFilter, setDocumentsLifeAndMinistryFilter] = useState<IDocument[]>()
    const [documentsLifeAndMinistryFilterMonths, setDocumentsLifeAndMinistryFilterMonths] = useState<IDocument[]>()
    const [documentsPublicFilter, setDocumentsPublicFilter] = useState<IDocument[]>()
    const [documentsOthersFilter, setDocumentsOthersFilter] = useState<IDocument[]>()
    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation, isLoading: isLoadingCongregation } = useFetch<ICongregation>(fetchConfigCongregationData)

    const fetchConfigWeekendSchedulesData =
        number && congregation?.id
            ? `/congregation/${congregation.id}/weekendSchedules/public`
            : ""

    const { data: schedules, isLoading: isLoadingSchedules } =
        useFetch<Record<string, IPublicSchedule[]>>(fetchConfigWeekendSchedulesData)

    const fetchConfigMidweekSchedulesData =
        number && congregation?.id
            ? `/congregation/${congregation.id}/midweekSchedules/public`
            : ""

    const { data: midweekSchedules, isLoading: isLoadingMidweekSchedules } =
        useFetch<MidweekScheduleResponse>(fetchConfigMidweekSchedulesData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    useEffect(() => {
        if (number) {
            setCongregationNumber(number as string)
        }
    }, [number, setCongregationNumber])

    useEffect(() => {
        if (documents) {
            setDocumentsLifeAndMinistryFilter(filterDocuments(Categories.meioDeSemana))
            setDocumentsPublicFilter(filterDocuments(Categories.fimDeSemana))
        }
    }, [documents, filterDocuments])

    useEffect(() => {
        const others = documentsLifeAndMinistryFilter?.filter((document) => {
            return !meses.includes(removeMimeType(document.fileName))
        })

        setDocumentsOthersFilter(others)

        let threeMonthsShow = false

        if (new Date().getDate() <= 6 && new Date().getDay() <= 4) {
            threeMonthsShow = threeMonths()
        }

        if (!threeMonthsShow) {
            const filterTwoMonths = documentsLifeAndMinistryFilter?.filter((document) => {
                return (
                    removeMimeType(document.fileName) === DateConverter('mes') ||
                    removeMimeType(document.fileName) === DateConverter('mes+1')
                )
            })

            if (filterTwoMonths) {
                setDocumentsLifeAndMinistryFilterMonths(filterTwoMonths)
            }
        } else {
            const filterThreeMonths = documentsLifeAndMinistryFilter?.filter((document) => {
                return (
                    removeMimeType(document.fileName) === DateConverter('mes-1') ||
                    removeMimeType(document.fileName) === DateConverter('mes') ||
                    removeMimeType(document.fileName) === DateConverter('mes+1')
                )
            })

            if (filterThreeMonths) {
                setDocumentsLifeAndMinistryFilterMonths(filterThreeMonths)
            }
        }
    }, [documentsLifeAndMinistryFilter])

    function handleButtonClick(
        url: string,
        fileName?: string,
        autoDetectPage: boolean = false
    ) {
        let finalUrl = url

        if (process.env.NODE_ENV === 'development' && fileName) {
            const cleanName = removeMimeType(fileName)
            finalUrl = `/pdfs/${cleanName}.pdf`
        }

        if (autoDetectPage && fileName) {
            const monthClicked = removeMimeType(fileName)
            const monthIndex = meses.indexOf(monthClicked)

            const result = getWeekPageOfMonth(monthIndex)

            setPdfInitialPage(result.page)
            setIsCurrentWeek(result.isCurrentWeek)
        } else {
            setPdfInitialPage(1)
            setIsCurrentWeek(false)
        }

        setPdfUrl(finalUrl)
        setPdfShow(true)
    }

    const isLoading = isLoadingCongregation

    return !pdfShow ? (
        <div className="min-h-screen w-full bg-surface-200 text-typography-800 flex flex-col justify-between selection:bg-primary-200 selection:text-white transition-colors duration-300">
            <Head>
                <link rel="manifest" href={`/api/manifest?number=${number}`} />
            </Head>

            <HeadComponent
                title={`Reuniões - Congregação ${congregationData?.name ?? ""}`}
                urlMiniatura={`${domain}/images/designacoes.png`}
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
                        <Users size={15} />
                        <span>Programações Semanais</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                        Reuniões e Designações
                    </h1>
                    <p className="text-xs sm:text-sm text-typography-500">
                        Consulte a programação da reunião de meio de semana e fim de semana
                    </p>
                </div>

                {/* Alternador de Abas (Tabs) Moderno */}
                <div className="flex bg-surface-100 border border-surface-300 rounded-xl p-1 shadow-sm">
                    <button
                        onClick={() => setActiveTab('midweek')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                            activeTab === 'midweek'
                                ? 'bg-primary-200 text-white shadow-sm'
                                : 'text-typography-600 hover:text-typography-900 hover:bg-surface-200/60'
                        }`}
                    >
                        <LifeAndMinistryIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Meio de Semana</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('weekend')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg font-bold text-xs sm:text-sm transition-all ${
                            activeTab === 'weekend'
                                ? 'bg-primary-200 text-white shadow-sm'
                                : 'text-typography-600 hover:text-typography-900 hover:bg-surface-200/60'
                        }`}
                    >
                        <PublicMeetingIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Fim de Semana</span>
                    </button>
                </div>

                {/* Horário da Reunião Selecionada */}
                <div className="bg-surface-100 border border-surface-300 rounded-xl p-3.5 sm:p-4 shadow-sm flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center gap-2 text-primary-200 font-bold">
                        <Clock size={16} />
                        <span>
                            {activeTab === 'midweek' ? 'Reunião Vida e Ministério:' : 'Reunião Pública e Sentinela:'}
                        </span>
                    </div>

                    <div className="font-semibold text-typography-800">
                        {activeTab === 'midweek' ? (
                            congregationData?.dayMeetingLifeAndMinistary ? (
                                <span>
                                    {congregationData.dayMeetingLifeAndMinistary}
                                    {congregationData.hourMeetingLifeAndMinistary
                                        ? ` às ${congregationData.hourMeetingLifeAndMinistary.slice(0, 5)}`
                                        : ''}
                                </span>
                            ) : (
                                <span className="text-typography-400 font-normal">Não informado</span>
                            )
                        ) : congregationData?.dayMeetingPublic ? (
                            <span>
                                {congregationData.dayMeetingPublic}
                                {congregationData.hourMeetingPublic
                                    ? ` às ${congregationData.hourMeetingPublic.slice(0, 5)}`
                                    : ''}
                            </span>
                        ) : (
                            <span className="text-typography-400 font-normal">Não informado</span>
                        )}
                    </div>
                </div>

                {/* Conteúdo da Aba Meio de Semana */}
                {activeTab === 'midweek' && (
                    <div className="flex flex-col gap-5">
                        {isLoadingMidweekSchedules && !documents ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-2 text-typography-400">
                                <Spiner size="w-8 h-8" />
                                <span className="text-xs">Carregando programação...</span>
                            </div>
                        ) : (
                            <>
                                {/* 1. Verifica se congregação realmente usa o sistema (tem ao menos 1 designado) */}
                                {midweekSchedules &&
                                    Object.keys(midweekSchedules).length > 0 &&
                                    Object.values(midweekSchedules).some(weeks => weeks.length > 0) &&
                                    Object.values(midweekSchedules).some(weeks =>
                                        weeks.some(week =>
                                            week.chairman ||
                                            week.openingPrayer ||
                                            week.closingPrayer ||
                                            week.cbsConductor ||
                                            week.cbsReader ||
                                            (week.parts || []).some(p => p.assignedPublisher)
                                        )
                                    ) ? (
                                    <div className="flex flex-col gap-4">
                                        <MidweekPublicCarousel schedules={midweekSchedules} />

                                        {/* Se também houver PDFs anexados pela congregação, exibe como opção complementar */}
                                        {((documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length > 0) || (documentsOthersFilter && documentsOthersFilter.length > 0)) && (
                                            <div className="mt-4 pt-4 border-t border-surface-300 flex flex-col gap-3">
                                                <h3 className="text-xs font-bold text-typography-600 uppercase tracking-wider flex items-center gap-2">
                                                    <FileText size={15} />
                                                    <span>Ou consulte os arquivos e apostilas em PDF</span>
                                                </h3>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {(documentsLifeAndMinistryFilterMonths || []).map((doc) => {
                                                        const monthName = removeMimeType(doc.fileName);
                                                        return (
                                                            <motion.button
                                                                key={doc.id}
                                                                whileHover={{ scale: 1.01, y: -1 }}
                                                                whileTap={{ scale: 0.99 }}
                                                                onClick={() => handleButtonClick(doc.url, doc.fileName, true)}
                                                                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 border border-surface-300 hover:border-primary-200 shadow-2xs text-left group transition-all"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-lg bg-primary-200/10 text-primary-200 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                                        <FileText size={18} />
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-[10px] uppercase font-bold text-primary-200">Apostila PDF</span>
                                                                        <span className="font-bold text-xs sm:text-sm text-typography-800 group-hover:text-primary-200 transition-colors">
                                                                            {monthName}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <ChevronRight size={16} className="text-typography-400 group-hover:text-primary-200 group-hover:translate-x-0.5 transition-transform" />
                                                            </motion.button>
                                                        );
                                                    })}

                                                    {(documentsOthersFilter || []).map((doc) => (
                                                        <motion.button
                                                            key={doc.id}
                                                            whileHover={{ scale: 1.01, y: -1 }}
                                                            whileTap={{ scale: 0.99 }}
                                                            onClick={() => handleButtonClick(doc.url, doc.fileName, true)}
                                                            className="flex items-center justify-between p-3.5 rounded-xl bg-surface-100 border border-surface-300 hover:border-primary-200 shadow-2xs text-left group transition-all"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-lg bg-surface-200 text-typography-600 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                                    <FileText size={18} />
                                                                </div>
                                                                <span className="font-bold text-xs text-typography-800 group-hover:text-primary-200 transition-colors">
                                                                    {removeMimeType(doc.fileName)}
                                                                </span>
                                                            </div>
                                                            <ChevronRight size={16} className="text-typography-400 group-hover:text-primary-200 group-hover:translate-x-0.5 transition-transform" />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length > 0) || (documentsOthersFilter && documentsOthersFilter.length > 0) ? (
                                    /* 2. Se não houver dados no sistema, exibe os PDFs como principal */
                                    <div className="flex flex-col gap-3">
                                        <h2 className="text-sm font-bold text-typography-700 uppercase tracking-wider">
                                            Apostilas e Programações em PDF
                                        </h2>

                                        {documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {documentsLifeAndMinistryFilterMonths.map((doc) => {
                                                    const monthName = removeMimeType(doc.fileName)
                                                    return (
                                                        <motion.button
                                                            key={doc.id}
                                                            whileHover={{ scale: 1.015, y: -2 }}
                                                            whileTap={{ scale: 0.985 }}
                                                            onClick={() => handleButtonClick(doc.url, doc.fileName, true)}
                                                            className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group"
                                                        >
                                                            <div className="flex items-center gap-3.5">
                                                                <div className="w-12 h-12 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                                    <FileText size={24} />
                                                                </div>
                                                                <div>
                                                                    <span className="text-[11px] font-bold uppercase tracking-wider text-primary-200 block mb-0.5">
                                                                        Programação
                                                                    </span>
                                                                    <h3 className="font-bold text-base sm:text-lg text-typography-800 group-hover:text-primary-200 transition-colors">
                                                                        {monthName}
                                                                    </h3>
                                                                </div>
                                                            </div>

                                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-typography-400 group-hover:text-primary-200 group-hover:bg-primary-200/10 transition-all">
                                                                <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                                            </div>
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {documentsOthersFilter && documentsOthersFilter.length > 0 && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                                {documentsOthersFilter.map((doc) => (
                                                    <motion.button
                                                        key={doc.id}
                                                        whileHover={{ scale: 1.015, y: -2 }}
                                                        whileTap={{ scale: 0.985 }}
                                                        onClick={() => handleButtonClick(doc.url, doc.fileName, true)}
                                                        className="flex items-center justify-between p-4 rounded-xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-surface-200 text-typography-600 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-sm text-typography-800 group-hover:text-primary-200 transition-colors">
                                                                    {removeMimeType(doc.fileName)}
                                                                </h4>
                                                            </div>
                                                        </div>
                                                        <ChevronRight size={16} className="text-typography-400 group-hover:text-primary-200 transition-colors" />
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    /* 3. Se não houver nenhum dos dois */
                                    <NotFoundDocument message="Nenhuma programação da reunião Vida e Ministério encontrada!" />
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Conteúdo da Aba Fim de Semana */}
                {activeTab === 'weekend' && (
                    <div className="flex flex-col gap-4">
                        <h2 className="text-sm font-bold text-typography-700 uppercase tracking-wider">
                            Discursos e Sentinela
                        </h2>

                        {!documents ? (
                            <div className="py-12 flex flex-col items-center justify-center gap-2 text-typography-400">
                                <Spiner size="w-8 h-8" />
                                <span className="text-xs">Carregando programação...</span>
                            </div>
                        ) : documentsPublicFilter && documentsPublicFilter.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {documentsPublicFilter.map((doc) => (
                                    <motion.button
                                        key={doc.id}
                                        whileHover={{ scale: 1.015, y: -2 }}
                                        whileTap={{ scale: 0.985 }}
                                        onClick={() => handleButtonClick(doc.url)}
                                        className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-200 block mb-0.5">
                                                    Programação
                                                </span>
                                                <h3 className="font-bold text-base sm:text-lg text-typography-800 group-hover:text-primary-200 transition-colors">
                                                    {removeMimeType(doc.fileName)}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-typography-400 group-hover:text-primary-200 group-hover:bg-primary-200/10 transition-all">
                                            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : schedules && Object.keys(schedules).length > 0 ? (
                            <div className="w-full bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm">
                                <SchedulesCarousel schedules={schedules} />
                            </div>
                        ) : (
                            <NotFoundDocument message="Nenhuma programação da Reunião Pública encontrada!" />
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
        <PdfViewer
            isCurrentWeek={isCurrentWeek}
            initialPage={pdfInitialPage}
            url={pdfUrl}
            setPdfShow={() => setPdfShow(false)}
        />
    )
}

Designacoes.getLayout = (page: React.ReactElement) => {
    return <PublicDocumentsProviderLayout>{page}</PublicDocumentsProviderLayout>
}

export default Designacoes
