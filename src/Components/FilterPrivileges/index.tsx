import {
    Popover,
    PopoverHandler,
    PopoverContent,
    List,
    ListItem,
} from "@material-tailwind/react"
import Button from "../Button"
import { ChevronDownIcon, CopyCheck, CopyIcon, ListFilterIcon } from "lucide-react"
import { IPublisher, Privileges } from "@/entities/types"
import clipboard from 'clipboard'
import { useState } from "react"
import CheckboxMultiple from "../CheckBoxMultiple"
import CheckboxUnique from "../CheckBoxUnique"

interface IFIlterPrivilegesProps {
    handleCheckboxChange: (selectedOptions: string[]) => void
    checkedOptions?: string[] // torna a propriedade opcional
}

export default function FIlterPriviles({ handleCheckboxChange, checkedOptions }: IFIlterPrivilegesProps) {
    const [privileges, setPrivileges] = useState(Object.values(Privileges))

    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button className="bg-transparent border-none shadow-none text-primary-200 font-bold p-0">
                        <ListFilterIcon />
                    </Button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-80">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
                    <CheckboxMultiple full options={privileges} label="Filtrar" handleCheckboxChange={(selectedItems) => handleCheckboxChange(selectedItems)} checkedOptions={checkedOptions} />
                </List>
            </PopoverContent>
        </Popover>
    )
}