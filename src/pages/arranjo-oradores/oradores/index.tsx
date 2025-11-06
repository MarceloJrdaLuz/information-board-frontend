import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import FilterSpeakersCongregation from "@/Components/FilterSpeakersCongregation"
import GroupIcon from "@/Components/Icons/GroupIcon"
import PdfIcon from "@/Components/Icons/PdfIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import SpeakersListPdf from "@/Components/SpeakerListPdf"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteSpeakerAtom, selectedSpeakerAtom } from "@/atoms/speakerAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useAuthorizedFetch, useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { ICongregation, ISpeaker } from "@/types/types"
import { formatNameCongregation } from "@/utils/formatCongregationName"
import { Document, PDFDownloadLink, PDFViewer } from "@react-pdf/renderer"
import { useAtom, useSetAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function SpeakersPage() {
    const { congregation } = useCongregationContext()
    const deleteSpeaker = useSetAtom(deleteSpeakerAtom)
    const setSpeakerUpdate = useSetAtom(selectedSpeakerAtom)
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const [speakers, setSpeakers] = useState<ISpeaker[]>()
    const [filteredByCongregation, setFilteredByCongregation] = useState<ICongregation | null>(null)
    const [speakerCongregationName, setSpeakerCongregationName] = useState("")
    const [showPreview, setShowPreview] = useState(false);

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
        if (getSpeakers) {
            const sort = sortArrayByProperty(getSpeakers, "fullName")
            setSpeakers(sort)
        }
    }, [getSpeakers])

    useEffect(() => {
        if (!getSpeakers) return

        if (filteredByCongregation) {
            const filteredSpeakersByCongregation = getSpeakers.filter(
                (s) => s.originCongregation.id === filteredByCongregation.id
            )
            setSpeakers(filteredSpeakersByCongregation)
            setSpeakerCongregationName(formatNameCongregation(filteredByCongregation.name, filteredByCongregation.city))
        } else {
            // sem filtro → mostra todos
            const sort = sortArrayByProperty(getSpeakers, "fullName")
            setSpeakers(sort)
            setSpeakerCongregationName("Todas as congregações")
        }
    }, [filteredByCongregation, getSpeakers])


    const handleSpeakersCongregation = (item: ICongregation | null) => {
        setFilteredByCongregation(item)
    }

    useEffect(() => {
        setPageActive('Oradores')
    }, [setPageActive])

    function handleDelete(speaker_id: string) {
        toast.promise(deleteSpeaker(speaker_id), {
            pending: 'Excluindo orador...',
        })
        mutate()
    }

    let skeletonSpeakersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonSpeakersList.map((a, i) => (<SkeletonGroupsList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    const PdfLinkComponent = () => (
        <PDFDownloadLink
            document={
                <Document>
                    <SpeakersListPdf
                        speakers={speakers ?? []}
                        congregationName={speakerCongregationName}
                    />
                </Document>
            }
            fileName={`Oradores_${speakerCongregationName || "congregacao"}.pdf`}
        >
            {({ loading }) => (
                <Button className="bg-surface-100 text-primary-200 p-1 md:p-3 border-typography-300 rounded-none hover:opacity-80">
                    <PdfIcon />
                    <span className="text-primary-200 font-semibold">
                        {loading ? "Gerando PDF..." : "Lista de oradores"}
                    </span>
                </Button>
            )}
        </PDFDownloadLink>
    );

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "TALK_MANAGER"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={"Oradores"} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Oradores</h1>
                            <div className="flex justify-between items-center mb-3">
                                <Button
                                    onClick={() => {
                                        Router.push('/arranjo-oradores/oradores/add')
                                    }}
                                    className="bg-surface-100 text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                                    <GroupIcon />
                                    <span className="text-primary-200 font-semibold">Criar orador</span>
                                </Button>
                                {speakers && <span className="text-sm text-typography-600">Total: {speakers.length}</span>}
                            </div>
                            <div className="flex justify-between my-4">
                                <FilterSpeakersCongregation
                                    checkedOptions={filteredByCongregation?.id ?? ""}
                                    handleCheckboxChange={(item) => handleSpeakersCongregation(item)}
                                    congregations={congregationsForFilter ?? []}
                                />
                                <div className="flex flex-wrap justify-end gap-3">
                                    <Button
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="px-4 py-2 rounded-lg border shadow"
                                    >
                                        {showPreview ? "Fechar pré-visualização" : "Visualizar lista"}
                                    </Button>
                                    {speakers && <PdfLinkComponent />}
                                    {showPreview && (
                                        <div className="fixed inset-0 bg-typography-900 bg-opacity-50 flex items-center justify-center z-50">
                                            <div className="bg-surface-100 w-[90%] h-[90%] p-4 rounded relative">
                                                <button
                                                    onClick={() => setShowPreview(false)}
                                                    className="absolute top-2 right-2 text-typography-600 hover:text-typography-900"
                                                >
                                                    ✕
                                                </button>
                                                <PDFViewer style={{ width: "100%", height: "100%" }}>
                                                    <Document>
                                                        <SpeakersListPdf
                                                            speakers={speakers ?? []}
                                                            congregationName={speakerCongregationName}
                                                        />
                                                    </Document>
                                                </PDFViewer>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {speakers && speakers.length > 0 ? (
                                <ListGeneric
                                    onDelete={(item_id) => handleDelete(item_id)}
                                    onUpdate={(speaker) => setSpeakerUpdate(speaker)}
                                    items={speakers}
                                    path="/arranjo-oradores/oradores"
                                    label="do Orador"
                                    renderItem={(speaker) => (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-lg font-semibold text-typography-800">{speaker.fullName}</h3>
                                            <div className="text-sm text-typography-700 flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    📞 <span>{speaker.phone || "Não cadastrado"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    🏠 <span>{speaker.address || "Não cadastrado"}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    🏬 <span>{speaker.originCongregation.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    🎤 <span>{speaker.talks?.map((t) => t.number)
                                                        .sort((a, b) => Number(a) - Number(b))
                                                        .join(", ") || "Nenhum discurso"}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            )
                                : (
                                    <>
                                        {!speakers ? renderSkeleton() : <EmptyState message="Nenhum orador cadastrado" />}
                                    </>
                                )
                            }
                        </div>

                    </section>
                </ContentDashboard>
        </ProtectedRoute>

    )
}