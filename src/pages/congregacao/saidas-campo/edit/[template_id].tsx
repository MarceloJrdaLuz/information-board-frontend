import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditFieldServiceTemplate from "@/Components/Forms/FormEditFieldServiceTemplate"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function EditFieldServiceTemplatePage() {
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)

  const router = useRouter()
  const { template_id } = router.query

  useEffect(() => {
    setCrumbs(prev => [
      ...prev,
      {
        label: "Saídas de campo",
        link: "/congregacao/saidas-campo",
      },
    ])

    return () => {
      setCrumbs(prev => prev.slice(0, -1))
    }
  }, [setCrumbs])

  useEffect(() => {
    setPageActive("Editar saída de campo")
  }, [setPageActive])

  if (!template_id) return null

  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Editar Saída de Campo" />

      <section className="flex m-10 justify-center items-center">
        <FormEditFieldServiceTemplate template_id={String(template_id)} />
      </section>
    </ContentDashboard>
  )
}

EditFieldServiceTemplatePage.getLayout = withProtectedLayout([
  "ADMIN_CONGREGATION",
  "FIELD_SERVICE_MANAGER",
])

export default EditFieldServiceTemplatePage
