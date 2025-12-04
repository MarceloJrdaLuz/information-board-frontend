export type CreateCleaningGroupPayload = {
  name: string
  order: number
  publisherIds?: string[]
}

export type UpdateCleaningGroupPayload = Partial<CreateHospitalityGroupPayload>