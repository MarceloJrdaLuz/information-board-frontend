import { ITerritoryHistory } from "@/entities/territory"

export type FormValues = {
    caretaker: string
    assignment_date:  string | null ,
    completion_date?: string | null ,
    work_type?: string
}

export interface ITerritoryHiistoryFormProps {
    territoryHistory: ITerritoryHistory | null, 
}
