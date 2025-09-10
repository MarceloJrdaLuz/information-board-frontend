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
import { deleteTalkAtom, selectedTalkAtom } from "@/atoms/talksAtoms"
import { ITalk } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom, useSetAtom } from "jotai"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function TalksPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    useEffect(() => {
        setPageActive('Discursos')
    }, [setPageActive])

    const deleteTalk = useSetAtom(deleteTalkAtom)
    const setTalkUpdate = useSetAtom(selectedTalkAtom)

    const [talks, setTalks] = useState<ITalk[]>()

    const { data: getTalks, mutate } = useFetch<ITalk[]>("/talks")


    useEffect(() => {
        if (getTalks) {
            setTalks(getTalks)
        }
    }, [getTalks])

    function handleDelete(talk_id: string) {
        toast.promise(deleteTalk(talk_id), {
            pending: 'Excluindo discurso...',
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
        <Layout pageActive="discursos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Discursos</h1>
                        <div className="flex flex-1 justify-start">
                            <Button
                                onClick={() => {
                                    Router.push('/arranjo-oradores/discursos/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <GroupIcon />
                                <span className="text-primary-200 font-semibold">Criar discurso</span>
                            </Button>
                        </div>

                        {talks && talks.length > 0 ? (
                            <ListGeneric
                                onDelete={(item_id) => handleDelete(item_id)}
                                onUpdate={(talk) => setTalkUpdate(talk)}
                                items={talks}
                                path="/arranjo-oradores/discursos"
                                label="do Discurso"
                                renderItem={(talk) => (
                                    <div className="flex">
                                        <div className="flex justify-between">
                                            <div className="text-sm flex flex-col w-fit flex-wrap justify-start  p-4 text-primary-200 font-semibold">
                                                Nº:
                                                <span className="text-sm font-semi-bold text-typography-100">{talk.number}</span>
                                            </div>
                                            <div className="text-sm flex flex-col  w-fit justify-start p-4 text-primary-200 font-semibold">
                                                Tema:
                                                <span className="text-sm font-semi-bold text-typography-100">{talk.title}</span>
                                            </div>
                                        </div>
                                    </div>

                                )}
                            />
                        )
                            : (
                                <>
                                    {!talks ? renderSkeleton() : <EmptyState message="Nenhum discurso cadastrado" />}
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('GROUPS_MANAGER') && !userRolesParse.includes('GROUPS_VIEWER')) {
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