import { ChevronLeft, ChevronRight } from "lucide-react";
import Dropdown from "../Dropdown";

export function DatePickerHeader({
    date,
    decreaseMonth,
    increaseMonth,
    changeMonth,
    changeYear,
}: {
    date: Date;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    changeMonth: (month: number) => void;
    changeYear: (year: number) => void;
}) {
    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 150 }, (_, i) => currentYear - i);

    function handleMonthChange(month: string) {
        changeMonth(months.indexOf(month));
    }

    function handleYearChange(year: string) {
        changeYear(Number(year));
    }

    return (
        <div className="dp-header">
            <div className="flex justify-between items-center">
                <button className="text-primary-200" type="button" onClick={decreaseMonth}>
                    <ChevronLeft />
                </button>
                <span className="text-typography-700 font-semibold">{months[date.getMonth()]} {date.getFullYear()}</span>
                <button className="text-primary-200" type="button" onClick={increaseMonth}>
                    <ChevronRight />
                </button>
            </div>

            <Dropdown
                textVisible
                title={months[date.getMonth()]}
                selectedItem={months[date.getMonth()]}
                position="left"
                options={months}
                handleClick={handleMonthChange}
            />


            <Dropdown
                textVisible
                title={date.getFullYear().toString()}
                selectedItem={date.getFullYear().toString()}
                options={years.map(y => y.toString())}
                position="right"
                handleClick={handleYearChange}
            />

        </div>
    );
}
