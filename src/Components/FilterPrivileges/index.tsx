import {
    Popover,
    PopoverHandler,
    PopoverContent,
    List,
} from "@material-tailwind/react"
import Button from "../Button"
import {  ListFilterIcon } from "lucide-react"
import {  Privileges } from "@/entities/types"
import { useState } from "react"
import CheckboxMultiple from "../CheckBoxMultiple"

interface IFIlterPrivilegesProps {
    handleCheckboxChange: (selectedOptions: string[]) => void
    checkedOptions?: string[] // torna a propriedade opcional
}

export default function FilterPrivileges({ handleCheckboxChange, checkedOptions }: IFIlterPrivilegesProps) {
    const [privileges, setPrivileges] = useState(Object.values(Privileges))

    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button className="bg-transparent border-none shadow-none text-primary-200 font-bold p-0 w-12">
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