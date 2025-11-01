import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import SecurityIcon from "@/Components/Icons/SecurityIcon"
import Layout from "@/Components/Layout"
import ListItems from "@/Components/ListItems"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ICategory } from "@/types/types"
import { useAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"

export default function Categorias() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    const { data: categories, mutate } = useAuthorizedFetch<ICategory[]>('/categories', {
        allowedRoles: ["ADMIN"]
    })

    function handleDelete(item_id: string) {
        //     toast.promise(deletePermission(item_id), {
        //        pending: "Excluindo permissão..."
        //    })
        //    mutate()
    }
    useEffect(() => {
        setPageActive('Criar categoria')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN"]}>
            <Layout pageActive="categorias">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Categorias</h1>
                            <Button
                                onClick={() => {
                                    Router.push('/categorias/add')
                                }}
                                className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                <SecurityIcon />
                                <span className="text-primary-200 font-semibold">Criar categoria</span>
                            </Button>
                            {categories && (
                                <ListItems onDelete={(item_id) => handleDelete(item_id)} items={categories} label="Categoria" path="categorias" />
                            )}
                        </div>
                    </section>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>
    )
}