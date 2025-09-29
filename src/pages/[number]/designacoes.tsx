import { domainUrl } from "@/atoms/atom"
import Button from "@/Components/Button"
import HeadComponent from "@/Components/HeadComponent"
import LifeAndMinistryIcon from "@/Components/Icons/LifeAndMinistryIcon"
import PublicMeetingIcon from "@/Components/Icons/PublicMeetingIcon"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NotFoundDocument from "@/Components/NotFoundDocument"
import PdfViewer from "@/Components/PdfViewer"
import SchedulesCarousel from "@/Components/SchedulesCarousel"
import { SchedulesSkeleton } from "@/Components/ScheduleSkeleton"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { Categories, ICongregation, IDocument } from "@/entities/types"
import { IPublicSchedule } from "@/entities/weekendSchedule"
import DateConverter, { meses } from "@/functions/meses"
import { removeMimeType } from "@/functions/removeMimeType"
import { threeMonths } from "@/functions/threeMonths"
import { useFetch } from "@/hooks/useFetch"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconDesignacoes from '../../../public/images/designacoes-gray.png'

export default function Designacoes() {
  const router = useRouter()
  const { number } = router.query
  const domain = useAtomValue(domainUrl)

  const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

  const [pdfUrl, setPdfUrl] = useState('')
  const [publicOptionsShow, setPublicOptionsShow] = useState(false)
  const [lifeAndMinistryOptionsShow, setLifeAndMinistryOptionsShow] = useState(false)
  const [documentsLifeAndMinistryFilter, setDocumentsLifeAndMinistryFilter] = useState<IDocument[]>()
  const [documentsLifeAndMinistryFilterMonths, setDocumentsLifeAndMinistryFilterMonths] = useState<IDocument[]>()
  const [documentsPublicFilter, setDocumentsPublicFilter] = useState<IDocument[]>()
  const [documentsOthersFilter, setDocumentsOthersFilter] = useState<IDocument[]>()
  const [congregationData, setCongregationData] = useState<ICongregation>()
  const [showSchedules, setShowSchedules] = useState(false)
  const [pdfShow, setPdfShow] = useState(false)

  const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
  const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)
  const fetchConfigWeekendSchedulesData = number ? `/congregation/${congregation?.id}/weekendSchedules/public` : ""
  const { data: schedules } = useFetch<Record<string, IPublicSchedule[]>>(fetchConfigWeekendSchedulesData)

  useEffect(() => {
    if (congregation) {
      setCongregationData(congregation)
    }
  }, [congregation])

  const hasPdfLifeAndMinistry = documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length > 0
  const hasPdfPublic = documentsPublicFilter && documentsPublicFilter.length > 0

  useEffect(() => {
    if (number) {
      setCongregationNumber(number as string)
    }
  }, [number, setCongregationNumber])

  useEffect(() => {
    if (documents) {
      setDocumentsLifeAndMinistryFilter(filterDocuments(Categories.meioDeSemana))
      setDocumentsPublicFilter(filterDocuments(Categories.fimDeSemana))
    }
  }, [documents, filterDocuments])

  useEffect(() => {
    const others = documentsLifeAndMinistryFilter?.filter(document => {
      return !meses.includes(removeMimeType(document.fileName))
    })

    setDocumentsOthersFilter(others)

    let threeMonthsShow = false

    if (new Date().getDate() <= 6 && new Date().getDay() <= 4) {
      threeMonthsShow = threeMonths()
    }

    if (!threeMonthsShow) {
      const filterTwoMonths = documentsLifeAndMinistryFilter?.filter(document => {
        return (
          removeMimeType(document.fileName) === DateConverter('mes') ||
          removeMimeType(document.fileName) === DateConverter('mes+1')
        )
      })

      if (filterTwoMonths) {
        setDocumentsLifeAndMinistryFilterMonths(filterTwoMonths)
      }
    } else {
      const filterThreeMonths = documentsLifeAndMinistryFilter?.filter(document => {
        return (
          removeMimeType(document.fileName) === DateConverter('mes-1') ||
          removeMimeType(document.fileName) === DateConverter('mes') ||
          removeMimeType(document.fileName) === DateConverter('mes+1')
        )
      })

      if (filterThreeMonths) {
        setDocumentsLifeAndMinistryFilterMonths(filterThreeMonths)
      }
    }
  }, [documentsLifeAndMinistryFilter])

  function handleButtonClick(url: string) {
    setPdfUrl(url)
    setPdfShow(true)
  }

  function handleOpenSchedules() {
    setShowSchedules(true)
  }

  function handleCloseSchedules() {
    setShowSchedules(false)
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-200">
      <HeadComponent title="Designações" urlMiniatura={`${domain}/images/designacoes.png`} />
      <LayoutPrincipal
        image={<Image src={iconDesignacoes} alt="Icone de uma pessoa na tribuna" fill />}
        congregationName={congregationData?.name ?? ""}
        circuit={congregationData?.circuit ?? ""}
        textoHeader="Designações Semanais"
        heightConteudo={'1/2'}
        header
        className='bg-designacoes bg-center bg-cover'
      >
        <div className="overflow-auto hide-scrollbar p-2 w-full md:w-9/12 m-auto ">

          {/* Se mostrar o carrossel, esconde os botões */}
          {showSchedules ? (
            <div>
              {schedules ? <SchedulesCarousel schedules={schedules} /> : <SchedulesSkeleton />}

              <Button
                onClick={handleCloseSchedules}
                className="w-1/2 mx-auto mt-4"
              >
                <ChevronsLeftIcon /> Voltar
              </Button>
            </div>
          ) : (
            <>
              {/* VIDA E MINISTÉRIO */}
              <Button
                className="w-full"
                onClick={() => setLifeAndMinistryOptionsShow(!lifeAndMinistryOptionsShow)}
              >
                <LifeAndMinistryIcon /> Vida e Ministério
              </Button>

              {lifeAndMinistryOptionsShow && (
                <div className="flex justify-between w-11/12 gap-1 my-2 m-auto flex-wrap">
                  {hasPdfLifeAndMinistry
                    ? documentsLifeAndMinistryFilterMonths?.map(doc => (
                      <div className="flex-1" key={doc.id}>
                        <Button className="w-full" onClick={() => handleButtonClick(doc.url)}>
                          {removeMimeType(doc.fileName)}
                        </Button>
                      </div>
                    ))
                    : <NotFoundDocument message="Nenhuma programação da reunião Vida e Ministério encontrada!" />}
                </div>
              )}

              {/* REUNIÃO PÚBLICA */}
              <Button
                onClick={() => setPublicOptionsShow(!publicOptionsShow)}
                className="w-full"
              >
                <PublicMeetingIcon /> Reunião Pública
              </Button>

              {publicOptionsShow && (
                <div className="w-full my-2">
                  {hasPdfPublic ? (
                    <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                      {documentsPublicFilter?.map(doc => (
                        <div className="flex-1 min-w-[120px]" key={doc.id}>
                          <Button className="w-full" onClick={() => handleButtonClick(doc.url)}>
                            {removeMimeType(doc.fileName)}
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : schedules ? (
                    <div className="flex justify-center">
                      <Button onClick={handleOpenSchedules}>
                        Ver Programação Semanal
                      </Button>
                    </div>
                  ) : (
                    <SchedulesSkeleton />
                  )}
                </div>
              )}

              <Button
                onClick={() => router.push(`/${number}`)}
                className="w-1/2 mx-auto mt-4"
              >
                <ChevronsLeftIcon /> Voltar
              </Button>
            </>
          )}
        </div>
      </LayoutPrincipal>

      {pdfShow && (
        <PdfViewer url={pdfUrl} setPdfShow={() => setPdfUrl('')} />
      )}
    </div>
  )
}
