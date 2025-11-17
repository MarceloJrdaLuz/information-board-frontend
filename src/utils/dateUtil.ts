import moment from "moment"

export type DayMeetingPublic = "Sexta-feira" | "Sábado" | "Domingo"

export function getWeekendDays(
  monthOffset: number = 0,
  dayMeetingPublic: DayMeetingPublic = "Sábado"
): Date[] {
  const start = moment().startOf("month").add(monthOffset, "months")
  const end = start.clone().endOf("month")

  // Mapeia o nome do dia para o número usado pelo moment
  const dayOfWeekMap: Record<DayMeetingPublic, number> = {
    "Sexta-feira": 5,
    "Sábado": 6,
    "Domingo": 0,
  }

  const targetDay = dayOfWeekMap[dayMeetingPublic]
  const dates: Date[] = []

  // Encontra o primeiro dia correspondente no mês
  let current = start.clone().day(targetDay)

  // Se caiu antes do início do mês, pula para a próxima semana
  if (current.isBefore(start)) {
    current.add(7, "days")
  }

  while (current.isSameOrBefore(end)) {
    dates.push(current.startOf("day").toDate())
    current.add(7, "days")
  }

  return dates
}

// export function getRealDateForDestination(
//   destDay: DayMeetingPublic,
//   localDate: Date
// ) {
//   const base = moment(localDate)

//   const dayMap = {
//     "Sexta-feira": 5,
//     "Sábado": 6,
//     "Domingo": 7,
//   } as const

//   const destIso = dayMap[destDay]

//   // INÍCIO DO FIM DE SEMANA (sexta)
//   let weekendStart = base.clone().isoWeekday(5)

//   // Se a Sexta desse "week" já passou da data base, usamos ela
//   // Caso contrário, vamos para o próximo fim de semana
//   if (weekendStart.isBefore(base, "day")) {
//     weekendStart = weekendStart.add(1, "week")
//   }

//   // Agora weekendStart é a sexta do fim de semana CORRETO
//   return weekendStart.clone().isoWeekday(destIso)
// }


export function getWeekendRange(localMeetingDate: Date) {
  const base = moment(localMeetingDate);

  const sunday = base.clone().isoWeekday(7);
  const saturday = sunday.clone().subtract(1, "day");
  const friday = sunday.clone().subtract(2, "days");

  return {
    friday,
    saturday,
    sunday,
  };
}

// Corrige a data real do discurso na congregação de destino
export function getRealDateForDestination(
  destDay: DayMeetingPublic,
  localDate: Date
) {
  const weekend = getWeekendRange(localDate);

  const map = {
    "Sexta-feira": weekend.friday,
    "Sábado": weekend.saturday,
    "Domingo": weekend.sunday,
  };

  return map[destDay];
}
