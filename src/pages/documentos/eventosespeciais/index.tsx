import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import DocumentUploadContainer from "@/Components/DocumentUploadContainer"
import FileList from "@/Components/FileList"
import SkeletonFileList from "@/Components/FileList/skeletonFileList"
import Upload from "@/Components/Upload"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useDocumentsContext } from "@/context/DocumentsContext"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { Categories, ICategory } from "@/types/types"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { Star, FolderArchive } from "lucide-react"
import { useEffect, useState } from "react"

function SpecialEventsPage() {
    const [category, setCategory] = useState<ICategory>()
    const { uploadedFiles, setDocumentCategoryId, loading } = useDocumentsContext()
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: categories } = useAuthorizedFetch<ICategory[]>('/categories', {
        allowedRoles: ["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"]
    })

    useEffect(() => {
        setPageActive('Eventos especiais')
        setCrumbs([{ label: "Início", link: "/dashboard" }])
    }, [setPageActive, setCrumbs])

    useEffect(() => {
        const categoryFilter = categories?.filter(category => category.name === Categories.eventos)
        if (categoryFilter) {
            setCategory(categoryFilter[0])
        }
        const categoryId = category?.id as string
        setDocumentCategoryId(categoryId)
    }, [categories, setDocumentCategoryId, category])

    const skeletonItems = Array(4).fill(0)
    const hasFiles = uploadedFiles && uploadedFiles.length > 0

    return (
        <ContentDashboard>
            <BreadCrumbs crumbs={crumbs} pageActive={"Eventos Especiais"} />
            <DocumentUploadContainer
                title="Eventos Especiais"
                description="Envie e gerencie as programações de assembleias, congressos e visitas especiais."
                currentRoute="/documentos/eventosespeciais"
                icon={<Star className="w-6 h-6" />}
                fileCount={uploadedFiles?.length || 0}
                loading={loading}
            >
                {/* Dropzone Card */}
                <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-typography-800">
                            Adicionar novo documento
                        </h2>
                        <p className="text-xs text-typography-500 mt-0.5">
                            Envie um arquivo PDF para disponibilizá-lo no quadro de anúncios
                        </p>
                    </div>
                    <Upload acceptFiles={{ 'application/pdf': [] }} />
                </div>

                {/* Files Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="text-xs font-bold text-typography-500 uppercase tracking-wider">
                            Documentos Ativos
                        </h3>
                        {hasFiles && (
                            <span className="text-xs text-typography-500 font-medium">
                                {uploadedFiles.length} {uploadedFiles.length === 1 ? 'item' : 'itens'}
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-col gap-3">
                            {skeletonItems.map((_, i) => (
                                <SkeletonFileList key={i} />
                            ))}
                        </div>
                    ) : hasFiles ? (
                        <FileList files={uploadedFiles} />
                    ) : (
                        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3 shadow-xs">
                            <div className="w-12 h-12 rounded-2xl bg-surface-200 border border-surface-300 flex items-center justify-center text-typography-500">
                                <FolderArchive className="w-6 h-6 text-typography-500" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-base font-semibold text-typography-800">
                                    Nenhum documento cadastrado
                                </p>
                                <p className="text-xs text-typography-500 max-w-sm">
                                    Arraste um arquivo PDF para a área de upload acima ou clique para selecionar.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </DocumentUploadContainer>
        </ContentDashboard>
    )
}

SpecialEventsPage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION", "DOCUMENTS_MANAGER"])

export default SpecialEventsPage
