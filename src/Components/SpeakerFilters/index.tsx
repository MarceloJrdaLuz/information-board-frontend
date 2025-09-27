import { useAtom, useAtomValue } from "jotai"
import DropdownObject from "../DropdownObjects"
import { congregationsAtom, speakerFilterCongregationAtom, speakerFilterTalkAtom, talksAtom } from "@/atoms/weekendScheduleAtoms"
import { sortArrayByProperty } from "@/functions/sortObjects"

export default function SpeakerFilters() {
  const [filterCongregation, setFilterCongregation] = useAtom(speakerFilterCongregationAtom)
  const [filterTalk, setFilterTalk] = useAtom(speakerFilterTalkAtom)
  const congregations = useAtomValue(congregationsAtom)
  const talks = useAtomValue(talksAtom)

  const sortedCongregations = sortArrayByProperty(congregations || [], "name")

  return (
    <div className="flex flex-col sm:flex-row gap-1 md:gap-4 w-full p-4 bg-white rounded-xl">
      <div className="flex-1 min-w-[150px] max-w-full">
        <DropdownObject
          classname="bg-white rounded-xl w-full"
          title="Filtrar por congregação"
          items={sortedCongregations ?? []}
          selectedItem={congregations?.find(c => c.id === filterCongregation) || null}
          handleChange={item => setFilterCongregation(item?.id || null)}
          labelKey="name"
          labelKeySecondary="city"
          border
          emptyMessage="Nenhuma congregação"
          textVisible
          searchable
        />
      </div>
      <div className="flex-1 min-w-[150px] max-w-full">
        <DropdownObject
          classname="bg-white rounded-xl w-full"
          title="Filtrar por tema"
          items={talks ?? []}
          selectedItem={talks?.find(t => t.id === filterTalk) || null}
          handleChange={item => setFilterTalk(item?.id || null)}
          labelKey="number"
          labelKeySecondary="title"
          border
          emptyMessage="Nenhum discurso"
          textVisible
          searchable
        />
      </div>
    </div>
  )
}
