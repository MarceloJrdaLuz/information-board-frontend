import dayjs from "dayjs";
import { ICleaningScheduleResponse } from "@/types/cleaning";

interface Props {
    schedule: ICleaningScheduleResponse;
}

export default function CleaningScheduleTable({ schedule }: Props) {
    return (
        <div className="w-full rounded-xl shadow bg-surface-100 p-4">
            <h3 className="font-semibold text-lg mb-3 text-typography-700">Programação da Limpeza</h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {schedule.schedules.map((item) => {
                    // const nameCount: Record<string, number> = {};

                    // const publishers = item.group.publishers.map(pub => {
                    //     const firstName = pub.fullName?.split(" ")[0];
                    //     if (nameCount[firstName]) {
                    //         nameCount[firstName]++;
                    //         return pub.nickname || pub.fullName;
                    //     } else {
                    //         nameCount[firstName] = 1;
                    //         return firstName;
                    //     }
                    // }).filter(Boolean);;

                    return (
                        <div
                            key={item.date}
                            className="border border-typography-200 rounded-lg p-3 bg-surface-100 hover:bg-surface-200 text-primary-200 transition"
                        >
                            <p className="font-semibold text-sm">
                                {dayjs(item.date).format("DD/MM/YYYY")}
                            </p>
                            <p className="mt-2 text-typography-700 text-sm leading-relaxed">
                                <span className="font-semibold">Grupo:</span> {item.group.name}
                            </p>

                            <p className="mt-1 text-typography-700 text-sm">
                                <span className="font-semibold">Responsáveis:</span><br />
                                {item.group.publishers
                                    .map(pub => {
                                        if (!pub) return "";
                                        return (pub.nickname?.trim() || pub.fullName?.trim() || "");
                                    })
                                    .filter(Boolean)
                                    .join(" – ")}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
