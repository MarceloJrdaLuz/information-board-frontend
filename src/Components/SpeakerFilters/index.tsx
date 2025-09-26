import { useAtom, useAtomValue } from "jotai"
import DropdownObject from "../DropdownObjects"
import { congregationsAtom, speakerFilterCongregationAtom, speakerFilterTalkAtom, talksAtom } from "@/atoms/weekendScheduleAtoms"

export default function SpeakerFilters() {
  const [filterCongregation, setFilterCongregation] = useAtom(speakerFilterCongregationAtom)
  const [filterTalk, setFilterTalk] = useAtom(speakerFilterTalkAtom)
  const congregations = useAtomValue(congregationsAtom)
  const talks = useAtomValue(talksAtom)

  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full p-4 bg-white rounded-xl">
      <div className="flex-1 min-w-[150px] max-w-full">
        <DropdownObject
          classname="bg-white rounded-xl w-full"
          title="Filtrar por congregação"
          items={congregations ?? []}
          selectedItem={congregations?.find(c => c.id === filterCongregation) || null}
          handleChange={item => setFilterCongregation(item?.id || null)}
          labelKey="name"
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
          labelKey="title"
          border
          emptyMessage="Nenhum discurso"
          textVisible
          searchable
        />
      </div>
    </div>
  )
}
