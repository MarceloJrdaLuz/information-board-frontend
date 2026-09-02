import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import FilterSpeakersCongregation from "@/Components/FilterSpeakersCongregation"
import { ListGeneric } from "@/Components/ListGeneric"
import ScrollToTopButton from "@/Components/ScrollToTopButton"
import SkeletonSpeakersList from "@/Components/SkeletonSpeakersList"
import SpeakersListPdf from "@/Components/SpeakerListPdf"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteSpeakerAtom, selectedSpeakerAtom } from "@/atoms/speakerAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ICongregation, ISpeaker } from "@/types/types"
import { formatNameCongregation } from "@/utils/formatCongregationName"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { BlobProvider, Document, PDFViewer } from "@react-pdf/renderer"
import { useAtom, useSetAtom } from "jotai"
import { Building2, Eye, FileDown, MapPin, Mic, Phone, Plus, Search, Users, X } from "lucide-react"
import Router from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

function SpeakersPage() {
    const { congregation } = useCongregationContext()
    const deleteSpeaker = useSetAtom(deleteSpeakerAtom)
    const setSpeakerUpdate = useSetAtom(selectedSpeakerAtom)
    const [crumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    const [speakers, setSpeakers] = useState<ISpeaker[]>()
    const [filteredByCongregation, setFilteredByCongregation] = useState<ICongregation | null>(null)
    const [speakerCongregationName, setSpeakerCongregationName] = useState("")
    const [showPreview, setShowPreview] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const { data: getSpeakers, mutate } = useAuthorizedFetch<ISpeaker[]>("/speakers", {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    const { data: getAuxiliaryCongregations } = useAuthorizedFetch<ICongregation[]>("/auxiliaryCongregations", {
        allowedRoles: ["ADMIN_CONGREGATION", "TALK_MANAGER"]
    })

    // junta a congregação principal + auxiliares
    const congregationsForFilter: ICongregation[] = congregation
        ? [congregation, ...(getAuxiliaryCongregations ?? [])]
        : (getAuxiliaryCongregations ?? [])

    useEffect(() => {
        setPageActive('/arranjo-oradores/oradores')
    }, [setPageActive])

    useEffect(() => {
        if (getSpeakers) {
            const sort = sortArrayByProperty(getSpeakers, "fullName")
            setSpeakers(sort)
        }
    }, [getSpeakers])

    useEffect(() => {
        if (!getSpeakers) return

        if (filteredByCongregation) {
            const filtered = getSpeakers.filter(
                (s) => s.originCongregation.id === filteredByCongregation.id
            )
            setSpeakers(filtered)
            setSpeakerCongregationName(formatNameCongregation(filteredByCongregation.name, filteredByCongregation.city))
        } else {
            const sort = sortArrayByProperty(getSpeakers, "fullName")
            setSpeakers(sort)
            setSpeakerCongregationName("Todas as congregações")
        }
    }, [filteredByCongregation, getSpeakers])

    const normalize = (text: string) =>
        text
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()

    // Filtro por texto (nome, congregação ou número de discurso)
    const displayedSpeakers = useMemo(() => {
        if (!speakers) return []

        const term = normalize(searchQuery.trim())
        if (!term) return speakers

        return speakers.filter(speaker => {
            const nameMatch = normalize(speaker.fullName ?? "").includes(term)
            const congMatch = normalize(speaker.originCongregation?.name ?? "").includes(term)
            const phoneMatch = (speaker.phone ?? "").includes(term)
            const talkMatch = speaker.talks?.some(t => t.number.toString().includes(term) || normalize(t.title ?? "").includes(term))
            return nameMatch || congMatch || phoneMatch || talkMatch
        })
    }, [speakers, searchQuery])

    // Métricas
    const stats = useMemo(() => {
        const total = getSpeakers?.length ?? 0
        const local = getSpeakers?.filter(s => s.originCongregation?.id === congregation?.id).length ?? 0
        const external = total - local
        return { total, local, external }
    }, [getSpeakers, congregation])

    function handleDelete(speaker_id: string) {
        toast.promise(deleteSpeaker(speaker_id), {
            pending: 'Excluindo orador...',
        }).then(() => {
            mutate()
        }).catch(err => {
            console.error(err)
        })
    }

    const PdfLinkComponent = () => (
        <BlobProvider
            document={
                <Document>
                    <SpeakersListPdf
                        speakers={displayedSpeakers ?? []}
                        congregationName={speakerCongregationName}
                    />
                </Document>
            }
        >
            {({ blob, url, loading }) => (
                <a href={url ?? "#"} download={`Oradores_${speakerCongregationName || "congregacao"}.pdf`}>
                    <Button
                        outline
                        className="text-primary-200 px-3 py-2 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center gap-1.5 shadow-sm text-xs font-semibold whitespace-nowrap"
                    >
                        <FileDown className="h-4 w-4" />
                        <span>{loading ? "Gerando..." : "Baixar PDF"}</span>
                    </Button>
                </a>
            )}
        </BlobProvider>
    )

    function renderSkeleton() {
        return (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pb-36 w-full animate-pulse">
                {Array(6).fill(0).map((_, i) => (<SkeletonSpeakersList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Oradores"} />

            <section className="flex flex-col w-full min-h-full p-3 sm:p-5 md:p-6 gap-6 max-w-7xl mx-auto">
                {/* ==================================================== */}
                {/* 1. HERO & METRICS CARD                               */}
                {/* ==================================================== */}
                <div className="flex flex-col gap-4 bg-surface-100 border border-surface-300 rounded-2xl p-4 sm:p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-primary-200 font-semibold text-xs uppercase tracking-wider">
                                <Users className="h-4 w-4" />
                                <span>Arranjo de Oradores • Fim de Semana</span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold text-typography-900">
                                Oradores Cadastrados
                            </h1>
                            <p className="text-xs sm:text-sm text-typography-500">
                                Gerencie os oradores locais e visitantes cadastrados para a reunião de fim de semana.
                            </p>
                        </div>

                        <Button
                            outline
                            onClick={() => Router.push('/arranjo-oradores/oradores/add')}
                            className="text-primary-200 p-2.5 md:p-3 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center justify-center gap-2 shadow-sm transition-all whitespace-nowrap self-start sm:self-center"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="font-semibold text-sm">Criar orador</span>
                        </Button>
                    </div>

                    {/* Metric Badges Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-surface-300">
                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                                <Users className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Total de Oradores</div>
                                <div className="text-base font-bold text-typography-900">{stats.total}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                                <Mic className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Locais</div>
                                <div className="text-base font-bold text-typography-900">{stats.local}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-200/50 border border-surface-300/80">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="text-[11px] font-medium text-typography-500">Visitantes</div>
                                <div className="text-base font-bold text-typography-900">{stats.external}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================================================== */}
                {/* 2. SEARCH & FILTER TOOLBAR                          */}
                {/* ==================================================== */}
                <div className="sticky top-2 z-30 flex flex-wrap items-center justify-between gap-3 bg-surface-100/95 backdrop-blur-md border border-surface-300 rounded-xl px-3.5 py-2.5 sm:px-4 sm:py-3 shadow-md">
                    {/* Barra de busca */}
                    <div className="relative flex-1 min-w-[220px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-typography-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nome, congregação ou número do tema..."
                            className="w-full pl-9 pr-8 py-2 rounded-xl border border-surface-300 bg-surface-200/60 text-xs sm:text-sm text-typography-900 placeholder:text-typography-400 focus:outline-none focus:ring-1 focus:ring-primary-200 focus:bg-surface-100 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-typography-400 hover:text-typography-700 p-1 rounded-full text-xs"
                                title="Limpar busca"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filtro de Congregação e Ações PDF */}
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterSpeakersCongregation
                            checkedOptions={filteredByCongregation?.id ?? ""}
                            handleCheckboxChange={(item) => setFilteredByCongregation(item)}
                            congregations={congregationsForFilter ?? []}
                        />

                        <Button
                            outline
                            onClick={() => setShowPreview(!showPreview)}
                            className="text-primary-200 px-3 py-2 border-primary-200/30 hover:border-primary-200 rounded-xl hover:bg-primary-100/10 flex items-center gap-1.5 shadow-sm text-xs font-semibold whitespace-nowrap"
                        >
                            <Eye className="h-4 w-4" />
                            <span>{showPreview ? "Fechar prévia" : "Visualizar lista"}</span>
                        </Button>

                        {getSpeakers && <PdfLinkComponent />}
                    </div>
                </div>

                {/* Modal de Pré-visualização do PDF */}
                {showPreview && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-surface-100 w-full max-w-5xl h-[90vh] p-4 rounded-2xl shadow-2xl relative flex flex-col">
                            <div className="flex items-center justify-between pb-3 border-b border-surface-300 mb-3">
                                <h3 className="font-bold text-typography-900 text-sm">Pré-visualização: Lista de Oradores</h3>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-1.5 rounded-lg text-typography-500 hover:text-typography-900 hover:bg-surface-200 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="flex-1 w-full overflow-hidden rounded-xl">
                                <PDFViewer style={{ width: "100%", height: "100%", border: "none" }}>
                                    <Document>
                                        <SpeakersListPdf
                                            speakers={displayedSpeakers ?? []}
                                            congregationName={speakerCongregationName}
                                        />
                                    </Document>
                                </PDFViewer>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================================================== */}
                {/* 3. SPEAKERS LIST                                    */}
                {/* ==================================================== */}
                {!speakers ? (
                    renderSkeleton()
                ) : displayedSpeakers.length > 0 ? (
                    <ListGeneric
                        onDelete={(item_id) => handleDelete(item_id)}
                        onUpdate={(speaker) => setSpeakerUpdate(speaker)}
                        items={displayedSpeakers}
                        path="/arranjo-oradores/oradores"
                        label="do Orador"
                        renderItem={(speaker) => {
                            const isLocal = speaker.originCongregation?.id === congregation?.id
                            const sortedTalks = speaker.talks?.slice().sort((a, b) => Number(a.number) - Number(b.number)) ?? []

                            return (
                                <div className="flex flex-col h-full justify-between gap-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-base font-bold text-typography-900 leading-snug">
                                                {speaker.fullName}
                                            </h3>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold shrink-0 ${
                                                isLocal
                                                    ? "bg-primary-100/15 text-primary-200 border border-primary-200/20"
                                                    : "bg-surface-200 text-typography-600 border border-surface-300"
                                            }`}>
                                                {speaker.originCongregation?.name || "Sem congregação"}
                                            </span>
                                        </div>

                                        <div className="flex flex-col gap-1.5 text-xs text-typography-600 mt-1">
                                            {speaker.phone && (
                                                <div className="flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5 text-typography-400 shrink-0" />
                                                    <span>{speaker.phone}</span>
                                                </div>
                                            )}
                                            {speaker.address && (
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5 text-typography-400 shrink-0" />
                                                    <span className="truncate">{speaker.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Discursos preparados */}
                                    <div className="pt-2 border-t border-surface-300/80">
                                        <span className="text-[11px] font-semibold text-typography-500 uppercase tracking-wider block mb-1.5">
                                            Discursos Preparados ({sortedTalks.length}):
                                        </span>
                                        {sortedTalks.length > 0 ? (
                                            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto pr-1">
                                                {sortedTalks.map(t => (
                                                    <span
                                                        key={t.id || t.number}
                                                        title={t.title}
                                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-surface-200/80 text-typography-800 border border-surface-300/80 hover:bg-primary-100/15 hover:text-primary-200 transition-colors"
                                                    >
                                                        Nº {t.number}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-xs text-typography-400 italic">
                                                Nenhum discurso associado
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        }}
                    />
                ) : (
                    <EmptyState
                        message={
                            searchQuery || filteredByCongregation
                                ? "Nenhum orador encontrado para os filtros selecionados."
                                : "Nenhum orador cadastrado."
                        }
                    />
                )}
            </section>

            <ScrollToTopButton />
        </ContentDashboard>
    )
}

SpeakersPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "TALK_MANAGER"])

export default SpeakersPage
