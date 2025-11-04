import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"
import AddPersonIcon from "@/Components/Icons/AddPersonIcon"
import Layout from "@/Components/Layout"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import PublisherList from "@/Components/PublishersList"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { useAtom } from "jotai"
import Router from "next/router"
import { useEffect } from "react"

export default function Publicadores() {
    const [crumbs,] = useAtom(crumbsAtom)
    const [pageActive, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive('Publicadores')
    }, [setPageActive])
    return (
        <ProtectedRoute allowedRoles={["ADMIN_CONGREGATION", "PUBLISHERS_MANAGER", "PUBLISHERS_VIEWER"]}>
                <ContentDashboard>
                    <BreadCrumbs crumbs={crumbs} pageActive={"Publicadores"} />
                    <section className="flex flex-wrap w-full h-full p-5 ">
                        <div className="w-full h-full">
                            <h1 className="flex w-full h-10 text-lg sm:text-xl md:text-2xl text-primary-200 font-semibold">Registros de pessoas</h1>
                            <div className="flex justify-start">
                                <Button
                                    onClick={() => {
                                        Router.push('/congregacao/publicadores/add')
                                    }}
                                    className="bg-white text-primary-200 p-3 border-gray-300 rounded-none hover:opacity-80">
                                    <AddPersonIcon />
                                    <span className="text-primary-200 font-semibold">Adicionar pessoa</span>
                                </Button>
                            </div>
                            <PublisherList />
                        </div>
                    </section>
                </ContentDashboard>
        </ProtectedRoute>
    )
}