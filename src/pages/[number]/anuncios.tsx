import { domainUrl } from "@/atoms/atom"
import Footer from "@/Components/Footer"
import HeadComponent from "@/Components/HeadComponent"
import { useFetch } from "@/hooks/useFetch"
import { ICongregation, INotice } from "@/types/types"
import { AnimatePresence, motion } from "framer-motion"
import { useAtomValue } from "jotai"
import {
    ArrowLeft,
    Bell,
    BellOff,
    Check,
    Clock,
    Copy,
    Share2,
    Sparkles
} from "lucide-react"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring",
            stiffness: 280,
            damping: 22
        }
    }
}

function NoticesPage() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)
    const [copiedId, setCopiedId] = useState<string | null>(null)

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation, isLoading: isLoadingCongregation } =
        useFetch<ICongregation>(fetchConfigCongregationData)

    const fetchConfigNoticesData = congregation?.id
        ? `/notices/${congregation.id}`
        : ""
    const { data: noticesData, isLoading: isLoadingNotices } =
        useFetch<INotice[]>(fetchConfigNoticesData)

    const activeNotices = useMemo(() => {
        if (!noticesData) return []
        const today = new Date().getDate()
        return noticesData.filter((notice) => {
            if (notice.startDay && notice.endDay) {
                return today >= notice.startDay && today <= notice.endDay
            }
            return true
        })
    }, [noticesData])

    const handleCopyNotice = (notice: INotice) => {
        const textToCopy = `📢 *${notice.title}*\n\n${notice.text}`
        navigator.clipboard.writeText(textToCopy)
        setCopiedId(notice.id)
        setTimeout(() => setCopiedId(null), 3000)
    }

    const isLoading = isLoadingCongregation || isLoadingNotices

    return (
        <div className="min-h-screen w-full bg-surface-200 text-typography-800 flex flex-col justify-between selection:bg-primary-200 selection:text-white transition-colors duration-300">
            <Head>
                <link rel="manifest" href={`/api/manifest?number=${number}`} />
            </Head>

            <HeadComponent
                title={`Anúncios - Congregação ${congregation?.name ?? ""}`}
                urlMiniatura={`${domain}/images/miniatura.png`}
            />

            {/* Cabeçalho da Página de Anúncios */}
            <div className="w-full bg-surface-100 border-b border-surface-300/80 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-surface-100/90">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
                    <Link
                        href={`/${number}`}
                        className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-primary-200 hover:text-primary-150 transition active:scale-95 px-2.5 py-1.5 rounded-lg hover:bg-surface-200"
                    >
                        <ArrowLeft size={17} />
                        <span>Voltar ao Quadro</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        {activeNotices.length > 0 && (
                            <span className="bg-primary-200/10 text-primary-200 font-bold text-xs px-2.5 py-1 rounded-full border border-primary-200/20">
                                {activeNotices.length}{" "}
                                {activeNotices.length === 1 ? "anúncio ativo" : "anúncios ativos"}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
                {/* Título da Seção */}
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-primary-200 font-bold text-xs uppercase tracking-wider">
                        <Bell size={15} />
                        <span>Informativos da Congregação</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-typography-800 tracking-tight">
                        Anúncios e Avisos
                    </h1>
                    {congregation?.name && (
                        <p className="text-xs sm:text-sm text-typography-500">
                            Congregação {congregation.name}
                            {congregation?.circuit ? ` • ${congregation.circuit}` : ""}
                        </p>
                    )}
                </div>

                {/* Lista de Anúncios */}
                {isLoading ? (
                    <div className="flex flex-col gap-4">
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="h-44 rounded-2xl shimmer border border-surface-300"
                            />
                        ))}
                    </div>
                ) : activeNotices.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-4"
                    >
                        {activeNotices.map((notice) => (
                            <motion.div
                                key={notice.id}
                                variants={itemVariants}
                                className="bg-surface-100 border border-surface-300 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-3 relative overflow-hidden group"
                            >
                                {/* Barra lateral de destaque */}
                                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-200 group-hover:w-2 transition-all" />

                                {/* Cabeçalho do Anúncio */}
                                <div className="flex items-start justify-between gap-3 pl-1">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                                            <Bell size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-base sm:text-lg font-bold text-typography-800">
                                                {notice.title}
                                            </h2>
                                            {notice.startDay && notice.endDay && (
                                                <span className="text-[11px] text-typography-400 flex items-center gap-1 mt-0.5">
                                                    <Clock size={12} />
                                                    <span>
                                                        Válido do dia {notice.startDay} ao dia {notice.endDay}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Botão de Copiar / Compartilhar */}
                                    <button
                                        onClick={() => handleCopyNotice(notice)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-200/80 hover:bg-primary-200/10 hover:text-primary-200 text-typography-600 text-xs font-semibold transition active:scale-95 shrink-0"
                                        title="Copiar texto do anúncio"
                                    >
                                        {copiedId === notice.id ? (
                                            <>
                                                <Check size={13} className="text-emerald-500" />
                                                <span className="text-emerald-500">Copiado!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={13} />
                                                <span>Copiar</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Texto do Anúncio */}
                                <div className="pl-1 text-xs sm:text-sm text-typography-700 leading-relaxed whitespace-pre-wrap font-normal border-t border-surface-300/40 pt-3">
                                    {notice.text}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    /* Estado Vazio Elegante */
                    <div className="bg-surface-100 border border-surface-300 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                        <div className="w-14 h-14 rounded-2xl bg-primary-200/10 text-primary-200 flex items-center justify-center mb-1">
                            <BellOff size={28} />
                        </div>
                        <h2 className="text-lg font-bold text-typography-800">
                            Nenhum anúncio no momento
                        </h2>
                        <p className="text-xs sm:text-sm text-typography-500 max-w-md">
                            Não há avisos ou comunicados ativos publicados para a congregação no momento.
                        </p>
                        <Link
                            href={`/${number}`}
                            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-200 hover:bg-primary-150 text-white text-xs sm:text-sm font-semibold transition shadow-sm"
                        >
                            <ArrowLeft size={15} />
                            <span>Voltar para o Quadro</span>
                        </Link>
                    </div>
                )}
            </main>

            {/* Footer Oficial */}
            <Footer
                nCong={number as string}
                ano={new Date().getFullYear()}
                nomeCongregacao={`Congregação ${congregation?.name ?? ""} ${
                    congregation?.circuit ? `- ${congregation.circuit}` : ""
                }`}
                aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação."
            />
        </div>
    )
}

NoticesPage.getLayout = function getLayout(page: React.ReactElement) {
    return page // layout próprio independente
}

export default NoticesPage
