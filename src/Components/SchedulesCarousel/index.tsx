"use client"

import { IPublicSchedule } from "@/types/weekendSchedule"
import { formatNameCongregation } from "@/utils/formatCongregationName"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import isBetween from "dayjs/plugin/isBetween"
import isoWeek from "dayjs/plugin/isoWeek"
import { BookOpen, Calendar, ChevronLeft, ChevronRight, ChevronUp, MapPin, Mic, Send, Sparkles, Users, Utensils } from "lucide-react"
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
            className="rounded-2xl border border-surface-300 shadow-sm overflow-hidden bg-surface-100 flex flex-col"
          >
            {/* Cabeçalho da Semana com Tarja Azul (#28456C) */}
            <div className="bg-[#28456C] text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-200">
                    {formattedDate}
                  </span>
                  {item.isCurrentWeek && (
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white uppercase tracking-wider shadow-xs shrink-0 self-center">
                      Semana Atual
                    </span>
                  )}
                </div>
                <h3 className="text-base sm:text-xl font-black tracking-tight text-white mt-0.5">
                  Reunião Pública e Sentinela
                </h3>
              </div>

              {/* Presidente da Reunião no mesmo estilo do meio de semana */}
              {item.chairman?.name && (
                <div className="bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs flex items-center gap-2 self-start sm:self-auto border border-white/10">
                  <Users className="h-4 w-4 text-blue-200" />
                  <div className="flex flex-col text-xs">
                    <span className="text-[10px] text-blue-200 font-semibold uppercase tracking-wider">
                      Presidente
                    </span>
                    <span className="font-bold text-white">{item.chairman.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Tarja de Evento Especial (se houver) */}
            {item.specialName && (
              <div className="bg-gradient-to-r from-[#28456C] to-[#730817] text-typography-100 px-4 py-2.5 text-center font-semibold text-sm flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span>{item.specialName}</span>
              </div>
            )}

            {/* CORPO DO CARD COM AS 3 SEÇÕES DEFINIDAS */}
            <div className="p-4 sm:p-6 flex flex-col gap-6 divide-y divide-surface-300">
              {/* SEÇÃO 1: DISCURSO PÚBLICO (Azul Tesouros #2F7682 com ícone de Microfone) */}
              <div className="pt-1 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#2F7682] text-white shadow-2xs">
                  <Mic className="h-5 w-5" size={20} />
                  <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Discurso Público
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2">
                  <div className="flex flex-col max-w-xl">
                    <span className="font-bold text-xs sm:text-sm text-[#205B6F] dark:text-[#38BDF8]">
                      {item.talk
                        ? item.talk.number
                          ? `Nº ${item.talk.number} - ${item.talk.title}`
                          : item.talk.title
                        : "Discurso Público"}
                    </span>
                    {item.speaker?.congregation && (
                      <span className="text-xs text-typography-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-typography-400 shrink-0" />
                        Congregação {item.speaker.congregation}
                      </span>
                    )}
                  </div>

                  {item.speaker?.name && (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-surface-100 dark:bg-surface-300/50 px-3 py-1.5 rounded-lg border border-surface-300 shadow-2xs shrink-0">
                      <span className="text-[11px] text-typography-500 font-semibold uppercase">
                        Orador:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-typography-900">
                        {item.speaker.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 2: ESTUDO DE A SENTINELA (Vermelho Vida Cristã #961526 com ícone de Livro/Sentinela) */}
              <div className="pt-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#961526] text-white shadow-2xs">
                  <BookOpen className="h-5 w-5" size={20} />
                  <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Estudo de A Sentinela
                  </h4>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 gap-2">
                  <div className="flex flex-col max-w-xl">
                    <span className="font-bold text-xs sm:text-sm text-[#961526] dark:text-rose-400 italic">
                      {item.watchTowerStudyTitle || "Artigo de Estudo de A Sentinela"}
                    </span>
                  </div>

                  {item.reader?.name && (
                    <div className="flex items-center gap-1.5 self-start sm:self-auto bg-surface-100 dark:bg-surface-300/50 px-3 py-1.5 rounded-lg border border-surface-300 shadow-2xs shrink-0">
                      <span className="text-[11px] text-typography-500 font-semibold uppercase">
                        Leitor:
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-typography-900">
                        {item.reader.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* SEÇÃO 3: HOSPITALIDADE E ARRANJOS (Amarelo/Dourado #C28100 com ícone de Utensils) */}
              {(filteredExternalTalks.length > 0 ||
                (item.hospitality && item.hospitality.length > 0)) && (
                <div className="pt-5 flex flex-col gap-3">
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#C28100] text-white shadow-2xs">
                    <Utensils className="h-5 w-5" size={20} />
                    <h4 className="font-bold text-xs sm:text-sm uppercase tracking-wider">
                      Hospitalidade e Arranjos
                    </h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Oradores que Saem */}
                    {filteredExternalTalks.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-surface-200/40 border border-surface-300/70 flex flex-col gap-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C28100] dark:text-amber-400">
                          <Send size={14} />
                          <span>Oradores que Saem da Congregação</span>
                        </div>
                        <div className="flex flex-col gap-2 divide-y divide-surface-300/60">
                          {filteredExternalTalks.map((ext) => (
                            <div
                              key={ext.id}
                              className="pt-2 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm"
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-typography-900">
                                  {ext.speaker?.name}
                                </span>
                                <span className="text-typography-600 text-xs">
                                  {ext.talk?.number
                                    ? `Nº ${ext.talk.number} - ${ext.talk.title}`
                                    : ext.talk?.title || ext.manualTalk || "Tema a definir"}
                                </span>
                              </div>
                              {ext.destinationCongregation && (
                                <span className="inline-flex items-center gap-1 text-xs text-typography-600 bg-surface-100 dark:bg-surface-300/50 px-2.5 py-1 rounded-lg border border-surface-300 shrink-0 font-medium self-start sm:self-auto">
                                  <MapPin size={12} className="text-typography-400" />
                                  {formatNameCongregation(
                                    ext.destinationCongregation.name,
                                    ext.destinationCongregation.city
                                  )}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cards de Hospitalidade (Sempre abertos) */}
                    {item.hospitality && item.hospitality.length > 0 && (
                      <HospitalityCard item={item} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}