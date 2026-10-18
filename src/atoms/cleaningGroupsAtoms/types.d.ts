export type CreateCleaningGroupPayload = {
  name: string
  order: number
  dayPreference?: string
  publisherIds?: string[]
}

export type UpdateCleaningGroupPayload = Partial<CreateCleaningGroupPayload>