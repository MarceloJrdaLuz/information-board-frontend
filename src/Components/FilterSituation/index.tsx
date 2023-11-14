import {
    Popover,
    PopoverHandler,
    PopoverContent,
    List,
} from "@material-tailwind/react"
import Button from "../Button"
import { ListFilterIcon } from "lucide-react"
import {  Situation } from "@/entities/types"
import { useState } from "react"
import CheckboxMultiple from "../CheckBoxMultiple"

interface IFIlterSituationProps {
    handleCheckboxChange: (selectedOptions: string[]) => void
    onClick?: () => void
    checkedOptions?: string[] // torna a propriedade opcional
}

export default function FilterSituation({ handleCheckboxChange, checkedOptions, onClick }: IFIlterSituationProps) {
    const [situation, setSituation] = useState(Object.values(Situation))

    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button onClick={onClick} className="bg-transparent border-none shadow-none text-primary-200 font-bold p-0 w-12">
                    <span>Situação</span>
                    </Button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-80">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
                    <CheckboxMultiple full options={situation} label="Filtrar" handleCheckboxChange={(selectedItems) => handleCheckboxChange(selectedItems)} checkedOptions={checkedOptions} />
                </List>
            </PopoverContent>
        </Popover>
    )
}