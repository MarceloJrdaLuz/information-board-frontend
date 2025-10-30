import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import Layout from "@/Components/Layout"
import { ListGeneric } from "@/Components/ListGeneric"
import { deleteTermOfUseAtom } from "@/atoms/TermsOfUseAtoms"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { ITermOfUse } from "@/types/congregation"
import { useAtom, useSetAtom } from "jotai"
import { CircleIcon } from "lucide-react"
import { GetServerSideProps } from "next"
import Router from "next/router"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"
import ReactMarkdown from "react-markdown"
import { toast } from "react-toastify"

export default function Terms() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const deleteTermOfUse = useSetAtom(deleteTermOfUseAtom)

    const { data: getTerms, mutate } = useFetch<ITermOfUse[]>('/terms')
    const [terms, setTerms] = useState<ITermOfUse[]>()

    useEffect(() => {
        setTerms(getTerms)
    }, [getTerms])

    function handleDelete(term_id: string) {
        toast.promise(deleteTermOfUse(term_id), {
            pending: "Excluindo termo de uso..."
        })
        mutate()
    }
    useEffect(() => {
        setPageActive('Termos de uso')
    }, [setPageActive])

    return (
        <Layout pageActive="termos">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5 ">
                    <div className="w-full h-full">
                        <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Termos de Uso</h1>
                        <div className="flex justify-between items-center mb-3">
                            <Button
                                onClick={() => {
                                    Router.push('/administracao/termos/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <SecurityIcon />
                                <span className="text-primary-200 font-semibold">Criar Termo</span>
                            </Button>
                        </div>
                        {terms && (
                            <ListGeneric<ITermOfUse>
                                items={terms}
                                onDelete={handleDelete}
                                showEdit={false}
                                showDelete={false}
                                renderItem={(term) => (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex justify-between items-start gap-3">
                                            <h3 className="text-lg font-semibold text-gray-800">{term.title}</h3>
                                            <span>v.{term.version}</span>
                                            {term.is_active ?
                                                <CircleIcon className="bg-success-100 rounded-full text-success-100 w-4 h-4 flex-shrink-0" />
                                                : <CircleIcon className="bg-red-500 rounded-full text-red-500 w-4 h-4 flex-shrink-0" />}
                                        </div>
                                        <div className="text-sm text-gray-600 flex flex-col gap-2 items-end">
                                            <div title="Tipo" className="flex items-center gap-2">
                                                <span className="font-bold text-base">Tipo: {term.type}</span>
                                            </div>
                                        </div>
                                        <div title="Conteúdo" className="flex flex-col items-center gap-2 text-gray-800">
                                            <ReactMarkdown>
                                                {term.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            />
                        )}
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

    if (!userRolesParse.includes('ADMIN')) {
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