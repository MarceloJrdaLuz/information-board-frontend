import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FileList from "@/Components/FileList"
import SkeletonFileList from "@/Components/FileList/skeletonFileList"
import Upload from "@/Components/Upload"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { Categories, ICategory } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

function FieldPage() {
    const [category, setCategory] = useState<ICategory>()
    const { uploadedFiles, setDocumentCategoryId, loading } = useDocumentsContext()
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: categories } = useAuthorizedFetch<ICategory[]>('/categories', {
        allowedRoles: ["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"]
    })

    useEffect(() => {
        setPageActive('Saídas de campo')
    }, [setPageActive])

    useEffect(() => {
        const categoryFilter = categories?.filter(category => category.name === Categories.saidasDeCampo)
        if (categoryFilter) {
            setCategory(categoryFilter[0])
        }
        const categoryId = category?.id as string
        setDocumentCategoryId(categoryId)
    }, [categories, setDocumentCategoryId, category])

    let skeletonFileList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex flex-col w-11/12 md:w-9/12 m-auto  justify-between items-center cursor-pointer gap-2">
                {skeletonFileList.map((a, i) => (<SkeletonFileList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    const hasFiles = uploadedFiles && uploadedFiles.length > 0

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Saídas de Campo"} />
            <section className="flex flex-wrap w-full h-full p-5">
                <div className="w-full h-full">
                    <div className="flex flex-col w-11/12 md:w-9/12 h-24 m-auto  justify-between items-center  cursor-pointer mb-3">
                        <Upload acceptFiles={{
                            'application/pdf': []
                        }} />
                    </div>
                    {loading ? (
                        renderSkeleton()
                    ) : hasFiles ? (
                        <FileList files={uploadedFiles} />
                    ) : (
                        <div className="w-full flex justify-center items-center py-10 text-typography-500">
                            Nenhum arquivo encontrado.
                        </div>
                    )}
                </div>
            </section>
        </ContentDashboard>
    )
}

FieldPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"])

export default FieldPage