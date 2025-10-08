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
import SpeakersListPdf from "@/Components/SpeakerListPdf"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteSpeakerAtom, selectedSpeakerAtom } from "@/atoms/speakerAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
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

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [speakers, setSpeakers] = useState<ISpeaker[]>()
    const [filteredByCongregation, setFilteredByCongregation] = useState<ICongregation | null>(null)
    const [speakerCongregationName, setSpeakerCongregationName] = useState("")
    const [showPreview, setShowPreview] = useState(false);

    const { data: getSpeakers, mutate } = useFetch<ISpeaker[]>("/speakers")

    const { data: getAuxiliaryCongregations } = useFetch<ICongregation[]>("/auxiliaryCongregations")

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
                <Button className="bg-white text-primary-200 p-1 md:p-3 border-gray-300 rounded-none hover:opacity-80">
                    <PdfIcon />
                    <span className="text-primary-200 font-semibold">
                        {loading ? "Gerando PDF..." : "Lista de oradores"}
                    </span>
                </Button>
            )}
        </PDFDownloadLink>
    );

    return (
        <Layout pageActive="oradores">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Oradores</h1>
                        <div className="flex flex-1 justify-start">
                            <Button
                                onClick={() => {
                                    Router.push('/arranjo-oradores/oradores/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <GroupIcon />
                                <span className="text-primary-200 font-semibold">Criar orador</span>
                            </Button>
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
                                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                        <div className="bg-white w-[90%] h-[90%] p-4 rounded relative">
                                            <button
                                                onClick={() => setShowPreview(false)}
                                                className="absolute top-2 right-2 text-gray-600 hover:text-black"
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
                                        <h3 className="text-lg font-semibold text-gray-800">{speaker.fullName}</h3>

                                        <div className="text-sm text-gray-600 flex flex-col gap-2">
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
                                                🎤 <span>{speaker.talks?.map((t) => t.number).join(", ") || "Nenhum discurso"}</span>
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
        </Layout>
    )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {

    const apiClient = getAPIClient(ctx)
    const { ['quadro-token']: token } = parseCookies(ctx)

    if (!token) {
        return {
            redirect: {
                destination: '/login',
                permanent: false
            }
        }
    }

    const { ['user-roles']: userRoles } = parseCookies(ctx)
    const userRolesParse: string[] = JSON.parse(userRoles)

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('TALK_MANAGER')) {
        return {
            redirect: {
                destination: '/dashboard',
                permanent: false
            }
        }
    }

    return {
        props: {}
    }
}