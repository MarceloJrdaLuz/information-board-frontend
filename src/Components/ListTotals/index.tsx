import { ITotalsReports } from "@/types/types"
import { Award, BookOpen, Clock, Users } from "lucide-react"

interface IListTotalsProps {
    totals: ITotalsReports
}

export default function ListTotals({ totals }: IListTotalsProps) {
    return (
        <div className="bg-surface-100 border border-surface-300 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-surface-300 pb-3">
                <div className="p-2 rounded-lg bg-primary-200/10 text-primary-200">
                    <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-typography-900">{totals.totalsFrom}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-surface-200/50 rounded-xl border border-surface-300 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-xs text-typography-500 font-medium">
                        <Users className="w-4 h-4 text-primary-200" />
                        <span>Relatórios Entregues</span>
                    </div>
                    <span className="text-xl font-bold text-typography-900 mt-1">
                        {totals?.quantity || 0}
                    </span>
                </div>

                {totals.hours !== undefined && (
                    <div className="p-3 bg-surface-200/50 rounded-xl border border-surface-300 flex flex-col justify-between">
                        <div className="flex items-center gap-2 text-xs text-typography-500 font-medium">
                            <Clock className="w-4 h-4 text-primary-200" />
                            <span>Total de Horas</span>
                        </div>
                        <span className="text-xl font-bold text-typography-900 mt-1">
                            {totals.hours}h
                        </span>
                    </div>
                )}

                <div className="p-3 bg-surface-200/50 rounded-xl border border-surface-300 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-xs text-typography-500 font-medium">
                        <BookOpen className="w-4 h-4 text-primary-200" />
                        <span>Estudos Bíblicos</span>
                    </div>
                    <span className="text-xl font-bold text-typography-900 mt-1">
                        {totals?.studies || 0}
                    </span>
                </div>
            </div>
        </div>
    )
}