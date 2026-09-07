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
    allowedWeekday?: number
    error?: string | null
}

export default function Calendar({
    handleDateChange,
    selectedDate,
    minDate,
    label,
    titleHidden,
    disabled = false,
    full = false,
    allowedWeekday,
    error
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
            {!titleHidden && <label className="mb-2 text-xs font-semibold uppercase tracking-wider text-typography-600 block">{label}</label>}

            <DatePicker
                filterDate={(date: Date) => {
                    if (allowedWeekday === undefined) return true
                    return dayjs(date).day() === allowedWeekday
                }}
                wrapperClassName={full ? "w-full" : ""}
                disabled={disabled}
                locale="pt-BR"
                selected={parsedSelected}
                minDate={parsedMin ?? undefined}
                dateFormat="dd/MM/yyyy"
                onChange={(date: Date | null) => {
                    if (!date) {
                        handleDateChange(null)
                        return
                    }
                    const formatted = dayjs(date).format("YYYY-MM-DD")
                    handleDateChange(formatted)
                }}
                customInput={
                    <CustomInput
                        titleHidden={titleHidden}
                        label={label}
                        disabled={disabled}
                        error={error}
                    />
                }
                showMonthDropdown
                showYearDropdown
                dropdownMode="select"
                className="px-3.5 py-2.5 w-full text-sm text-typography-800 appearance-none placeholder-transparent focus:outline-none rounded-xl bg-surface-100 font-sans font-medium text-left border border-surface-300 focus:border-primary-200 focus:ring-2 focus:ring-primary-200/20 shadow-xs transition-all"
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

const CustomInput = forwardRef(({ value, onClick, label, disabled, error, titleHidden }: any, ref: any) => (
    <div className="w-full">
        <button
            type="button"
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            ref={ref}
            className={`flex items-center justify-between gap-3 px-4 py-2.5 w-full min-w-[200px] border text-sm rounded-xl font-medium shadow-xs transition-all ${
                disabled
                    ? "bg-surface-200/50 text-typography-400 border-surface-300 cursor-not-allowed opacity-60"
                    : error
                        ? "border-red-500 text-red-500 bg-surface-100 cursor-pointer focus:ring-2 focus:ring-red-500/20"
                        : "bg-surface-100 text-typography-800 border-surface-300 hover:border-primary-200/80 cursor-pointer focus:ring-2 focus:ring-primary-200/20"
            }`}
        >
            <span className={`${error ? "text-red-500" : value ? "text-typography-800 font-semibold" : "text-typography-500"}`}>{value || (titleHidden ? label : "Selecione uma data")}</span>
            <CalendarIcon className={`w-4 h-4 shrink-0 ${error ? "text-red-500" : "text-typography-400"}`} />
        </button>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
))

CustomInput.displayName = "CustomInput"


