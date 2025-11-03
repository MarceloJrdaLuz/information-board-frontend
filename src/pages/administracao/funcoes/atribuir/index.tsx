import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormUserRoles from "@/Components/Forms/FormUserRoles"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { IRole } from "@/types/types"
import { useAtom } from "jotai"
import { useEffect, useState } from "react"

export default function AtribuirFuncoes() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)
    
    useEffect(() => {
        setPageActive('Funções')
    }, [setPageActive])

    return (
        <ProtectedRoute allowedRoles={["ADMIN", "ADMIN_CONGREGATION"]}>
            <Layout pageActive="/administracao/funcoes/atribuir">
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={pageActive} />
                    <section className="flex m-10 justify-center items-center">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Atribuir Funções</h1>
                            <FormUserRoles />
                        </div>
                    </section>
                </ContentDashboard>
            </Layout>
        </ProtectedRoute>
    )
}