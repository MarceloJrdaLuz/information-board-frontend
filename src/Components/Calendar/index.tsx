import ptBR from 'date-fns/locale/pt-BR'; // Importe a localização para o português do Brasil
import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'; // Estilos padrão do DatePicker

registerLocale('pt-BR', ptBR)

interface CalendarProps {
    handleDateChange: (date: Date) => void
    selectedDate: Date | null
    minDate?: Date | null
    label: string
}

export default function Calendar({ handleDateChange, selectedDate, minDate, label }: CalendarProps) {


    return (
        <div>
            <h1 className='font-bold my-2 text-typography-900'>{label}</h1>
            <div>
                <DatePicker
                    locale="pt-BR"
                    className={` px-3 py-2.5 w-full text-sm
                    text-typography-900 appearance-none placeholder-transparent focus:outline-none  rounded-xl bg-transparent read-only:bg-typography-300 read-only:rounded-lg font-sans font-normal text-left border-[2px] border-blue-gray-200`}
                    selected={selectedDate}
                    onChange={handleDateChange}
                    dateFormat="dd/MM/yyyy" 
                    minDate={minDate} 
           
                />
            </div>
        </div>
    )
}
