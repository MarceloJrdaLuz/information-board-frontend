import Button from "@/Components/Button"
import FieldServiceCarousel from "@/Components/FieldServiceScheduleCarousel"
import HeadComponent from "@/Components/HeadComponent"
import PreachingIcon from "@/Components/Icons/PreachingIcon"
import PublicPreachingIcon from "@/Components/Icons/PublicPreachingIcon"
import LayoutPrincipal from "@/Components/LayoutPrincipal"
import NotFoundDocument from "@/Components/NotFoundDocument"
import PdfViewer from "@/Components/PdfViewer"
import Spiner from "@/Components/Spiner"
import { domainUrl } from "@/atoms/atom"
import { themeAtom } from "@/atoms/themeAtoms"
import { API_ROUTES } from "@/constants/apiRoutes"
import { usePublicDocumentsContext } from "@/context/PublicDocumentsContext"
import { removeMimeType } from "@/functions/removeMimeType"
import { useFetch } from "@/hooks/useFetch"
import PublicDocumentsProviderLayout from "@/layouts/providers/publicDocuments/_layout"
import { FieldServicePdfResponse } from "@/types/fieldService"
import { Categories, ICongregation, IDocument } from "@/types/types"
import { useAtomValue } from "jotai"
import { ChevronsLeftIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import iconPreaching from '../../../public/images/campo-gray.png'
import { IPublicWitnessCarouselResponse } from "@/types/publicWitness/schedules"
import PublicWitnessCarousel from "@/Components/PublicWitnessCarousel"
function Campo() {
    const router = useRouter()
    const { number } = router.query
    const domain = useAtomValue(domainUrl)
    const [congregationData, setCongregationData] = useState<ICongregation>()

    const fetchConfigCongregationData = number ? `/congregation/${number}` : ""
    const { data: congregation } = useFetch<ICongregation>(fetchConfigCongregationData)
    const themeAtomValue = useAtomValue(themeAtom)
    const isDark = themeAtomValue === "theme-dark"


    useEffect(() => {
        if (congregation) {
            setCongregationData(congregation)
        }
    }, [congregation])

    const { setCongregationNumber, documents, filterDocuments } = usePublicDocumentsContext()

    const [pdfShow, setPdfShow] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [fieldServiceOptionsShow, setFieldServiceOptionsShow] = useState(false)
    const [publicServiceOptionsShow, setLPublicServiceOptionsShow] = useState(false)
    const [documentsFieldServiceFilter, setDocumentsFieldServiceFilter] = useState<IDocument[]>()
    const [documentsPublicServiceFilter, setDocumentsPublicServiceFilter] = useState<IDocument[]>()

    const { data: allSchedules, isLoading } = useFetch<FieldServicePdfResponse>(
        number ? `${API_ROUTES.FIELD_SERVICE_SCHEDULES}/futures/congregation/${congregation?.id}` : ""
    )

    const { data: allSchedulesPublicWitness, isLoading: loadingPublicWitness } = useFetch<IPublicWitnessCarouselResponse>(
        number ? `publicWitness/schedules/futures/congregation/${congregation?.id}` : ""
    );

    console.log(allSchedulesPublicWitness)

    useEffect(() => {
        if (number) {
            setCongregationNumber(number as string)
        }
    }, [number, setCongregationNumber])

    useEffect(() => {
        if (documents) {
            setDocumentsFieldServiceFilter(filterDocuments(Categories.saidasDeCampo))
            setDocumentsPublicServiceFilter(filterDocuments(Categories.testemunhoPublico))
        }
    }, [documents, filterDocuments])

    function handleButtonClick(url: string) {
        setPdfUrl(url)
        setPdfShow(true)
    }

    return !pdfShow ? (
        <div className="flex flex-col h-screen w-screen bg-typography-200">
            <HeadComponent title="Designações de Campo" urlMiniatura={`${domain}/images/campo.png`} />
            <div className="flex flex-col h-screen w-screen bg-typography-200 overflow-auto">
                <LayoutPrincipal
                    nCong={congregationData?.number}
                    image={<Image src={iconPreaching} alt="Icone de uma pessoa pregando" fill />}
                    congregationName={congregationData?.name ?? ""}
                    circuit={congregationData?.circuit ?? ""}
                    heightConteudo={'1/2'}
                    header
                    className="bg-designacoes bg-center bg-cover"
                    textoHeader="Designações de Campo"
                >
                    <div className="linha bg-typography-500 mt-2 w-full h-0.5 md:w-8/12 my-0 m-auto"></div>
                    <div className="overflow-auto hide-scrollbar p-2 w-full md:w-8/12 m-auto ">

                        {/* SEÇÃO: SAÍDAS DE CAMPO */}
                        <div className="mb-4">
                            <Button outline={isDark}
                                onClick={() => setFieldServiceOptionsShow(!fieldServiceOptionsShow)}
                                className="w-full"
                            >
                                <PreachingIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Saídas de Campo
                            </Button>

                            {fieldServiceOptionsShow && (
                                <div className="mt-4 space-y-4">
                                    {/* 1. PRIORIDADE: DADOS DINÂMICOS (CARROSSEL) */}
                                    {isLoading ? (
                                        <div className="w-full flex justify-center py-4">
                                            <Spiner size="w-8 h-8" />
                                        </div>
                                    ) : allSchedules && (allSchedules.rotationBlocks.length > 0 || allSchedules.fixedSchedules.length > 0) ? (
                                        <div className="w-full animate-in fade-in duration-500">
                                            <FieldServiceCarousel
                                                fixedSchedules={allSchedules.fixedSchedules}
                                                rotationBlocks={allSchedules.rotationBlocks}
                                            />
                                        </div>
                                    ) : null}

                                    {/* 2. COMPLEMENTO OU ALTERNATIVA: LISTA DE PDFS */}
                                    <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                                        {documents ? (
                                            documentsFieldServiceFilter && documentsFieldServiceFilter.length > 0 ? (
                                                <>
                                                    {/* Pequeno título se houver carrossel em cima */}
                                                    {allSchedules && <p className="w-full text-[10px] text-typography-600 uppercase font-bold mt-2 ml-1"> Ver em PDF</p>}

                                                    {documentsFieldServiceFilter.map(document => (
                                                        <div className={`${removeMimeType(document.fileName).length > 10 ? 'w-full' : 'flex-1'} min-w-[120px]`} key={document.id}>
                                                            <Button outline={isDark}
                                                                className="w-full text-xs"
                                                                onClick={() => handleButtonClick(document.url)}
                                                            >
                                                                {removeMimeType(document.fileName)}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                /* MENSAGEM DE "NÃO ENCONTRADO" SÓ SE NÃO HOUVER PDF E NEM DADOS DINÂMICOS */
                                                (!allSchedules || (allSchedules.rotationBlocks.length === 0 && allSchedules.fixedSchedules.length === 0)) && (
                                                    <NotFoundDocument message="Nenhuma programação de saída de campo encontrada!" />
                                                )
                                            )
                                        ) : (
                                            <div className="w-full"><Spiner size="w-8 h-8" /></div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SEÇÃO: TESTEMUNHO PÚBLICO (Segue a mesma lógica original por enquanto) */}
                        <div className="mb-8">
                            <Button outline={isDark}
                                onClick={() => setLPublicServiceOptionsShow(!publicServiceOptionsShow)}
                                className="w-full"
                            >
                                <PublicPreachingIcon className="w-5 h-5 sm:w-6 sm:h-6" /> Testemunho Público
                            </Button>

                            {publicServiceOptionsShow && (
                                <div className="mt-4 space-y-4">

                                    {/* 1. PRIORIDADE: DADOS DINÂMICOS (CARROSSEL) */}
                                    {loadingPublicWitness ? (
                                        <div className="w-full flex justify-center py-4">
                                            <Spiner size="w-8 h-8" />
                                        </div>
                                    ) : allSchedulesPublicWitness &&
                                        (allSchedulesPublicWitness.rotationBlocks.length > 0 ||
                                            allSchedulesPublicWitness.fixedSchedules.length > 0) ? (
                                        <div className="w-full animate-in fade-in duration-500">
                                            <PublicWitnessCarousel
                                                fixedSchedules={allSchedulesPublicWitness.fixedSchedules}
                                                rotationBlocks={allSchedulesPublicWitness.rotationBlocks}
                                            />
                                        </div>
                                    ) : null}

                                    {/* 2. COMPLEMENTO: PDFs */}
                                    <div className="flex justify-between w-11/12 gap-1 m-auto flex-wrap">
                                        {documents ? (
                                            documentsPublicServiceFilter && documentsPublicServiceFilter.length > 0 ? (
                                                <>
                                                    {allSchedulesPublicWitness && (
                                                        <p className="w-full text-[10px] text-typography-600 uppercase font-bold mt-2 ml-1">
                                                            Ver em PDF
                                                        </p>
                                                    )}

                                                    {documentsPublicServiceFilter.map(document => (
                                                        <div
                                                            key={document.id}
                                                            className={`${removeMimeType(document.fileName).length > 10
                                                                ? "w-full"
                                                                : "flex-1"
                                                                } min-w-[120px]`}
                                                        >
                                                            <Button
                                                                outline={isDark}
                                                                className="w-full"
                                                                onClick={() => handleButtonClick(document.url)}
                                                            >
                                                                {removeMimeType(document.fileName)}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </>
                                            ) : (
                                                (!allSchedulesPublicWitness ||
                                                    (allSchedulesPublicWitness.rotationBlocks.length === 0 &&
                                                        allSchedulesPublicWitness.fixedSchedules.length === 0)) && (
                                                    <NotFoundDocument message="Nenhuma programação de testemunho público encontrada!" />
                                                )
                                            )
                                        ) : (
                                            <div className="w-full">
                                                <Spiner size="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>

                                </div>
                            )}

                        </div>

                        <Button outline={isDark}
                            onClick={() => router.push(`/${number}`)}
                            className="w-1/2 mx-auto"
                        ><ChevronsLeftIcon />Voltar</Button>
                    </div>
                </LayoutPrincipal>
            </div>
        </div>
    ) : (
        <PdfViewer url={pdfUrl} setPdfShow={() => setPdfShow(false)} />
    )
}

Campo.getLayout = (page: React.ReactElement) => {
    return (
        <PublicDocumentsProviderLayout>
            {page}
        </PublicDocumentsProviderLayout>
    )
}

export default Campo
