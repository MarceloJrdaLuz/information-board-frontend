import { ICongregation } from "@/entities/types"
import {
    List,
    Popover,
    PopoverContent,
    PopoverHandler,
} from "@material-tailwind/react"
import { ListFilterIcon } from "lucide-react"
import Button from "../Button"
import CheckboxUniqueObject from "../CheckBoxUniqueObject"
import { formatNameCongregation } from "@/utils/formatCongregationName"

interface IFIlterSpeakersCongregationProps {
    handleCheckboxChange: (selectedCongregationId: string) => void
    onClick?: () => void
    checkedOptions?: string
    congregations: ICongregation[]
}

export default function FilterSpeakersCongregation({ handleCheckboxChange, checkedOptions, onClick, congregations }: IFIlterSpeakersCongregationProps) {
    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-end">
                    <Button onClick={onClick} className="bg-transparent border-none shadow-none text-primary-200 font-bold p-0 w-12">
                        <ListFilterIcon />
                    </Button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-80">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
                    <span>Congregação / Cidade</span>
                    <CheckboxUniqueObject
                        options={[
                            { value: "", label: "Todas as congregações" }, 
                            ...congregations.map(c => ({
                                value: c.id,
                                label: formatNameCongregation(c.name, c.city),
                            }))
                        ]}
                        label="Congregação"
                        checked={checkedOptions}
                        handleCheckboxChange={(selected) => { handleCheckboxChange(selected) }}
                    />
                </List>
            </PopoverContent>
        </Popover>
    )
}