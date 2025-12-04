export type GenerateCleaningSchedulePayload = {
  start: string
  end: string
}

export type CreateCleningExceptionPayload = {
  date: string
  reason?: string
}

export type UpdateCleaningGroupPayload = Partial<CreateHospitalityGroupPayload>