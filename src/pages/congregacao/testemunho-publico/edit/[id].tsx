import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditPublicWitnessArrangement from "@/Components/Forms/FormEditPublicWitnessArrangement"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function EditPublicWitnessArrangementPage() {
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)

  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    setPageActive("Editar Arranjo")
    setCrumbs([
      { label: "Início", link: "/dashboard" },
      { label: "Testemunho Público", link: "/congregacao/testemunho-publico" }
    ])
  }, [setCrumbs, setPageActive])

  if (!id) return null

  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Editar Arranjo" />
      <section className="flex m-10 justify-center items-center">
        <FormEditPublicWitnessArrangement arrangement_id={String(id)} />
      </section>
    </ContentDashboard>
  )
}

EditPublicWitnessArrangementPage.getLayout = withProtectedLayout([
  "ADMIN_CONGREGATION",
  "PUBLIC_WITNESS_MANAGER"
])

export default EditPublicWitnessArrangementPage
