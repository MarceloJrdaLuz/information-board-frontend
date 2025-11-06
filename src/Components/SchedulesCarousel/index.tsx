"use client"
import { IPublicSchedule } from "@/types/weekendSchedule"
import { ChevronLeft, ChevronRight } from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"
import { useEffect, useState } from "react"
import { HospitalityCard } from "../HospitalityCard"
moment.locale("pt-br")

export type ScheduleResponse = Record<string, IPublicSchedule[]>

export default function SchedulesCarousel({ schedules }: { schedules: ScheduleResponse }) {
  const months = Object.entries(schedules)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const currentMonthIndex = months.findIndex(([_, weeks]) =>
      weeks.some((w) => w.isCurrentWeek)
    )
    if (currentMonthIndex >= 0) {
      setActiveIndex(currentMonthIndex)
    }
  }, [schedules])

  return (
    <div className="relative w-full">
      {/* Botões de navegação */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}
          className="p-2 rounded-full bg-[#28456C] text-typography-100 shadow hover:bg-[#335784] transition"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-[#2a2b2b]">{months[activeIndex]?.[0]}</h2>
        <button
          onClick={() => setActiveIndex((i) => Math.min(i + 1, months.length - 1))}
          className="p-2 rounded-full bg-[#28456C] text-typography-100 shadow hover:bg-[#335784] transition"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slides */}
      {months.map(([month, items], index) => (
        <div key={month} className={index === activeIndex ? "block" : "hidden"}>
          <div className="grid gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-[#AEAAAA] shadow-md overflow-hidden"
              >
                {/* Header */}
                <div className="bg-[#28456C] text-typography-100 px-4 py-2 font-semibold uppercase">
                  {moment(item.date, "YYYY-MM-DD").format("dddd, DD/MM")}
                </div>

                {/* Evento Especial */}
                {item.specialName && (
                  <div className="bg-gradient-to-r from-[#28456C] to-[#730817] text-typography-100 px-4 py-2 text-center font-semibold text-sm flex items-center justify-center gap-2">
                    <span>{item.specialName}</span>
                  </div>
                )}

                <div className="p-4 space-y-4">
                  {/* Presidente */}
                  {item.chairman && (
                    <p className="text-sm text-typography-700">
                      Presidente: {item.chairman.name}
                    </p>
                  )}
                  {/* Discurso Público */}
                  {(item.talk || item.speaker) && (
                    <div>
                      <p className="text-[#28456C] font-bold text-sm mb-1">
                        DISCURSO PÚBLICO
                      </p>
                      {item.talk && (
                        <p className="font-medium text-typography-800">
                          {`${item.talk.number ? `${item.talk.number} - ${item.talk.title}` : `${item.talk.title}`}`}
                        </p>
                      )}
                      {item.speaker && (
                        <p className="text-typography-600 text-sm">
                          {item.speaker.name}
                          {item.speaker.congregation && (
                            <span className="block text-xs text-typography-500">
                              {item.speaker.congregation}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Estudo de A Sentinela */}
                  {(item.watchTowerStudyTitle || item.reader) && (
                    <div>
                      <p className="text-[#961526] font-bold text-sm mb-1">
                        ESTUDO DE A SENTINELA
                      </p>
                      {item.watchTowerStudyTitle && (
                        <p className="font-medium text-typography-800 italic">
                          {item.watchTowerStudyTitle}
                        </p>
                      )}
                      {item.reader && (
                        <p className="text-sm text-typography-700">
                          Leitor: {item.reader.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Semana Atual */}
                  {item.isCurrentWeek && (
                    <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-[#28456C] text-typography-100">
                      Semana Atual
                    </span>
                  )}
                </div>
                {item.externalTalks && item.externalTalks.length > 0 && (
                  <div className="mt-3 border-t m-6 border-typography-600">
                    <p className="font-semibold text-sm text-typography-700 my-2">Oradores que saem:</p>
                    <div className="flex justify-center space-y-2">
                      {item.externalTalks.map(ext => (
                        <div
                          key={ext.id}
                          className="flex gap-2 p-2 rounded-md"
                        >
                          <div className="text-sm text-typography-700">
                            <p className="font-medium">
                              {ext.speaker?.name}
                            </p>
                            <p className="text-typography-600">
                              {ext.talk?.number ? `${ext.talk.number} - ${ext.talk.title}` : ext.talk?.title}
                              {ext.destinationCongregation && (
                                <span className="italic text-typography-500"> ({ext.destinationCongregation})</span>
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {item.hospitality && item.hospitality.length > 0 && (
                  <HospitalityCard item={item} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
