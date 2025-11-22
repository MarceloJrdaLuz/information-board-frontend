import ptBR from 'date-fns/locale/pt-BR';
import { CalendarIcon } from 'lucide-react';
import { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'; // Estilos padrão do DatePicker
registerLocale('pt-BR', ptBR)
import moment from "moment";
import 'react-datepicker/dist/react-datepicker.css';
import { DatePickerHeader } from '../DatePickerHeader';

registerLocale('pt-BR', ptBR);

interface CalendarProps {
    handleDateChange: (date: string | null) => void;
    selectedDate: string | null;
    minDate?: string | null;
    label: string;
    titleHidden?: boolean
}

export default function Calendar({
    handleDateChange,
    selectedDate,
    minDate,
    label,
    titleHidden
}: CalendarProps) {

    // Converte string -> Date para exibir no DatePicker
    const parsedSelected = selectedDate
        ? moment(selectedDate, "YYYY-MM-DD").toDate()
        : null;

    const parsedMin = minDate
        ? moment(minDate, "YYYY-MM-DD").toDate()
        : null;

    return (
        <div>
            {!titleHidden && <h1 className="font-bold my-2 text-typography-700">{label}</h1>}

            <DatePicker

                customInput={<CustomInput label={label} />}
                locale="pt-BR"
                selected={parsedSelected}
                minDate={parsedMin}
                dateFormat="dd/MM/yyyy"
                onChange={(date: Date | null) => {
                    if (!date) {
                        handleDateChange(null);
                        return;
                    }
                    // Date -> "YYYY-MM-DD"
                    const formatted = moment(date).format("YYYY-MM-DD");
                    handleDateChange(formatted);
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
    );
}



const CustomInput = forwardRef(({ value, onClick, label }: any, ref: any) => (
    <button
        type="button"
        onClick={onClick}
        ref={ref}
        className="flex items-center justify-between gap-5 px-3 py-2.5 w-full min-w-[200px] text-sm text-typography-700 border-[1px] border-blue-gray-200 rounded-lg bg-transparent"
    >
        <span>{value || label}</span>
        <CalendarIcon className="w-4 h-4 text-typography-700" />
    </button>
));

CustomInput.displayName = "CustomInput";

