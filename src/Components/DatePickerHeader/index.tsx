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
        <div className="dp-header p-2">
            <div className="flex items-center justify-between gap-1.5">
                <button
                    className="p-1.5 rounded-lg text-primary-200 hover:bg-surface-100/80 dark:hover:bg-surface-300/40 transition-colors"
                    type="button"
                    onClick={decreaseMonth}
                    title="Mês anterior"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 justify-center flex-1">
                    <Dropdown
                        textVisible
                        title={months[date.getMonth()]}
                        selectedItem={months[date.getMonth()]}
                        position="left"
                        options={months}
                        handleClick={handleMonthChange}
                        maxHeight="max-h-48"
                        width="w-36"
                        buttonClassName="inline-flex items-center justify-between gap-1 rounded-lg bg-surface-100/70 hover:bg-surface-100 px-2.5 py-1 text-xs font-semibold text-typography-800 border border-surface-300/80 transition-all focus:outline-none"
                    />

                    <Dropdown
                        textVisible
                        title={date.getFullYear().toString()}
                        selectedItem={date.getFullYear().toString()}
                        options={years.map(y => y.toString())}
                        position="right"
                        handleClick={handleYearChange}
                        maxHeight="max-h-48"
                        width="w-24"
                        buttonClassName="inline-flex items-center justify-between gap-1 rounded-lg bg-surface-100/70 hover:bg-surface-100 px-2.5 py-1 text-xs font-semibold text-typography-800 border border-surface-300/80 transition-all focus:outline-none"
                    />
                </div>

                <button
                    className="p-1.5 rounded-lg text-primary-200 hover:bg-surface-100/80 dark:hover:bg-surface-300/40 transition-colors"
                    type="button"
                    onClick={increaseMonth}
                    title="Próximo mês"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
