import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import Layout from "@/Components/Layout"
import { useAuthContext } from "@/context/AuthContext"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { ITermOfUse } from "@/types/congregation"
import { useAtom } from "jotai"
import moment from "moment"
import "moment/locale/pt-br"
import { GetServerSideProps } from "next"
import { parseCookies } from 'nookies'
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"

moment.locale("pt-br") 

export default function TermsOfUSe() {
    const { user: getUser } = useAuthContext()

    const [user, setUser] = useState(getUser)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const { data: termActive, mutate } = useFetch<ITermOfUse>('/terms/active/congregation')
    const [term, setTerm] = useState<ITermOfUse>()

    useEffect(() => {
        setUser(getUser)
    }, [getUser])

    useEffect(() => {
        setTerm(termActive)
    }, [termActive])

    useEffect(() => {
        setPageActive('Termos de uso')
    }, [setPageActive])

    useEffect(() => {
        setCrumbs([{ label: 'Início', link: '/dashboard' }])
    }, [setCrumbs])


    return (
        <Layout pageActive="termos-de-uso">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex w-full h-full justify-center items-center">
                    <div className="h-full">
                        <div className="flex flex-col p-10 m-5 bg-white overflow-scroll">
                            <div className="flex justify-between items-center mb-5 flex-wrap gap-5">
                                <h1 className="font-bold text-xl">{term?.title}</h1>
                                <p>v.{term?.version}</p>
                                <p className="font-semibold text-gray-800" >Data do termo de uso: {moment(term?.createdAt).format("D [de] MMMM [de] YYYY").toString()}</p>
                            </div>
                            <div className="mt-5">
                                <ReactMarkdown>
                                    {termActive ? termActive.content : 'Nenhum termo de uso disponível.'}
                                </ReactMarkdown>
                            </div>
                        </div>
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

    return {
        props: {}
    }
}