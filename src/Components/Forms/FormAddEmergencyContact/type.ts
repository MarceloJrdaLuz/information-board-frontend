import { IEmergencyContact } from "@/entities/types"

export type FormValues = Omit<IEmergencyContact, 'id' | 'publisherIds'> 