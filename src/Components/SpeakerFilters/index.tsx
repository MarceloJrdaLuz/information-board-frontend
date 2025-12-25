import { speakerFilterTalkAtom, talksAtom } from "@/atoms/weekendScheduleAtoms"
import { useAtom, useAtomValue } from "jotai"
import DropdownObject from "../DropdownObjects"

export default function SpeakerFilters() {
  const [filterTalk, setFilterTalk] = useAtom(speakerFilterTalkAtom)
  const talks = useAtomValue(talksAtom)

  return (
    <div className="flex flex-col sm:flex-row gap-1 md:gap-4 w-full p-4 bg-surface-100 rounded-xl">
      <div className="flex-1 min-w-[150px] max-w-full">
        <DropdownObject 
          classname="bg-surface-100 rounded-xl w-full"
          title="Filtrar por tema"
          items={talks ?? []}
          selectedItem={talks?.find(t => t.id === filterTalk) || null}
          handleChange={item => setFilterTalk(item?.id || null)}
          labelKey="number"
          labelKeySecondary="title"
          border
          emptyMessage="Nenhum discurso encontrado"
          textVisible
          searchable
        />
      </div>
    </div>
  )
}
