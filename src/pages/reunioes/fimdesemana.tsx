import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FileList from "@/Components/FileList"
import SkeletonFileList from "@/Components/FileList/skeletonFileList"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import Upload from "@/Components/Upload"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { Categories, ICategory } from "@/types/types"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

export default function FimDeSemana() {

    const [category, setCategory] = useState<ICategory>()
    const { uploadedFiles, setDocumentCategoryId } = useDocumentsContext()
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: categories } = useAuthorizedFetch<ICategory[]>('/categories', {
        allowedRoles: ["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"]
    })

    useEffect(() => {
        setPageActive('Fim de semana')
    }, [setPageActive])

    useEffect(() => {
        const categoryFilter = categories?.filter(category => category.name === Categories.fimDeSemana)
        if (categoryFilter) {
            setCategory(categoryFilter[0])
        }
        const categoryId = category?.id as string
        setDocumentCategoryId(categoryId)
    }, [categories, setDocumentCategoryId, category])

    let skeletonFileList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonFileList.map((a, i) => (<SkeletonFileList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"]}>
            <Layout pageActive="fimdesemana">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex flex-wrap w-full h-full p-5">
                        <div className="w-full h-full">
                            <div className="flex flex-col w-11/12 md:w-9/12 h-24 m-auto  justify-between items-center  cursor-pointer mb-3">
                                <Upload acceptFiles={{
                                    'application/pdf': []
                                }} />
                            </div>
                            {uploadedFiles && uploadedFiles.length > 0 ? (
                                <FileList files={uploadedFiles} />
                            ) : (
                                renderSkeleton()
                            )}
                        </div>
                    </section>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>
    )
}