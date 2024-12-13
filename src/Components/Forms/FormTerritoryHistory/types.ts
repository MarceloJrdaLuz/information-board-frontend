import { ITerritoryHistory } from "@/entities/territory"

export type FormValues = {
    caretaker: string
    assignment_date:  Date | null ,
    completion_date?: Date | null ,
    work_type?: string
}

export interface ITerritoryHiistoryFormProps {
    territoryHistory: ITerritoryHistory | null, 
}
