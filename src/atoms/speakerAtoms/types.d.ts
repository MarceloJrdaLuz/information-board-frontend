export type CreateSpeakerPayload = {
  fullName: string
  phone?: string
  address?: string
  originCongregation_id: string
  publisher_id?: string
  talk_ids?: string[]
}

export type UpdateSpeakerPayload = Partial<CreateSpeakerPayload>