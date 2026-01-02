import BreadCrumbs from "@/Components/BreadCrumbs"
import Button from "@/Components/Button"
import ContentDashboard from "@/Components/ContentDashboard"

import { getDatesForMonth } from "@/utils/publicWitnessDates"

import { useAtom, useSetAtom } from "jotai"
import { useRouter } from "next/router"
import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"

import {
  createSchedulePublicWitnessAtom,
  dirtyMonthScheduleAtom,
  monthScheduleAtom,
} from "@/atoms/publicWitnessAtoms.ts/schedules"
import { useArrangement, usePublicWitnessSchedules, usePublishers } from "@/hooks/useArrangements"

import { crumbsAtom } from "@/atoms/atom"
import DayScheduleCard from "@/Components/PublicWitnessSchedule/DayScheduleCard"
import { withProtectedLayout } from "@/utils/withProtectedLayout"

import { IPublicWitnessAssignment } from "@/Components/PublicWitnessSchedule/SlotScheduleRow"
import dayjs from "dayjs"
import "dayjs/locale/pt-br"
import { ChevronDown, ChevronUp } from "lucide-react"

dayjs.locale("pt-br")

function ArrangementMonthSchedulePage() {
  const router = useRouter()
  const { arrangement_id } = router.query as { arrangement_id: string }
  const [crumbs, setCrumbs] = useAtom(crumbsAtom)
  const setSchedule = useSetAtom(monthScheduleAtom)
  const createSchedule = useSetAtom(createSchedulePublicWitnessAtom)
  const [dirty] = useAtom(dirtyMonthScheduleAtom)

  const { data: arrangement } = useArrangement(arrangement_id || "")
  const { data: publishers } = usePublishers()

  const [showFilters, setShowFilters] = useState(true)
  const [monthOffset, setMonthOffset] = useState(0)

  const baseDate = dayjs().add(monthOffset, "month")
  const prevMonthLabel = baseDate.clone().subtract(1, "month").format("MMMM")
  const nextMonthLabel = baseDate.clone().add(1, "month").format("MMMM")

  /* ---------------- Breadcrumb ---------------- */
  useEffect(() => {
    setCrumbs(prev => [
      ...prev,
      {
        label: "Testemunho Público - Arranjos",
        link: "/congregacao/testemunho-publico",
      },
    ])
    return () => setCrumbs(prev => prev.slice(0, -1))
  }, [setCrumbs])

  /* ---------------- Reset do mês ---------------- */
  useEffect(() => setSchedule({}), [arrangement_id, monthOffset, setSchedule])

  /* ---------------- Datas do mês ---------------- */
  const dates = useMemo(() => {
    if (!arrangement) return []
    if (arrangement.is_fixed) {
      if (arrangement.weekday === undefined || arrangement.weekday === null) return []
      return getDatesForMonth(baseDate.month(), arrangement.weekday)
    }
    return arrangement.date ? [arrangement.date] : []
  }, [arrangement, baseDate])

  const start_date = dates[0] || ""
  const end_date = dates[dates.length - 1] || ""

  /* ---------------- Fetch schedules ---------------- */
  const { data: scheduleResponse } = usePublicWitnessSchedules({
    arrangement_id: arrangement?.id || "",
    start_date,
    end_date
  })

  /* ---------------- Organiza assignments por data e slot ---------------- */
  const assignmentsByDate = useMemo(() => {
    const map: Record<string, Record<string, IPublicWitnessAssignment>> = {}
    scheduleResponse?.schedule.forEach(day => {
      map[day.date] = {}
      day.assignments.forEach(assignment => {
        if (!map[day.date][assignment.time_slot_id]) {
          map[day.date][assignment.time_slot_id] = assignment
        }
      })
    })
    return map
  }, [scheduleResponse])

  /* ---------------- Salvar ---------------- */
  const handleSave = async () => {
    const payload = { schedule: Object.values(dirty) }
    if (!payload.schedule.length) {
      toast.info("Nenhuma alteração para salvar")
      return
    }
    try {
      await toast.promise(
        createSchedule(arrangement?.id || "", payload),
        { pending: "Salvando programação..." }
      )
    } catch (err) {
      console.error(err)
    }
  }

  /* ================= Render ================= */
  return (
    <ContentDashboard>
      <BreadCrumbs crumbs={crumbs} pageActive="Programação Mensal" />

      {!arrangement || !publishers ? null : (
        <section className="flex flex-col w-full p-5 gap-4">
          {/* Cabeçalho */}
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-primary-200">
              Programação mensal
            </h1>
            <span className="text-sm text-typography-600">
              Arranjo: <strong>{arrangement.title}</strong>
            </span>
          </div>

          {/* Navegação de mês */}
          {arrangement.is_fixed && (
              <div className="sticky top-0 z-30">
                <div className="md:hidden flex justify-center bg-surface-100 border-b shadow-sm p-2 w-10 ml-2 -mb-2 rounded-t-md">
                  <button
                    onClick={() => setShowFilters(o => !o)}
                    className="flex items-center gap-2 text-sm text-typography-600"
                  >
                    {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                <div
                  className={`
                    bg-surface-100  shadow-sm rounded-xl flex flex-col gap-4
                    transition-all duration-300 overflow-hidden
                    ${showFilters ? "max-h-screen p-4" : "max-h-0 p-0"}
                    md:max-h-screen md:p-4
                  `}
                >
                  <div className="flex justify-between gap-4">
                    <Button onClick={() => setMonthOffset(m => m - 1)} className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200">
                      {prevMonthLabel}
                    </Button>
                    <Button onClick={() => setMonthOffset(m => m + 1)} className="rounded-lg px-4 py-2 text-sm shadow capitalize text-typography-200">
                      {nextMonthLabel}
                    </Button>
                  </div>
                  <Button className="w-full text-typography-200" onClick={handleSave}>
                    Salvar todas
                  </Button>
                </div>
              </div>
          )}

          {/* Dias */}
          <div className="flex flex-col gap-4">
            {dates.length > 0 ? (
              dates.map(date => (
                <DayScheduleCard
                  key={date}
                  date={date} 
                  arrangement={arrangement}
                  publishers={publishers}
                  assignmentsBySlot={assignmentsByDate[date]}
                  exceptions={scheduleResponse?.exceptions}
                />
              ))
            ) : (
              <div>Nenhuma data disponível</div>
            )}
          </div>
        </section>
      )}
    </ContentDashboard>
  )
}

ArrangementMonthSchedulePage.getLayout = withProtectedLayout([
  "ADMIN_CONGREGATION",
  "FIELD_SERVICE_MANAGER",
])

export default ArrangementMonthSchedulePage
