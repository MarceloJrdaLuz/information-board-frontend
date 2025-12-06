export type CreateFamilyPayload = {
  name: string
  responsible_publisher_id?: string
  memberIds?: string[]
}

export type UpdateFamilyPayload = Partial<CreateHospitalityGroupPayload>