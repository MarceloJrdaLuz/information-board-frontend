export type CreateTerritoryArgs = {
    name: string
    number: number
    description?: string
}

export type UpdateTerritoryArgs = {
    territory_id: string
    name: string
    number: number
    description?: string
}

export type DeleteTerritoryArgs = {
    territory_id: string
}

export type DeleteTerritoryHistoryArgs = {
    territoryHistory_id: string
    territory_id: string
}

export interface ITerritory {
    id: string
    name: string
    number: number
    description: string
    image_url: string
}

export interface ITerritoryHistory {
    id: string,
    caretaker: string,
    work_type: string,
    assignment_date: string,
    completion_date?: string
    territory: ITerritory
}

export interface ITerritoryWithHistories extends ITerritory {
    histories: Omit<ITerritoryHistory, "territory">[] 
    last_completion_date: string | null 
}

export type CreateTerritoryHistoryArgs = {
    territory_id: string,
    caretaker: string,
    work_type?: string,
    assignment_date: string | null,
    completion_date?: string | null
}

export type UpdateTerritoryHistoryArgs = CreateTerritoryHistoryArgs  & {territoryHistory_id}

export type IFieldConductors = IPublisher