export type CreateAuxiliaryCongregationPayload = {
  name: string
  number: string
  city: string
  circuit: string
  address?: string
  latitude?: string
  longitude?: string
  dayMeetingPublic: string,
  hourMeetingPublic: string
}

export type UpdateAuxiliaryCongregationPayload = Partial<CreateAuxiliaryCongregationPayload>