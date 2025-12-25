export type CreateFieldServicePayload = {
      type: string,
      weekday: number,
      time: string,
      location: string,
      leader_id: string | null,
      rotation_members: string[]
}

export type UpdateFieldServicePayload = Partial<CreateFieldServicePayload>

export type GenerateFieldService = {
      startDate: string
      endDate: string
      mode: "append" | "reconcile"
}

export type CreateFieldServiceExceptionPayload = {
      date: string
      reason?: string
}
