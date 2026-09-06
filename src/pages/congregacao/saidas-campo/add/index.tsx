import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"

import FormAddFieldServiceTemplate from "@/Components/Forms/FormAddFieldServiceTemplate"

export default function AddFieldServiceTemplatePage() {
    const [crumbs, setCrumbs] = useAtom(crumbsAtom)
    const [, setPageActive] = useAtom(pageActiveAtom)

    useEffect(() => {
        setPageActive("Nova saída de campo")
        setCrumbs([
            { label: "Início", link: "/dashboard" },
            { label: "Saídas de Campo", link: "/congregacao/saidas-campo" }
        ])
    }, [setCrumbs, setPageActive])

    return (
        <ContentDashboard>
            <BreadCrumbs
                crumbs={crumbs}
                pageActive="Nova saída de campo"
            />

            <section className="flex m-10 justify-center items-center">
                <FormAddFieldServiceTemplate />
            </section>
        </ContentDashboard>
    )
}

AddFieldServiceTemplatePage.getLayout = withProtectedLayout([
    "ADMIN_CONGREGATION",
    "FIELD_SERVICE_MANAGER",
])
