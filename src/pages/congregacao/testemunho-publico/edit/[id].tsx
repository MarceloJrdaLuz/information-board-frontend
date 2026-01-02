import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditPublicWitnessArrangement from "@/Components/FormEditPublicWitnessArrangement"
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
    setCrumbs(prev => [
      ...prev,
      {
        label: "Testemunho Público - Arranjos",
        link: "/congregacao/testemunho-publico"
      }
    ])

    return () => setCrumbs(prev => prev.slice(0, -1))
  }, [setCrumbs])

  useEffect(() => {
    setPageActive("Editar arranjo")
  }, [setPageActive])

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
  "FIELD_SERVICE_MANAGER"
])

export default EditPublicWitnessArrangementPage
