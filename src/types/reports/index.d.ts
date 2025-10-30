export interface IPayloadCreateReport {
    month: string,
    year: string,
    publisher_id: string,
    hours: number,
    studies: number,
    observations: string
}

export interface IPayloadCreateReportManually {
    month: string,
    year: string,
    publisher: {
        id: string
        privileges: string[]
    },
    hours: number,
    studies: number,
    observations: string
}