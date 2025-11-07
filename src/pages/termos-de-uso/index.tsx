import { crumbsAtom, pageActiveAtom } from "@/atoms/atom"
import BreadCrumbs from "@/Components/BreadCrumbs"
import ContentDashboard from "@/Components/ContentDashboard"
import { ProtectedRoute } from "@/Components/ProtectedRoute"
import { useAuthorizedFetch } from "@/hooks/useFetch"
import { ITermOfUse } from "@/types/termsofuse"
import { withProtectedLayout } from "@/utils/withProtectedLayout"
import { useAtom } from "jotai"
import moment from "moment"
import "moment/locale/pt-br"
import { useEffect } from "react"
import ReactMarkdown from "react-markdown"

moment.locale("pt-br")

function TermsOfUSePage() {
  const [pageActive, setPageActive] = useAtom(pageActiveAtom)
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const { data: termActive } = useAuthorizedFetch<ITermOfUse>('/terms/active/congregation', {
    allowedRoles: ['ADMIN_CONGREGATION']
  })

  useEffect(() => {
    setPageActive('Termos de uso')
  }, [setPageActive])

  useEffect(() => {
    setCrumbs([{ label: 'Início', link: '/dashboard' }])
  }, [setCrumbs])


  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive={"Termos de Uso"} />
      <section className="flex w-full h-full justify-center items-center text-typography-800">
        <div className="h-full">
          <div className="flex flex-col p-10 m-5 bg-surface-100 overflow-scroll">
            <div className="flex justify-between items-center mb-5 flex-wrap gap-5">
              <h1 className="font-bold text-xl ">{termActive?.title}</h1>
              <p>v.{termActive?.version}</p>
              <p className="font-semibold " >Data do termo de uso: {moment(termActive?.createdAt).format("D [de] MMMM [de] YYYY").toString()}</p>
            </div>
            <div className="mt-5 ">
              <ReactMarkdown>
                {termActive ? termActive.content : 'Nenhum termo de uso disponível.'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </section>
    </ContentDashboard>
  )
}

TermsOfUSePage.getLayout = withProtectedLayout(["ADMIN_CONGREGATION"])

export default TermsOfUSePage
