import ptBR from "date-fns/locale/pt-BR"
import dayjs from 'dayjs'
import { CalendarIcon } from 'lucide-react'
import { forwardRef, useEffect } from 'react'
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'; // Estilos padrão do DatePicker
import { DatePickerHeader } from '../DatePickerHeader'
registerLocale("pt-BR", ptBR)

interface CalendarProps {
    handleDateChange: (date: string | null) => void
    selectedDate: string | null
    minDate?: string | null
    label: string
    titleHidden?: boolean
    disabled?: boolean
    full?: boolean
}

export default function Calendar({
    handleDateChange,
    selectedDate,
    minDate,
    label,
    titleHidden,
    disabled = false,
    full = false
}: CalendarProps) {

    // Converte string -> Date para exibir no DatePicker
    const parsedSelected = selectedDate
        ? dayjs(selectedDate, "YYYY-MM-DD").toDate()
        : null

    const parsedMin = minDate
        ? dayjs(minDate, "YYYY-MM-DD").toDate()
        : null

    useEffect(() => {
        if (!selectedDate || !minDate) return
        if (selectedDate === minDate) return

        const selected = dayjs(selectedDate)
        const min = dayjs(minDate)

        if (selected.isBefore(min, "day")) {
            handleDateChange(minDate)
        }
    }, [selectedDate, minDate, handleDateChange])

    return (
        <div>
            {!titleHidden && <h1 className="font-bold my-2 text-typography-700">{label}</h1>}

            <DatePicker
                wrapperClassName={full ? "w-full" : ""}
                disabled={disabled}
                customInput={<CustomInput label={label} disabled={disabled} />}
                locale="pt-BR"
                selected={parsedSelected}
                minDate={parsedMin}
                dateFormat="dd/MM/yyyy"
                onChange={(date: Date | null) => {
                    if (!date) {
                        handleDateChange(null)
                        return
                    }
                    // Date -> "YYYY-MM-DD"
                    const formatted = dayjs(date).format("YYYY-MM-DD")
                    handleDateChange(formatted)
                }}
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className={` px-3 py-2.5 w-full text-sm
                    text-typography-700 appearance-none placeholder-transparent focus:outline-none  rounded-lg bg-transparent read-only:bg-typography-300 read-only:rounded-lg font-sans font-normal text-left border-[1px] border-blue-gray-200`}
                renderCustomHeader={(props) => (
                    <DatePickerHeader
                        date={props.date}
                        decreaseMonth={props.decreaseMonth}
                        increaseMonth={props.increaseMonth}
                        changeMonth={props.changeMonth}
                        changeYear={props.changeYear}
                    />
                )}
            />
        </div>
    )
}



const CustomInput = forwardRef(({ value, onClick, label, disabled }: any, ref: any) => (
    <button
        type="button"
        onClick={!disabled ? onClick : undefined}
        disabled={disabled}
        ref={ref}
        className={`flex items-center justify-between gap-5 px-3 py-2.5 w-full min-w-[200px] border text-sm rounded-lg
        ${disabled
                ? "bg-surface-300 text-typography-700 border-transparent  cursor-not-allowed"
                : "bg-transparent text-typography-700 border-blue-gray-200 cursor-pointer"
            }
      `}
    >
        <span>{value || label}</span>
        <CalendarIcon className={`w-4 h-4 text-typography-700`} />
    </button>
))

CustomInput.displayName = "CustomInput"

