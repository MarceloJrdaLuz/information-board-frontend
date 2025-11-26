import { CreateTerritoryHistoryArgs, DeleteTerritoryHistoryArgs, ITerritoryHistory, UpdateTerritoryHistoryArgs } from "@/types/territory"

export type FormValues = {
    caretaker: string
    work_type?: string
}

export interface ITerritoryHiistoryFormProps {
    territoryHistory: ITerritoryHistory | null, 
    onCreate?: (data: CreateTerritoryHistoryArgs) => Promise<void>,
    onUpdate?: (data: UpdateTerritoryHistoryArgs) => Promise<void>,
    onDelete?: (data: DeleteTerritoryHistoryArgs) => Promise<void>, 
}

