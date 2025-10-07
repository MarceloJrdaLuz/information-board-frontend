import { reportsAtom } from "@/atoms/atom"
import { useAuthContext } from "@/context/AuthContext"
import { isAuxPioneerMonthNow } from "@/functions/isAuxPioneerMonthNow"
import { isPioneerNow } from "@/functions/isRegularPioneerNow"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IPublisher, IReports, Privileges, Situation } from "@/types/types"
import { useAtom } from "jotai"
import { ChevronDownIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import avatarFemale from '../../../public/images/avatar-female.png'
import avatarMale from '../../../public/images/avatar-male.png'
import CheckboxBoolean from "../CheckboxBoolean"
import FilterPrivileges from "../FilterPrivileges"
import FormReportManually from "../Forms/FormReportManually"
import SkeletonPublishersWithAvatarList from "./skeletonPublisherWithAvatarList"

export default function PublisherListReports() {
    const { user } = useAuthContext()
    const congregationUser = user?.congregation
    const router = useRouter()
    const { month } = router.query
    const monthParam = month as string

    const fetchConfig = congregationUser ? `/publishers/congregationId/${congregationUser?.id}` : ""
    const { data, mutate } = useFetch<IPublisher[]>(fetchConfig)

    const [reports, setReports] = useAtom(reportsAtom)
    const [reportFiltered, setReportFiltered] = useState<IReports>()


    const [publishers, setPublishers] = useState<IPublisher[]>()
    const [selectedPublisher, setSelectedPublisher] = useState<IPublisher | null>(null)
    const [filterPublishers, setFilterPublishers] = useState<IPublisher[]>()
    const [filterPrivileges, setFilterPrivileges] = useState<string[]>([])

    const [inactivesShow, setInactivesShow] = useState(false)
    const [publishersOthers, setPublishersOthers] = useState<IPublisher[]>()
    const [arrowClicked, setArrowClicked] = useState(false)

    const [yearSelected, setYearSelected] = useState('')
    const [monthSelected, setMonthSelected] = useState('')


    const handleShowDetails = (publisher: IPublisher) => {
        if (selectedPublisher && selectedPublisher.id === publisher.id) {
            setArrowClicked(!arrowClicked)
        } else {
            setSelectedPublisher(publisher)
            setArrowClicked(true)
        }
    }

    const handleMonthArrowClick = () => {
        setSelectedPublisher(null)
        setArrowClicked(false)
    }

    useEffect(() => {
        if (monthParam) {
            let splitWord = monthParam.split(" ")
            setMonthSelected(splitWord[0])
            setYearSelected(splitWord[1])
            // setDateFormat(new Date(`${meses.indexOf(`${capitalizeFirstLetter(dividirPalavra[0])}`) + 1}-01-${dividirPalavra[1]}`))
        }
    }, [monthParam, setMonthSelected])


    useEffect(() => {
        if (data) {
            const filterActives = data?.filter(publisher => publisher.situation === Situation.ATIVO)
            const filterOthers = data?.filter(publisher => (publisher.situation === Situation.INATIVO || publisher.situation === Situation.REMOVIDO || publisher.situation === Situation.DESASSOCIADO))
            const sortActives = sortArrayByProperty(filterActives, "fullName")
            const sortOthersSituation = sortArrayByProperty(filterOthers, "fullName")
            setPublishers(sortActives)
            setPublishersOthers(sortOthersSituation)
        }
    }, [data])

    useEffect(() => {
        mutate() // Refetch dos dados utilizando a função mutate do useFetch sempre que muda a rota
    }, [router.asPath, mutate])


    const handleCheckboxChange = (filter: string[]) => {
        setFilterPrivileges(filter)
    }

    useEffect(() => {
        if (inactivesShow) {
            setFilterPublishers(publishersOthers)
            return
        }
        const filterPublishersToPrivileges = filterPrivileges.length > 0 ?
            publishers?.filter(publisher => {
                return (publisher.situation === Situation.ATIVO &&
                    filterPrivileges.every(privilege => {
                        if (privilege === Privileges.PIONEIROAUXILIAR) {
                            return publisher.privileges.includes(Privileges.PIONEIROAUXILIAR) && isAuxPioneerMonthNow(publisher)
                        } else if (privilege === Privileges.PIONEIROREGULAR) {
                            return publisher.privileges.includes(Privileges.PIONEIROREGULAR) && isPioneerNow(publisher, new Date())
                        } else if (privilege === Privileges.AUXILIARINDETERMINADO) {
                            return publisher.privileges.includes(Privileges.AUXILIARINDETERMINADO) && isPioneerNow(publisher, new Date())
                        } else {
                            return publisher.privileges.includes(privilege)
                        }
                    })
                )
            }) : publishers?.filter(publisher => publisher.situation === Situation.ATIVO)
        setFilterPublishers(filterPublishersToPrivileges)
    }, [filterPrivileges, publishers, inactivesShow, publishersOthers])

    let skeletonPublishersList = Array(6).fill(0)

    function renderSkeleton() {
        return (
            <ul className="flex w-full h-fit flex-wrap justify-center">
                {skeletonPublishersList.map((a, i) => (<SkeletonPublishersWithAvatarList key={i + 'skeleton'} />))}
            </ul>
        )
    }

    useEffect(() => {
        const reportsFilteredByDateAndPublisher = reports.filter(report => (
            (report.month.toLocaleLowerCase() === monthSelected && report.year === yearSelected) &&
            (report.publisher.id === selectedPublisher?.id)
        ))
        setReportFiltered(reportsFilteredByDateAndPublisher[0])
    }, [reports, monthSelected, yearSelected, selectedPublisher])


    return (
        <>
            <ul className="flex flex-wrap justify-center items-center w-full">
                <div className="w-full md:w-10/12 flex justify-between items-center mt-4">
                    <CheckboxBoolean handleCheckboxChange={(check) => setInactivesShow(check)} checked={inactivesShow} label="Inativos" />
                    <FilterPrivileges checkedOptions={filterPrivileges} handleCheckboxChange={filter => handleCheckboxChange(filter)} />
                    {filterPublishers && <span className="flex my-3 pr-1 justify-end w-full md:w-10/12 text-primary-200 text-sm md:text-base font-semibold">Resultados: {filterPublishers?.length}</span>}
                </div>
                {filterPublishers && filterPublishers.length > 0 ? filterPublishers?.map(publisher =>
                    <li className={`flex flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100  m-1 ${selectedPublisher && selectedPublisher.id === publisher.id ? 'h-auto' : ''}`} key={`${publisher.id}`}>
                        <div className="flex w-full justify-between items-center">
                            <div className="flex items-center p-6 ">
                                {publisher.gender === "Masculino" ?
                                    <Image alt="Avatar de um homem" src={avatarMale} className="w-10 rounded-full bg-[#a4e6da]" />
                                    :
                                    <Image alt="Avatar de uma mulher" src={avatarFemale} className="w-10 rounded-full" />
                                }
                                <span className="pl-4 font-semi-bold">{publisher.fullName}</span>
                            </div>
                            <button className={`w-6 h-6 mr-4 flex justify-center items-center  ${arrowClicked && selectedPublisher && selectedPublisher.id === publisher.id ? 'rotate-180' : ''}`} onClick={() => {
                                handleShowDetails(publisher)
                            }}><ChevronDownIcon /> </button>
                        </div>
                        <div className={` w-full overflow-hidden duration-500 transition-height ${arrowClicked && selectedPublisher && selectedPublisher.id === publisher.id ? 'h-auto py-5 bg-white' : 'h-0'}`}>
                            <div>
                            {reportFiltered?.publisher.id === publisher.id  ? <FormReportManually publisher={publisher} report={reportFiltered}/> : <FormReportManually report={null} publisher={selectedPublisher}/> }
                            </div>
                        </div>
                    </li>
                ) : (
                    renderSkeleton()
                )}
            </ul>
        </>
    )
}