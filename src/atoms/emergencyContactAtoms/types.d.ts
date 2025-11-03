export type CreateEmergencyContactPayload = {
  name: string,
  phone: string,
  relationship: string,
  isTj: boolean,
  congregation_id: string
}

export type UpdateEmergencyContactPayload = Partial<CreateEmergencyContactPayload>