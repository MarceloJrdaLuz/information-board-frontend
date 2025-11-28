import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import { ListGeneric } from "@/Components/ListGeneric"
import { deleteTermOfUseAtom } from "@/atoms/TermsOfUseAtoms"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom, useSetAtom } from "jotai"
import { CircleIcon } from "lucide-react"
import Router from "next/router"
import { useEffect } from "react"
import ReactMarkdown from "react-markdown"
import { toast } from "react-toastify"

function TermsPage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    const deleteTermOfUse = useSetAtom(deleteTermOfUseAtom)

    const { data: terms, mutate } = useAuthorizedFetch<ITermOfUse[]>('/terms', {
        allowedRoles: ["ADMIN"]
    })

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
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={"Termos de Uso"} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Termos de Uso</h1>
                            <div className="flex justify-between items-center mb-3">
                                <Button outline
                                    onClick={() => {
                                        Router.push('/administracao/termos/add')
                                    }}
                                    className="text-primary-200 p-3 border-typography-300 rounded-none hover:opacity-80">
                                    <SecurityIcon className="w-5 h-5 sm:w-6 sm:h-6"/>
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
                                                <h3 className="text-lg font-semibold text-typography-800">{term.title}</h3>
                                                <span>v.{term.version}</span>
                                                {term.is_active ?
                                                    <CircleIcon className="bg-success-100 rounded-full text-success-100 w-4 h-4 flex-shrink-0" />
                                                    : <CircleIcon className="bg-red-500 rounded-full text-red-500 w-4 h-4 flex-shrink-0" />}
                                            </div>
                                            <div className="text-sm text-typography-700 flex flex-col gap-2 items-end">
                                                <div title="Tipo" className="flex items-center gap-2">
                                                    <span className="font-bold text-base">Tipo: {term.type}</span>
                                                </div>
                                            </div>
                                            <div title="Conteúdo" className="flex flex-col items-center gap-2 text-typography-800">
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
    )
}

TermsPage.getLayout = withProtectedLayout(["ADMIN"])

export default TermsPage