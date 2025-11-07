import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import { IGroup } from "@/types/types"
import {
    List,
    Popover,
    PopoverContent,
    PopoverHandler,
} from "@material-tailwind/react"
import { useEffect, useState } from "react"
import Button from "../Button"
import CheckboxGroups from "../CheckBoxGroups"
import GroupIcon from "../Icons/GroupIcon"

interface IFilterGroupsProps {
    handleCheckboxChange: (selectedOptions: string[]) => void
    onClick?: () => void
    congregation_id: string
    checkedOptions?: string[] // torna a propriedade opcional
}

export default function FilterGroups({ handleCheckboxChange, checkedOptions, congregation_id, onClick }: IFilterGroupsProps) {
    const [groups, setGroups] = useState<IGroup[]>([])

    const fetchConfig = congregation_id ? `/groups/${congregation_id}` : ""
    const { data: getGroups, mutate } = useFetch<IGroup[]>(fetchConfig)

    useEffect(() => {
        if (getGroups) {
            const sort = sortArrayByProperty(getGroups, "number")
            setGroups(sort)
        }
    }, [getGroups])

    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-end">
                    <button onClick={onClick} className="bg-transparent border-none shadow-none text-primary-200 hover:text-primary-150 font-bold p-5">
                        <GroupIcon />
                    </button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-80">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
                    <CheckboxGroups full options={groups} label="Filtrar" handleCheckboxChange={(selectedItems) => handleCheckboxChange(selectedItems)} checkedOptions={checkedOptions} />
                </List>
            </PopoverContent>
        </Popover>
    )
}