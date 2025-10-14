'use-client'
import { domainUrl } from '@/atoms/atom'
import Button from '@/Components/Button'
import HeadComponent from '@/Components/HeadComponent'
import LifeAndMinistryIcon from '@/Components/Icons/LifeAndMinistryIcon'
import PublicMeetingIcon from '@/Components/Icons/PublicMeetingIcon'
import LayoutPrincipal from '@/Components/LayoutPrincipal'
import NotFoundDocument from '@/Components/NotFoundDocument'
import PdfViewer from '@/Components/PdfViewer'
import SchedulesCarousel from '@/Components/SchedulesCarousel'
import Spiner from '@/Components/Spiner'
import { usePublicDocumentsContext } from '@/context/PublicDocumentsContext'
import DateConverter, { meses } from '@/functions/meses'
import { removeMimeType } from '@/functions/removeMimeType'
import { threeMonths } from '@/functions/threeMonths'
import { useFetch } from '@/hooks/useFetch'
import { Categories, ICongregation, IDocument } from '@/types/types'
import { IPublicSchedule } from '@/types/weekendSchedule'
import { useAtomValue } from 'jotai'
import { ChevronsLeftIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import iconDesignacoes from '../../../public/images/designacoes-gray.png'

export default function Designacoes() {
  const router = useRouter()
  const { number } = router.query
  const domain = useAtomValue(domainUrl)

  const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

  const [pdfShow, setPdfShow] = useState(false)
  const [publicOptionsShow, setPublicOptionsShow] = useState(false)
  const [lifeAndMinistryOptionsShow, setLifeAndMinistryOptionsShow] = useState(false)
  const [pdfUrl, setPdfUrl] = useState('')
  const [documentsLifeAndMinistryFilter, setDocumentsLifeAndMinistryFilter] = useState<IDocument[]>()
  const [documentsLifeAndMinistryFilterMonths, setDocumentsLifeAndMinistryFilterMonths] = useState<IDocument[]>()
  const [documentsPublicFilter, setDocumentsPublicFilter] = useState<IDocument[]>()
  const [documentsOthersFilter, setDocumentsOthersFilter] = useState<IDocument[]>()
  const [congregationData, setCongregationData] = useState<ICongregation>()

  const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
  const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)

  const fetchConfigWeekendSchedulesData = number && congregation?.id
    ? `/congregation/${congregation.id}/weekendSchedules/public`
    : ""

  const { data: schedules } = useFetch<Record<string, IPublicSchedule[]>>(fetchConfigWeekendSchedulesData)


  useEffect(() => {
    if (congregation) {
      setCongregationData(congregation)
    }
  }, [congregation])


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

  function compareDocumentsByMonth(a: IDocument, b: IDocument) {
    const monthA = meses.indexOf(a.fileName.split(".")[0])
    const monthB = meses.indexOf(b.fileName.split(".")[0])

    if (monthA < monthB) {
      return -1
    } else if (monthA > monthB) {
      return 1
    } else {
      return 0
    }
  }

  return !pdfShow ? (
    <div className=" flex flex-col h-screen w-screen bg-gray-200">
      <HeadComponent title="Designações" urlMiniatura={`${domain}/images/designacoes.png`} />
      <LayoutPrincipal
        image={
          <Image src={iconDesignacoes} alt="Icone de uma pessoa na tribuna" fill />
        }
        congregationName={congregationData?.name ?? ""}
        circuit={congregationData?.circuit ?? ""}
        textoHeader="Designações Semanais"
        heightConteudo={'1/2'}
        header
        className='bg-designacoes bg-center bg-cover'
      >
        <div className="overflow-auto hide-scrollbar p-2 w-full md:w-9/12 m-auto ">
          <div>
            <Button
              className="w-full"
              onClick={() => { setLifeAndMinistryOptionsShow(!lifeAndMinistryOptionsShow) }}
            >
              <LifeAndMinistryIcon /> Reunião do Meio de Semana
            </Button>
            {lifeAndMinistryOptionsShow && (
              documents ? (<div className="flex justify-between w-11/12 gap-1 my-2 m-auto flex-wrap">
                {lifeAndMinistryOptionsShow && documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length > 0 && documentsLifeAndMinistryFilterMonths?.map(document => (
                  <div className="flex-1 " key={document.id}>
                    <Button
                      className="w-full"
                      onClick={() => { handleButtonClick(document.url) }}
                    >{removeMimeType(document.fileName)}</Button>
                  </div>
                ))}
              </div>) : (
                <div className="w-full my-2"><Spiner size="w-8 h-8" /></div>
              ))}
            {lifeAndMinistryOptionsShow &&
              <div className="flex justify-between w-11/12 gap-1  my-2 m-auto flex-wrap">
                {lifeAndMinistryOptionsShow && documentsOthersFilter && documentsOthersFilter.map(document => (
                  <div className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`} key={document.id}>
                    <Button
                      onClick={() => { handleButtonClick(document.url) }}
                      className="w-full text-sm" >{removeMimeType(document.fileName)}</Button>
                  </div>
                ))}
              </div>}

            {!lifeAndMinistryOptionsShow ? (
              <>
                {!lifeAndMinistryOptionsShow && congregationData?.dayMeetingLifeAndMinistary && congregationData?.hourMeetingLifeAndMinistary ? <p className="font-bold my-2 text-lg text-gray-900">{`${congregationData?.dayMeetingLifeAndMinistary} ${congregationData?.hourMeetingLifeAndMinistary?.split(":").slice(0, 2).join(":")}`}</p> : null}
              </>
            ) : (
              <>
                {documentsLifeAndMinistryFilterMonths && documentsLifeAndMinistryFilterMonths.length < 1 && documentsOthersFilter && documentsOthersFilter.length < 1 && <NotFoundDocument message="Nenhuma programação da reunião Vida e Ministério encontrada!" />}
              </>
            )}

          </div>
          <div>
            <Button
              onClick={() => { setPublicOptionsShow(!publicOptionsShow) }}
              className="w-full"
            ><PublicMeetingIcon />Reunião do Fim de Semana
            </Button>
            {publicOptionsShow && (
              documents ? (
                <div className="flex justify-between w-11/12 gap-1  my-2 m-auto flex-wrap">
                  {documentsPublicFilter && documentsPublicFilter.length > 0 ? (
                    documentsPublicFilter.map(document => (
                      <div
                        className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`}
                        key={document.id}
                      >
                        <Button
                          onClick={() => { handleButtonClick(document.url) }}
                          className="w-full"
                        >
                          {removeMimeType(document.fileName)}
                        </Button>
                      </div>
                    ))
                  ) : schedules && Object.keys(schedules).length > 0 ? (
                    <SchedulesCarousel schedules={schedules} />
                  ) : (
                    <NotFoundDocument message="Nenhuma programação da Reunião Pública encontrada!" />
                  )}
                </div>
              ) : (
                <div className="w-full my-2"><Spiner size="w-8 h-8" /></div>
              )
            )}
            {!publicOptionsShow && congregationData?.dayMeetingPublic && congregationData?.hourMeetingPublic ? <p className="font-bold text-lg my-2 text-gray-900">{`${congregationData?.dayMeetingPublic} ${congregationData?.hourMeetingPublic?.split(":").slice(0, 2).join(":")}`}</p> : null}
          </div>
          <Button
            onClick={() => router.push(`/${number}`)}
            className="w-1/2 mx-auto"
          ><ChevronsLeftIcon />Voltar</Button>
        </div>
      </LayoutPrincipal>
    </div>
  ) : (
    <>
      <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
    </>
  )
}
