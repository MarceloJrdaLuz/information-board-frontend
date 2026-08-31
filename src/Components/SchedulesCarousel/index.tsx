"use client"

import { IPublicSchedule } from "@/types/weekendSchedule"
import { formatNameCongregation } from "@/utils/formatCongregationName"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
import { BookOpen, Calendar, ChevronLeft, ChevronRight, MapPin, Mic, Send, Sparkles, User, Users } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { HospitalityCard } from "../HospitalityCard"

dayjs.extend(isoWeek)
dayjs.extend(isBetween)
dayjs.locale("pt-br")

export type ScheduleResponse = Record<string, IPublicSchedule[]>

export default function SchedulesCarousel({ schedules }: { schedules: ScheduleResponse }) {
  // Filtra para exibir apenas semanas atuais e futuras (excluindo semanas passadas)
  const months = useMemo(() => {
    const startOfCurrentWeek = dayjs().startOf("week")
    return Object.entries(schedules || {})
      .map(([monthKey, weeks]) => {
        const filteredWeeks = (weeks || []).filter((week) => {
          const itemDate = dayjs(week.date)
          return (
            week.isCurrentWeek ||
            itemDate.isSame(dayjs(), "week") ||
            itemDate.isAfter(startOfCurrentWeek)
          )
        })
        return [monthKey, filteredWeeks] as [string, IPublicSchedule[]]
      })
      .filter(([_, weeks]) => weeks.length > 0)
  }, [schedules])

  const [activeMonthIndex, setActiveMonthIndex] = useState(0)
  const [activeWeekIndex, setActiveWeekIndex] = useState(0)

  useEffect(() => {
    const currentMonthIndex = months.findIndex(([_, weeks]) =>
      weeks.some((w) => w.isCurrentWeek)
    )
    const idx = currentMonthIndex >= 0 ? currentMonthIndex : 0
    setActiveMonthIndex(idx)
    // Abre direto na semana atual dentro do mês
    const currentWeekIdx = (months[idx]?.[1] || []).findIndex((w) => w.isCurrentWeek)
    setActiveWeekIndex(currentWeekIdx >= 0 ? currentWeekIdx : 0)
  }, [months])

  const handleMonthChange = (newMonthIdx: number) => {
    setActiveMonthIndex(newMonthIdx)
    setActiveWeekIndex(0)
  }

  if (months.length === 0) return null

  const currentMonthEntry = months[activeMonthIndex]
  const currentWeeks = currentMonthEntry?.[1] || []

  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* 1. Navegação de Meses (Card Superior Separado) */}
      <div className="flex justify-between items-center bg-surface-100 p-3 rounded-2xl border border-surface-300 shadow-sm">
        <button
          disabled={activeMonthIndex === 0}
          onClick={() => handleMonthChange(Math.max(activeMonthIndex - 1, 0))}
          className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
          title="Mês anterior"
        >
          <ChevronLeft size={24} />
        </button>

        <h2 className="text-base sm:text-lg font-extrabold text-typography-900 capitalize tracking-tight flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary-200" />
          <span>
            {(() => {
              const firstItem = currentWeeks[0]
              if (firstItem?.date) {
                return dayjs(firstItem.date).format("MMMM YYYY")
              }
              return currentMonthEntry?.[0] || "Programação"
            })()}
          </span>
        </h2>

        <button
          disabled={activeMonthIndex === months.length - 1}
          onClick={() => handleMonthChange(Math.min(activeMonthIndex + 1, months.length - 1))}
          className="disabled:opacity-30 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer"
          title="Próximo mês"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* 2. Navegação de Semanas (Pílulas com datas) */}
      {currentWeeks.length > 1 && (
        <div className="flex items-center justify-between gap-2">
          <button
            disabled={activeWeekIndex === 0}
            onClick={() => setActiveWeekIndex((i) => Math.max(i - 1, 0))}
            className="disabled:opacity-20 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer shrink-0"
            title="Semana anterior"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Indicadores de semana com datas */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {currentWeeks.map((w, idx) => {
              const isActive = idx === activeWeekIndex
              const date = dayjs(w.date).format("DD/MM")
              return (
                <button
                  key={w.id || idx}
                  onClick={() => setActiveWeekIndex(idx)}
                  title={`Reunião de ${dayjs(w.date).format("dddd, DD/MM")}`}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary-200 text-white shadow-sm"
                      : "bg-surface-200 text-typography-600 hover:bg-surface-300"
                  }`}
                >
                  {w.isCurrentWeek && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive ? "bg-emerald-300" : "bg-emerald-500"
                      }`}
                    />
                  )}
                  {date}
                </button>
              )
            })}
          </div>

          <button
            disabled={activeWeekIndex === currentWeeks.length - 1}
            onClick={() => setActiveWeekIndex((i) => Math.min(i + 1, currentWeeks.length - 1))}
            className="disabled:opacity-20 disabled:cursor-not-allowed p-2 rounded-xl text-primary-200 hover:bg-surface-200 transition cursor-pointer shrink-0"
            title="Próxima semana"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* 3. Card da Semana Ativa */}
      {currentWeeks.map((item, idx) => {
        if (idx !== activeWeekIndex) return null

        const date = dayjs(item.date)
        const formattedDate = date.format("dddd, DD [de] MMMM")

        // Sexta (5) até Domingo (7) da mesma semana ISO para oradores externos
        const weekendStart = date.isoWeekday(5)
        const weekendEnd = date.isoWeekday(7)
        const filteredExternalTalks = (item.externalTalks || []).filter((ext) =>
          dayjs(ext.date).isBetween(weekendStart, weekendEnd, "day", "[]")
        )

        return (
          <div
            key={item.id || idx}
            className="bg-surface-100 border border-surface-300 rounded-2xl shadow-sm overflow-hidden flex flex-col"
          >
            {/* Header da Semana */}
            <div className="bg-surface-200/80 px-4 py-3.5 border-b border-surface-300 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-typography-900 capitalize">
                  {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.isCurrentWeek && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Semana Atual
                  </span>
                )}
                {item.specialName && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/20">
                    <Sparkles size={12} />
                    {item.specialName}
                  </span>
                )}
              </div>
            </div>

            {/* Conteúdo Principal da Reunião */}
            <div className="p-4 sm:p-5 flex flex-col gap-4">
              {/* Presidente da Reunião */}
              {item.chairman?.name && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-200/50 border border-surface-300 text-sm">
                  <div className="w-7 h-7 rounded-lg bg-primary-200/10 text-primary-200 flex items-center justify-center shrink-0">
                    <User size={15} />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-typography-500 uppercase tracking-wider">
                      Presidente:
                    </span>
                    <span className="font-semibold text-typography-900">{item.chairman.name}</span>
                  </div>
                </div>
              )}

              {/* Seção do Discurso Público */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 overflow-hidden">
                <div className="px-4 py-2.5 bg-blue-500/10 border-b border-blue-500/20 flex items-center gap-2">
                  <Mic size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                    Discurso Público
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {item.talk ? (
                    <h3 className="font-bold text-sm sm:text-base text-typography-900 leading-snug">
                      {item.talk.number ? `Nº ${item.talk.number} - ${item.talk.title}` : item.talk.title}
                    </h3>
                  ) : (
                    <span className="text-xs italic text-typography-400">Tema não informado</span>
                  )}

                  {item.speaker && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-typography-700 mt-1 pt-2 border-t border-blue-500/10">
                      <span className="font-bold text-typography-500">Orador:</span>
                      <span className="font-semibold text-typography-900">{item.speaker.name}</span>
                      {item.speaker.congregation && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-typography-500 bg-surface-200 px-2 py-0.5 rounded-md">
                          <MapPin size={11} />
                          {item.speaker.congregation}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Seção de Estudo de A Sentinela */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 overflow-hidden">
                <div className="px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/20 flex items-center gap-2">
                  <BookOpen size={16} className="text-rose-600 dark:text-rose-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                    Estudo de A Sentinela
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-2">
                  {item.watchTowerStudyTitle ? (
                    <h3 className="font-bold text-sm sm:text-base text-typography-900 leading-snug italic">
                      {item.watchTowerStudyTitle}
                    </h3>
                  ) : (
                    <span className="text-xs italic text-typography-400">Artigo não informado</span>
                  )}

                  {item.reader?.name && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-typography-700 mt-1 pt-2 border-t border-rose-500/10">
                      <span className="font-bold text-typography-500">Leitor:</span>
                      <span className="font-semibold text-typography-900">{item.reader.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Oradores que Saem da Congregação */}
              {filteredExternalTalks.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                  <div className="px-4 py-2.5 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
                    <Send size={15} className="text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                      Oradores que Saem
                    </span>
                  </div>
                  <div className="p-3.5 flex flex-col gap-2.5 divide-y divide-amber-500/10">
                    {filteredExternalTalks.map((ext) => (
                      <div key={ext.id} className="pt-2 first:pt-0 flex flex-col gap-1 text-xs sm:text-sm">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-typography-900">{ext.speaker?.name}</span>
                          {ext.destinationCongregation && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md font-medium">
                              <MapPin size={11} />
                              {formatNameCongregation(
                                ext.destinationCongregation.name,
                                ext.destinationCongregation.city
                              )}
                            </span>
                          )}
                        </div>
                        <span className="text-typography-600 text-xs">
                          {ext.talk?.number
                            ? `Nº ${ext.talk.number} - ${ext.talk.title}`
                            : ext.talk?.title || ext.manualTalk || "Tema a definir"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hospitalidade */}
              {item.hospitality && item.hospitality.length > 0 && (
                <HospitalityCard item={item} />
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}