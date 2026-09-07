'use client'

import { domainUrl } from '@/atoms/atom'
import { themeAtom } from '@/atoms/themeAtoms'
import CleaningScheduleCarousel from '@/Components/CleaningScheduleCarousel'
import Footer from '@/Components/Footer'
import HeadComponent from '@/Components/HeadComponent'
import NotFoundDocument from '@/Components/NotFoundDocument'
import PdfViewer from '@/Components/PdfViewer'
import Spiner from '@/Components/Spiner'
import { API_ROUTES } from '@/constants/apiRoutes'
import { usePublicDocumentsContext } from '@/context/PublicDocumentsContext'
import { removeMimeType } from '@/functions/removeMimeType'
import { useFetch } from '@/hooks/useFetch'
import PublicDocumentsProviderLayout from '@/layouts/providers/publicDocuments/_layout'
import { ICleaningScheduleResponse } from '@/types/cleaning'
import { Categories, ICongregation, IDocument } from '@/types/types'
import { motion } from 'framer-motion'
import { useAtomValue } from 'jotai'
import { ArrowLeft, ChevronRight, FileText, Sparkles } from 'lucide-react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

function Limpeza() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)
    const theme = useAtomValue(themeAtom)

    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation, isLoading: isLoadingCongregation } =
        useFetch<ICongregation>(fetchConfigCongregationData)

    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    const urlSchedulesConfig = congregation
        ? `${API_ROUTES.CLEANING_SCHEDULES}/congregation/${congregation.id}`
        : ""
    const { data: scheduleData, isLoading: isLoadingSchedules } =
        useFetch<ICleaningScheduleResponse>(urlSchedulesConfig)

    const { setCongregationNumber, documents, filterDocuments } =
        usePublicDocumentsContext()

    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [documentsFilter, setDocumentsFilter] = useState<IDocument[]>()

    useEffect(() => {
        if (number) {
            setCongregationNumber(number as string)
        }
    }, [number, setCongregationNumber])

    useEffect(() => {
        if (documents) {
            setDocumentsFilter(filterDocuments(Categories.limpeza))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    const isLoading = isLoadingCongregation || isLoadingSchedules

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
                title={`Limpeza do Salão - Congregação ${congregationData?.name ?? ""}`}
                urlMiniatura={`${domain}/images/limpeza-green.png`}
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
                        <Sparkles size={15} />
                        <span>Manutenção e Cuidados</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                        Limpeza do Salão do Reino
                    </h1>
                    <p className="text-xs sm:text-sm text-typography-500">
                        Consulte a escala semanal e os grupos designados para a limpeza
                    </p>
                </div>

                {/* Exibição da Programação */}
                {isLoading ? (
                    <div className="py-16 flex flex-col items-center justify-center gap-2 text-typography-400">
                        <Spiner size="w-8 h-8" />
                        <span className="text-xs">Carregando programação de limpeza...</span>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* 1) Programação interativa do banco */}
                        {scheduleData?.schedules && scheduleData.schedules.length > 0 ? (
                            <div className="w-full bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-6 shadow-sm">
                                <CleaningScheduleCarousel schedule={scheduleData} />
                            </div>
                        ) : documentsFilter && documentsFilter.length > 0 ? (
                            /* 2) Documentos em PDF */
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {documentsFilter.map((document) => (
                                    <motion.button
                                        key={document.id}
                                        whileHover={{ scale: 1.015, y: -2 }}
                                        whileTap={{ scale: 0.985 }}
                                        onClick={() => handleButtonClick(document.url)}
                                        className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all text-left group"
                                    >
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-12 h-12 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center group-hover:bg-primary-200 group-hover:text-white transition-colors">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <span className="text-[11px] font-bold uppercase tracking-wider text-primary-200 block mb-0.5">
                                                    Documento
                                                </span>
                                                <h3 className="font-bold text-base sm:text-lg text-typography-800 group-hover:text-primary-200 transition-colors">
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
                        ) : (
                            /* 3) Sem documentos */
                            <NotFoundDocument message="Nenhuma programação de limpeza encontrada!" />
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
    )
}

Limpeza.getLayout = (page: React.ReactElement) => {
    return (
        <PublicDocumentsProviderLayout>
            {page}
        </PublicDocumentsProviderLayout>
    )
}

export default Limpeza
