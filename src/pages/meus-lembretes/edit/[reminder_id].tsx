import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import FormEditReminder from "@/Components/Forms/FormEditReminder"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect } from "react"

function EditReminderPage() {
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)

  const router = useRouter()
  const { reminder_id } = router.query

  /* ======================
   * Breadcrumbs
   ====================== */
  useEffect(() => {
    setCrumbs(prev => [
      ...prev,
      {
        label: "Lembretes",
        link: "/meus-lembretes",
      },
    ])

    return () => {
      setCrumbs(prev => prev.slice(0, -1))
    }
  }, [setCrumbs])

  /* ======================
   * Page title
   ====================== */
  useEffect(() => {
    setPageActive("Editar lembrete")
  }, [setPageActive])

  if (!reminder_id) return null

  return (
    <ContentDashboard>
      <BreadCrumbs
        crumbs={crumbs}
        pageActive="Editar lembrete"
      />

      <section className="flex m-10 justify-center items-center">
        <FormEditReminder reminder_id={String(reminder_id)} />
      </section>
    </ContentDashboard>
  )
}

EditReminderPage.getLayout = withProtectedLayout()

export default EditReminderPage
