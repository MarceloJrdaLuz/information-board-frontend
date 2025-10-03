import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import EmptyState from "@/Components/EmptyState"
import FilterSpeakersCongregation from "@/Components/FilterGeneric"
import GroupIcon from "@/Components/Icons/GroupIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import SkeletonGroupsList from "@/Components/ListGroups/skeletonGroupList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { deleteSpeakerAtom, selectedSpeakerAtom } from "@/atoms/speakerAtoms"
import { useCongregationContext } from "@/context/CongregationContext"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { ICongregation, ISpeaker } from "@/types/types"
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
    const [filteredByCongregationId, setFilteredByCongregationId] = useState("")

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

        if (filteredByCongregationId) {
            const filteredSpeakersByCongregation = getSpeakers.filter(
                s => s.originCongregation.id === filteredByCongregationId
            )
            setSpeakers(filteredSpeakersByCongregation)
        } else {
            // sem filtro → mostra todos
            const sort = sortArrayByProperty(getSpeakers, "fullname")
            setSpeakers(sort)
        }
    }, [filteredByCongregationId, getSpeakers])


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

                        <FilterSpeakersCongregation
                            checkedOptions={filteredByCongregationId}
                            handleCheckboxChange={(item) => setFilteredByCongregationId(item)}
                            congregations={congregationsForFilter ?? []} />

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