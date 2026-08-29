import { domainUrl } from "@/atoms/atom"
import Footer from "@/Components/Footer"
import HeadComponent from "@/Components/HeadComponent"
import CleanIcon from "@/Components/Icons/CleanIcon"
import PrechingHomeIcon from "@/Components/Icons/PreachingHomeIcon"
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon"
import ReportIcon from "@/Components/Icons/ReportIcon"
import { useFetch } from "@/hooks/useFetch"
import { ICongregation, INotice } from "@/types/types"
import { AnimatePresence, motion } from "framer-motion"
import { useAtomValue } from "jotai"
import {
    Bell,
    Calculator as CalculatorIcon,
    CalendarDays as CalendarDaysIcon,
    ChevronRight,
    LogIn,
    MapPin
} from "lucide-react"
import { GetServerSideProps } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import quadroDefault from "../../../public/images/miniatura-gray.png"

interface HomeProps {
    serverNumber?: string
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.07,
            delayChildren: 0.05
        }
    }
}

const cardVariants = {
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

function Home({ serverNumber }: HomeProps) {
    const router = useRouter()
    const number = serverNumber || (router.query.number as string)
    const domain = useAtomValue(domainUrl)

    const [notices, setNotices] = useState<INotice[]>([])
    const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0)

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation, isLoading: isLoadingCongregation } =
        useFetch<ICongregation>(fetchConfigCongregationData)

    const fetchConfigNoticesData = congregation?.id
        ? `/notices/${congregation.id}`
        : ""
    const { data: noticesData, isLoading: isLoadingNotices } =
        useFetch<INotice[]>(fetchConfigNoticesData)

    useEffect(() => {
        if (noticesData) {
            const today = new Date().getDate()
            const activeNotices = noticesData.filter((notice) => {
                if (notice.startDay && notice.endDay) {
                    return today >= notice.startDay && today <= notice.endDay
                }
                return true
            })
            setNotices(activeNotices)
        }
    }, [noticesData])

    // Alternar avisos automaticamente
    useEffect(() => {
        if (notices.length <= 1) return
        const interval = setInterval(() => {
            setCurrentNoticeIndex((prev) => (prev + 1) % notices.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [notices.length])

    // Itens do Quadro com os nomes e ícones oficiais
    const boardItems = useMemo(
        () => [
            {
                title: "Relatório",
                description: "Envio do relatório mensal de serviço de campo",
                href: `/${number}/relatorio`,
                icon: ReportIcon,
                iconWrapperClass: "bg-primary-200/10 text-primary-200 group-hover:bg-primary-200 group-hover:text-white"
            },
            {
                title: "Reuniões",
                description: "Programação de meio de semana e fim de semana",
                href: `/${number}/designacoes`,
                icon: PublicMeetingIcon,
                iconWrapperClass: "bg-primary-200/10 text-primary-200 group-hover:bg-primary-200 group-hover:text-white"
            },
            {
                title: "Limpeza",
                description: "Escala semanal e grupos de limpeza do Salão",
                href: `/${number}/limpeza`,
                icon: CleanIcon,
                iconWrapperClass: "bg-primary-200/10 text-primary-200 group-hover:bg-primary-200 group-hover:text-white"
            },
            {
                title: "Campo",
                description: "Saídas para a pregação e testemunho público",
                href: `/${number}/campo`,
                icon: PrechingHomeIcon,
                iconWrapperClass: "bg-primary-200/10 text-primary-200 group-hover:bg-primary-200 group-hover:text-white"
            },
            {
                title: "Financeiro",
                description: "Demonstrativo e contas da congregação",
                href: `/${number}/financeiro`,
                icon: CalculatorIcon,
                iconWrapperClass: "bg-primary-200/10 text-primary-200 group-hover:bg-primary-200 group-hover:text-white"
            },
            {
                title: "Eventos Especiais",
                description: "Visita do superintendente, assembleias e congressos",
                href: `/${number}/eventos`,
                icon: CalendarDaysIcon,
                iconWrapperClass: "bg-primary-200/10 text-primary-200 group-hover:bg-primary-200 group-hover:text-white"
            }
        ],
        [number]
    )

    const isFetching = isLoadingCongregation || !congregation

    return (
        <div className="min-h-screen w-full bg-surface-200 text-typography-800 flex flex-col justify-between selection:bg-primary-200 selection:text-white transition-colors duration-300">
            <Head>
                <link rel="manifest" href={`/api/manifest?number=${number}`} />
            </Head>

            <HeadComponent
                title={
                    congregation?.name
                        ? `Quadro de Anúncios - Congregação ${congregation.name}`
                        : "Quadro de Anúncios"
                }
                urlMiniatura={`${domain}/images/miniatura.png`}
            />

            {/* Banner Superior de Avisos (fica acima do header, sem cobrir o botão de login) */}
            {notices.length > 0 && (
                <div className="bg-primary-200 text-white px-4 py-2.5 shadow-sm relative z-40 w-full">
                    <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
                        <Link
                            href={`/${number}/anuncios`}
                            className="flex items-center gap-2 overflow-hidden flex-1 group hover:opacity-90 transition"
                        >
                            <span className="flex items-center justify-center p-1 rounded-full bg-white/20 text-white shrink-0">
                                <Bell size={13} />
                            </span>
                            <div className="overflow-hidden whitespace-nowrap text-ellipsis flex items-center gap-1.5">
                                <span className="font-bold uppercase tracking-wider text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">
                                    Aviso
                                </span>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={currentNoticeIndex}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2 }}
                                        className="font-medium truncate"
                                    >
                                        <strong className="mr-1">
                                            {notices[currentNoticeIndex]?.title}:
                                        </strong>
                                        <span>{notices[currentNoticeIndex]?.text}</span>
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </Link>

                        <Link
                            href={`/${number}/anuncios`}
                            className="flex items-center gap-1 text-[11px] font-semibold shrink-0 bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-full transition"
                        >
                            {notices.length > 1 && (
                                <span className="text-[10px] opacity-80 mr-0.5">
                                    {currentNoticeIndex + 1}/{notices.length}
                                </span>
                            )}
                            <span>Ver todos</span>
                            <ChevronRight size={13} />
                        </Link>
                    </div>
                </div>
            )}

            {/* Header com a Imagem do Salão do Reino */}
            <div className="relative w-full overflow-hidden bg-surface-200">
                {/* Top Nav: Botão de Login no topo superior direito */}
                <div className="absolute top-0 left-0 right-0 z-30 px-4 sm:px-6 py-3.5 flex items-center justify-end">
                    <Link
                        href="/login"
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-200/95 hover:bg-primary-150 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold shadow-md transition-all active:scale-95"
                        title="Acessar painel administrativo"
                    >
                        <LogIn size={15} />
                        <span>Login</span>
                    </Link>
                </div>

                {/* Hero Banner com a Foto e Gradiente de Fusão */}
                <div className="relative h-56 sm:h-64 md:h-72 w-full overflow-hidden flex items-center justify-center bg-typography-900">
                    {congregation?.image_url ? (
                        <Image
                            src={congregation.image_url}
                            alt="Foto do Salão do Reino"
                            fill
                            priority
                            className="object-cover object-center brightness-40"
                        />
                    ) : (
                        <Image
                            src={quadroDefault}
                            alt="Quadro de Anúncios"
                            fill
                            priority
                            className="object-cover object-center opacity-30"
                        />
                    )}

                    {/* Gradiente de fusão inferior suave com a cor de fundo do tema */}
                    <div
                        aria-hidden
                        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none"
                        style={{
                            background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgb(var(--color-surface-200)) 100%)`
                        }}
                    />

                    {/* Conteúdo Central do Header */}
                    <div className="relative z-20 text-center px-4 max-w-3xl flex flex-col items-center mt-3">
                        <span className="text-2xl sm:text-3xl md:text-4xl titulo text-white font-bold tracking-wide drop-shadow-md">
                            Quadro de Anúncios
                        </span>

                        {isFetching ? (
                            <div className="h-6 w-48 shimmer rounded-md mt-2" />
                        ) : (
                            <div className="mt-1 flex flex-col items-center gap-1">
                                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-white/95 drop-shadow">
                                    Congregação {congregation?.name}
                                </h1>
                                {congregation?.circuit && (
                                    <p className="text-xs sm:text-sm text-typography-300 flex items-center gap-1">
                                        <MapPin size={13} className="text-primary-100" />
                                        <span>
                                            {congregation?.circuit}
                                            {congregation?.city ? ` • ${congregation.city}` : ""}
                                        </span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Conteúdo Principal / Grid dos Botões do Quadro */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col justify-center">
                {isFetching ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-20 sm:h-24 rounded-xl shimmer border border-surface-300"
                            />
                        ))}
                    </div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
                    >
                        {boardItems.map((item) => {
                            const IconComponent = item.icon
                            return (
                                <motion.div
                                    key={item.title}
                                    variants={cardVariants}
                                    whileHover={{ scale: 1.015, y: -2 }}
                                    whileTap={{ scale: 0.985 }}
                                >
                                    <Link
                                        href={item.href}
                                        className="group flex items-center justify-between p-4 sm:p-4.5 rounded-xl bg-surface-100 border border-surface-300 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-200 text-left"
                                    >
                                        <div className="flex items-center gap-3.5 sm:gap-4">
                                            {/* Container do Ícone clássico do sistema */}
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 ${item.iconWrapperClass}`}
                                            >
                                                <IconComponent className="w-6 h-6" />
                                            </div>

                                            {/* Textos com a tipografia do sistema */}
                                            <div>
                                                <h3 className="font-bold text-base sm:text-lg text-typography-800 group-hover:text-primary-200 transition-colors">
                                                    {item.title}
                                                </h3>
                                                <p className="text-xs text-typography-500 line-clamp-1">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Seta indicadora */}
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-typography-400 group-hover:text-primary-200 group-hover:bg-primary-200/10 transition-all shrink-0 ml-2">
                                            <ChevronRight
                                                size={18}
                                                className="group-hover:translate-x-0.5 transition-transform"
                                            />
                                        </div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </main>

            {/* Footer Oficial do Sistema (com Mudar Tema em formato pill, Instalar App e Política de Privacidade) */}
            <Footer
                nCong={number as string}
                ano={new Date().getFullYear()}
                nomeCongregacao={`Congregação ${congregation?.name ?? ""} ${congregation?.circuit ? `- ${congregation.circuit}` : ""}`}
                aviso="Atenção: favor não compartilhar acesso ao site para outros que não pertencem à congregação."
            />
        </div>
    )
}

Home.getLayout = (page: React.ReactElement) => {
    return page // layout próprio independente
}

export default Home

export const getServerSideProps: GetServerSideProps = async (context) => {
    const { number } = context.params as { number: string }
    return {
        props: {
            serverNumber: number
        }
    }
}
