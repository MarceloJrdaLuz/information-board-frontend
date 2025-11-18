import { sortArrayByProperty } from "@/functions/sortObjects"
import { ICongregation } from "@/types/types"
import { formatNameCongregation } from "@/utils/formatCongregationName"
import {
    List,
    Popover,
    PopoverContent,
    PopoverHandler,
} from "@material-tailwind/react"
import { ListFilterIcon } from "lucide-react"
import Button from "../Button"
import CheckboxUniqueObject from "../CheckBoxUniqueObject"

interface IFIlterSpeakersCongregationProps {
    handleCheckboxChange: (selectedCongregationId: ICongregation | null) => void
    onClick?: () => void
    checkedOptions?: string
    congregations: ICongregation[]
}

export default function FilterSpeakersCongregation({ handleCheckboxChange, checkedOptions, onClick, congregations }: IFIlterSpeakersCongregationProps) {
    const sortedCongregations = sortArrayByProperty(congregations, "name")
    return (
        <Popover placement="bottom-start">
            <PopoverHandler>
                <div className="flex justify-center items-center">
                    <button onClick={onClick} className="bg-transparent border-none shadow-none text-primary-200 hover:text-primary-150 font-bold p-5">
                        <ListFilterIcon />
                    </button>
                </div>
            </PopoverHandler>
            <PopoverContent className="w-80 bg-surface-100">
                <List className="p-0 max-h-96 overflow-auto hide-scrollbar" >
                    <span className="text-typography-200">Congregação / Cidade</span>
                    <CheckboxUniqueObject
                        options={[
                            { value: "", label: "Todas as congregações" },
                            ...sortedCongregations.map((c) => ({
                                value: c.id,
                                label: formatNameCongregation(c.name, c.city),
                            })),
                        ]}
                        label="Congregação"
                        checked={checkedOptions}
                        handleCheckboxChange={(selectedId) => {
                            if (!selectedId) {
                                handleCheckboxChange(null)
                            } else {
                                const selectedCongregation = sortedCongregations.find(
                                    (c) => c.id === selectedId
                                )
                                handleCheckboxChange(selectedCongregation || null)
                            }
                        }}
                    />
                </List>
            </PopoverContent>
        </Popover>
    )
}