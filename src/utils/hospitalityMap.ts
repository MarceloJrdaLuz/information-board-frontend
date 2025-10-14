import { IHospitalityEventType } from "@/types/hospitality";

export const hospitalityMap: Record<IHospitalityEventType, string> = {
   [IHospitalityEventType.HOSTING]: "🏡 Hospedagem",
  [IHospitalityEventType.LUNCH]: "🥗 Almoço",
  [IHospitalityEventType.DINNER]: "🍽️ Jantar",
}