import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FileList from "@/Components/FileList"
import Layout from "@/Components/Layout"
import Upload from "@/Components/Upload"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { Categories, ICategory } from "@/entities/types"
import { useFetch } from "@/hooks/useFetch"
import { getAPIClient } from "@/services/axios"
import { useAtom } from "jotai"
import { GetServerSideProps } from "next"
import { parseCookies } from "nookies"
import { useEffect, useState } from "react"

export default function Limpeza() {

    const [category, setCategory] = useState<ICategory>()
    const { uploadedFiles, setDocumentCategoryId } = useDocumentsContext()
    const { data: categories } = useFetch<ICategory[]>('/categories')
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        const categoryFilter = categories?.filter(category => category.name === Categories.limpeza)
        if (categoryFilter) {
            setCategory(categoryFilter[0])
        }
        const categoryId = category?.id as string
        setDocumentCategoryId(categoryId)
    }, [categories, setDocumentCategoryId, category])


    useEffect(() => {
        setPageActive('Limpeza')
    }, [setPageActive])

    return (
        <Layout pageActive="limpeza">
            <ContentDashboard>
                <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                <section className="flex flex-wrap w-full h-full p-5">
                    <div className="w-full h-full">
                        <div className="flex flex-col w-11/12 md:w-9/12 h-24 m-auto  justify-between items-center  cursor-pointer mb-3">
                            <Upload acceptFiles={{
                                'application/pdf': []
                            }} />
                        </div>
                        <FileList files={uploadedFiles} />
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

    if (!userRolesParse.includes('ADMIN_CONGREGATION') && !userRolesParse.includes('DOCUMENTS_MANAGER')) {
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