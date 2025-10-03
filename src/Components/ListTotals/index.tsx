import { ITotalsReports } from "@/types/types"

interface IListTotalsProps {
    totals: ITotalsReports
}

export default function ListTotals({ totals }: IListTotalsProps) {
    return (
        <div className="p-4 my-5 w-11/12 m-auto bg-white">
            <h3 className="font-bold mb-2 text-lg">{totals.totalsFrom}</h3>
            <li className="text-gray-700">Numero de relatórios</li>
            <li className="mb-4 text-gray-900">{totals?.quantity}</li>
            {totals.hours && <li className="text-gray-700">Horas</li>}
            {totals.hours && <li className="mb-4 text-gray-900">{totals.hours}</li>}
            <li className="text-gray-700">Estudos bíblicos</li>
            <li className="mb-4 text-gray-900">{totals?.studies}</li>
        </div>
    )
}