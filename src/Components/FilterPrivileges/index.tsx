import {
    List,
    Popover,
    PopoverContent,
    PopoverHandler,
} from "@material-tailwind/react"
import { ListFilterIcon } from "lucide-react"
import { useState } from "react"
import Button from "../Button"
import CheckboxMultiple from "../CheckBoxMultiple"
import { Privileges } from "@/types/types"

interface IFIlterPrivilegesProps {
    handleCheckboxChange: (selectedOptions: string[]) => void
    onClick?: () => void
    checkedOptions?: string[]
    includeOptionAll?: boolean
}

export default function FilterPrivileges({ handleCheckboxChange, checkedOptions, onClick, includeOptionAll }: IFIlterPrivilegesProps) {
    const [privileges, setPrivileges] = useState(includeOptionAll ? [ 'Todos', ...Object.values(Privileges)] : Object.values(Privileges))

    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button onClick={onClick} className="bg-transparent border-none shadow-none text-primary-200 font-bold p-0 w-12">
                        <ListFilterIcon />
                    </Button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-80 bg-surface-100">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
                    <CheckboxMultiple full options={privileges} label="Filtrar" handleCheckboxChange={(selectedItems) => handleCheckboxChange(selectedItems)} checkedOptions={checkedOptions} />
                </List>
            </PopoverContent>
        </Popover>
    )
}