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
 * Union FINAL
 * ========================= */

export type IAssignment =
  | ICleaningAssignment
  | IFieldServiceAssignment
  | IPublicWitnessAssignment
  | IMeetingAssignment
  | IExternalTalkAssignment
  | IHospitalityAssignment
