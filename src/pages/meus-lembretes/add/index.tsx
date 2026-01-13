import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import { useEffect } from "react"
import FormAddReminder from "@/Components/Forms/FormAddReminder"

export default function AddReminderPage() {
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const [, setPageActive] = useAtom(pageActiveAtom)

  useEffect(() => {
    setCrumbs(prev => [...prev, { label: "Lembretes", link: "/meus-lembretes" }])
    return () => setCrumbs(prev => prev.slice(0, -1))
  }, [])

  useEffect(() => {
    setPageActive("Lembretes")
  }, [])

  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Novo lembrete" />
      <section className="flex m-10 justify-center">
        <FormAddReminder />
      </section>
    </ContentDashboard>
  )
}

AddReminderPage.getLayout = withProtectedLayout()
