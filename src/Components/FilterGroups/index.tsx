import {
    Popover,
    PopoverHandler,
    PopoverContent,
    List,
} from "@material-tailwind/react"
import Button from "../Button"
import { IGroup } from "@/entities/types"
import { useEffect, useState } from "react"
import CheckboxMultiple from "../CheckBoxMultiple"
import GroupIcon from "../Icons/GroupIcon"
import { sortArrayByProperty } from "@/functions/sortObjects"
import { useFetch } from "@/hooks/useFetch"
import CheckboxGroups from "../CheckBoxGroups"

interface IFilterGroupsProps {
    handleCheckboxChange: (selectedOptions: string[]) => void
    congregation_id: string
    checkedOptions?: string[] // torna a propriedade opcional
}

export default function FilterGroups({ handleCheckboxChange, checkedOptions, congregation_id }: IFilterGroupsProps) {
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
                    <Button className="bg-transparent border-none shadow-none text-primary-200 font-bold p-0 w-12">
                        <GroupIcon />
                    </Button>
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