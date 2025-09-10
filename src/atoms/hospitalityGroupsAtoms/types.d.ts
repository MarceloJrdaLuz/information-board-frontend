export type CreateHospitalityGroupPayload = {
  name: string
  publisherHost_id?: string
  next_reception?: string
  position?: number
  member_ids?: string[]
}

export type UpdateHospitalityGroupPayload = Partial<CreateHospitalityGroupPayload>