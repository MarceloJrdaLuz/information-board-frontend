import { IHospitalityEventType } from "../hospitality"
import { ITalk } from "../types"

/* =========================
 * Base
 * ========================= */

export interface IBaseAssignment {
  date: string
  role: string
  status?: "confirmed" | "pending" | "canceled"
}

/* =========================
 * Limpeza do Salão
 * ========================= */

export interface ICleaningAssignment extends IBaseAssignment {
  role: "Limpeza do Salão"
}

/* =========================
 * Dirigente de Campo
 * ========================= */

export interface IFieldServiceAssignment extends IBaseAssignment {
  role: "Dirigente de Campo"
  fieldServiceLocation?: string
  fieldServiceHour?: string
}

/* =========================
 * Testemunho Público
 * ========================= */

export interface IPublicWitnessAssignment extends IBaseAssignment {
  role: "Testemunho Público"
  title?: string
  start_time?: string
  end_time?: string
  publishers?: {
    id: string
    name: string
  }[]
}

/* =========================
 * Meio de Semana
 * ========================= */

export interface IMidweekPartAssignment extends IBaseAssignment {
  role: "Meio de Semana" | "Ajudante (Meio de Semana)"
  title?: string
  room?: string
  partner?: string
  section?: "TREASURES" | "MINISTRY" | "LIVING"
  timeMinutes?: number
  partType?: string
}

/* =========================
 * Reunião no Salão
 * Presidente | Leitor | Orador
 * ========================= */

export interface IMeetingAssignment extends IBaseAssignment {
  role: "Presidente" | "Leitor" | "Orador"
  talk?: Omit<ITalk, "id">
  destinationCongregation?: {
    name: string
    city: string
  }
}

/* =========================
 * Discurso Externo
 * ========================= */

export interface IExternalTalkAssignment extends IBaseAssignment {
  role: "Discurso Externo"
  talk?: Omit<ITalk, "id">
  destinationCongregation: {
    name: string
    city: string
    address?: string
    latitude?: string
    longitude?: string
    dayMeetingPublic: string
    hourMeetingPublic: string
  }
}

/* =========================
 * Hospitalidade / Anfitrião
 * ========================= */

export interface IHospitalityAssignment extends IBaseAssignment {
  role: "Anfitrião" | "Hospitalidade"
  eventType: IHospitalityEventType
}

/* =========================
 * Reunião de Meio de Semana Gerais
 * ========================= */

export interface IMidweekGeneralAssignment extends IBaseAssignment {
  role: "Oração Inicial" | "Oração Final" | "Conselheiro" | "Dirigente do Estudo Bíblico" | "Leitor do Estudo Bíblico"
  title?: string
  room?: string
}

/* =========================
 * Union FINAL
 * ========================= */

export type IAssignment =
  | ICleaningAssignment
  | IFieldServiceAssignment
  | IPublicWitnessAssignment
  | IMeetingAssignment
  | IExternalTalkAssignment
  | IHospitalityAssignment
  | IMidweekGeneralAssignment
  | IMidweekPartAssignment

