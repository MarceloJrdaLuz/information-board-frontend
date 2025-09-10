export type CreateTalkPayload = {
  number: number
  title: string
}

export type UpdateTalkPayload = Partial<CreateTalkPayload>