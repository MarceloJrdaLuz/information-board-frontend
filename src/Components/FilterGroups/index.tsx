import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IGroup } from "@/types/types"
import { useEffect, useState } from "react"
import GroupIcon from "../Icons/GroupIcon"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"

import { ScrollArea } from "../ui/scroll-area"

import CheckboxGroups from "../CheckBoxGroups"

interface IFilterGroupsProps {
  handleCheckboxChange: (selectedOptions: string[]) => void
  onClick?: () => void
  congregation_id: string
  checkedOptions?: string[]
}

export default function FilterGroups({
  handleCheckboxChange,
  checkedOptions,
  congregation_id,
  onClick,
}: IFilterGroupsProps) {
  const [groups, setGroups] = useState<IGroup[]>([])

  const fetchConfig = congregation_id ? `/groups/${congregation_id}` : ""
  const { data: getGroups } = useFetch<IGroup[]>(fetchConfig)

  useEffect(() => {
    if (getGroups) {
      const sort = sortArrayByProperty(getGroups, "number")
      setGroups(sort)
    }
  }, [getGroups])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          onClick={onClick}
          className="bg-transparent border-none shadow-none text-primary-200 hover:text-primary-150 font-bold p-5"
        >
          <GroupIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 bg-white dark:bg-neutral-900 p-2">
        <ScrollArea className="max-h-96">
          <CheckboxGroups
            full
            options={groups}
            label="Filtrar"
            handleCheckboxChange={handleCheckboxChange}
            checkedOptions={checkedOptions}
          />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
