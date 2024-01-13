import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import ListMeetingAssistance from "@/Components/ListMeetingAssistance"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { IMeetingAssistance } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { FilePlus2Icon, GroupIcon } from "lucide-react"
import moment from "moment"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import 'moment/locale/pt-br'

export default function ListarRelatorios() {

    const router = useRouter()
    const { congregationId } = router.query

    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [meetingAssistance, setMeetingAssistance] = useState<IMeetingAssistance[]>([])

    useEffect(() => {
        setPageActive('Assistência')
    }, [setPageActive])

    const fetch = congregationId ? `/assistance/${congregationId}` : ""
    const { data } = useFetch<IMeetingAssistance[]>(`/assistance/${congregationId}`)

    useEffect(() => {
        if (data) {
            const sortedMeetingAssistance = data.sort((a, b) => {
                const dateA = moment(`${a.year}-${moment().month(a.month).format('MM')}`, 'YYYY-MM')
                const dateB = moment(`${b.year}-${moment().month(b.month).format('MM')}`, 'YYYY-MM')
                console.log('dateA:', dateA.format('MM-YYYY'))
                console.log('dateB:', dateB.format('MM-YYYY'))
                return dateB.diff(dateA)
            })
            setMeetingAssistance(sortedMeetingAssistance)
        }
    }, [data])

    return (
        <Layout pageActive="assistencia">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Assistência às reuniões</h1>
                        <Button
                            onClick={() => {
                                router.push(`/assistencia/${congregationId}/enviar`)
                            }}
                            className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                            <FilePlus2Icon />
                            <span className="text-primary-200 font-semibold">Adicionar</span>
                        </Button>
                        {meetingAssistance && <ListMeetingAssistance items={meetingAssistance} />}
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION')) {
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