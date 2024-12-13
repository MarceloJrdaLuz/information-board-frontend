export type CreateTerritoryArgs = {
    name: string
    description?: string
}

export type UpdateTerritoryArgs = {
    territory_id: string
    name: string
    description?: string
}

export type DeleteTerritoryArgs = {
    territory_id: string
}

export interface ITerritory {
    id: string
    name: string
    description: string
    image_url: string
}

export interface ITerritoryHistory {
    id: string,
    caretaker: string,
    work_type: string,
    assignment_date: Date,
    completion_date?: Date
}

export type CreateTerritoryHistoryArgs = {
    territory_id: string,
    caretaker: string,
    work_type?: string,
    assignment_date: Date | null,
    completion_date?: Date | null
}

export type UpdateTerritoryHistoryArgs = CreateTerritoryHistoryArgs  & {territoryHistory_id}