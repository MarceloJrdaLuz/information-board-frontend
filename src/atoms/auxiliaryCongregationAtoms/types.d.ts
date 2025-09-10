export type CreateAuxiliaryCongregationPayload = {
  name: string
  number: string
  city: string
  circuit: string
  dayMeetingPublic: string,
  hourMeetingPublic: string
}

export type UpdateAuxiliaryCongregationPayload = Partial<CreateAuxiliaryCongregationPayload>