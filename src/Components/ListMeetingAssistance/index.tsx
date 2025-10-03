import { capitalizeFirstLetter } from "@/functions/isAuxPioneerMonthNow"
import { getMonthsByYear } from "@/functions/meses"
import { IMeetingAssistance } from "@/types/types"
import { useEffect, useMemo, useState } from "react"
import SkeletonAssistanceList from "./skeletonAssistanceList"
import { IListItemsProps } from "./types"

function ListMeetingAssistance({ items, yearService }: IListItemsProps) {
  const months = useMemo(() => getMonthsByYear(yearService).months, [yearService])
  const [filteredByYearService, setFilteredByYearService] = useState<IMeetingAssistance[]>([])

  useEffect(() => {
    const filteredItems: IMeetingAssistance[] = months.reduce((acc: IMeetingAssistance[], month) => {
      const filterByYearService = items?.find(
        (item) =>
          item.month === capitalizeFirstLetter(month.split(" ")[0]) &&
          item.year === month.split(" ")[1]
      )
      if (filterByYearService) {
        acc.push(filterByYearService)
      }
      return acc
    }, [])
    setFilteredByYearService(filteredItems)
  }, [items, months])

  let skeletonTerritoriesList = Array(6).fill(0)

  function renderSkeleton() {
    return (
      <ul className="flex w-full h-fit flex-wrap justify-center">
        {skeletonTerritoriesList.map((a, i) => (<SkeletonAssistanceList key={i + 'skeleton'} />))}
      </ul>
    )
  }

  return (
    <ul className="flex w-full h-fit flex-wrap justify-center mt-5">
      {filteredByYearService && filteredByYearService.length > 0 ? filteredByYearService?.map(item => (
        <li
          className={`flex flex-col flex-wrap justify-between items-center bg-white hover:bg-sky-100 cursor-pointer w-full md:w-10/12 text-fontColor-100 m-1`}
          key={item.id}
        >
          <div className="flex w-full justify-start items-center p-6 pb-0 text-primary-200 font-semibold">
            <span className="font-semibold">{`${item.month} de ${item.year}`}</span>
          </div>
          <div className="flex flex-wrap justify-between w-full p-6 font-semi-bold text-sm">
            <div className="border border-blue-gray-200 w-full p-4 mb-4 text-primary-200 font-semibold">
              Reunião do meio de semana
              <div className="w-96 mt-2 text-gray-900">
                <span className=" font-semibold mr-5">Total:</span>
                <span>{item.midWeekTotal}</span>
              </div>
              <div className="w-96 text-gray-900">
                <span className=" font-semibold mr-5 ">Média: </span>
                <span>{item.midWeekAverage}</span>
              </div>
            </div>
            <div className="border border-blue-gray-200 w-full p-4 text-primary-200 font-semibold">
              Reunião do fim de semana
              <div className="w-96 mt-2 text-gray-900">
                <span className=" font-semibold mr-5">Total:</span>
                <span>{item.endWeekTotal}</span>
              </div>
              <div className="w-96 text-gray-900">
                <span className=" font-semibold mr-5 ">Média: </span>
                <span>{item.endWeekAverage}</span>
              </div>
            </div>
          </div>
        </li>
      )) : (
        <>
          {
            renderSkeleton()
            // <div className="flex text-gray-800 border-l-4 border-[1px] border-primary-200 my-4 mx-0 p-2 ">
            //   <span className="h-full pr-1">
            //     <InfoIcon className="p-0.5 text-primary-200" />
            //   </span>
            //   <span>Nenhum registro de assistência cadastrado nessa congregação no ano de serviço selecionado.</span>
            // </div>
          }
        </>
      )}
    </ul>
  )
}

export default ListMeetingAssistance
