import { IFieldServiceSchedule } from "@/types/fieldService"
import dayjs from "dayjs"

interface Props {
    schedules: IFieldServiceSchedule[]
}

export default function FieldServiceScheduleTable({ schedules }: Props) {
    return (
        <div className="bg-surface-100 rounded-md shadow overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b">
                        <th className="p-3 text-left">Data</th>
                        <th className="p-3 text-left">Dirigente</th>
                    </tr>
                </thead>
                <tbody>
                    {schedules.map(schedule => (
                        <tr key={schedule.id} className="border-b">
                            <td className="p-3">
                                {dayjs(schedule.date).format("DD/MM/YYYY")}
                            </td>
                            <td className="p-3">{schedule.leader.fullName}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
