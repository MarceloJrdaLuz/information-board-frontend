export interface ResponseAuth {
    user: {
        id: string
        email: string
        fullName: string
        code: string
        congregation: ICongregation
        created_at: string
        updated_at: string
        profile: Profile | null
        roles: RolesType[]
    },
    token: string
}

export interface Profile {
    id: string
    avatar_bucket_key: string
    avatar_url: string
}

export interface RolesType extends PermissionType {
    permissions: PermissionType[]
}

export interface UserTypes {
    id: string
    email: string
    fullName: string
    code: string
    congregation: ICongregation
    roles: RolesType[]
    profile: Profile | null
}


export enum Gender {
    Masculino = "Masculino",
    Feminino = "Feminino",
}

export enum Hope {
    Ungido = "Ungido",
    OutrasOvelhas = "Outras ovelhas"
}

export enum Situation {
    ATIVO = "Ativo",
    INATIVO = "Inativo",
    REMOVIDO = "Removido",
    DESASSOCIADO = "Desassociado"
}


export interface PermissionType {
    id: string,
    name: string,
    description: string,
    created_at: string,
    updated_at: string
}
export interface IHospitalityGroup {
    id: string
    name: string
    congregation: ICongregation
    host: IPublisher | null
    next_reception: string | null
    position: number | null
    members: IPublisher[]
}

export interface ICongregation {
    id: string
    name: string
    number?: string
    city: string
    circuit: string
    image_url?: string
    imageKey?: string
    dayMeetingLifeAndMinistary?: string,
    hourMeetingLifeAndMinistary?: string,
    dayMeetingPublic?: string,
    hourMeetingPublic?: string
    type?: CongregationTypeEnum
    creatorCongregation?: ICongregation
    speakers?: ISpeaker[]
}

export interface ICongregationUpdate {
    name?: string
    city?: string
    circuit?: string
    image_url?: string
    imageKey?: string
    dayMeetingLifeAndMinistary?: string,
    hourMeetingLifeAndMinistary?: string,
    dayMeetingPublic?: string,
    hourMeetingPublic?: string
}



export interface IGroup {
    id: string
    name: string
    number: string
    groupOverseers: IGroupOverseers

}
export interface IGroupOverseers extends IPublisher {

}

export interface IReports {
    id: string
    month: string
    year: string,
    publisher: IPublisher,
    privileges: string[]
    hours: number,
    studies?: number,
    observations?: string
}

export interface IMonthsWithYear {
    year: string,
    months: string[],
    totalHours: number
}

export interface ITotalsReportsCreate {
    month: string
    year: string
    quantity: number
    hours?: number
    studies?: number
    privileges: string
}

export interface IUpdateReport {
    report_id: string
    privileges: string[]
}

export interface IPublisher {
    id: string
    fullName: string
    nickname?: string
    privileges: string[]
    pioneerMonths?: string[]
    hope: Hope
    gender: Gender
    dateImmersed?: Date
    startPioneer?: Date
    birthDate?: Date
    congregation: ICongregation
    group: IGroup
    situation: Situation
    address?: string
    phone?: string
    emergencyContact?: IEmergencyContact
    user?: UserTypes
    hospitalityGroup?: IHospitalityGroup
}

export interface IPublisherList {
    id: string
    fullName: string
    nickname?: string
    congregation_id: string
    congregation_number: string
    consentDate?: string
    deviceId?: string
}

export interface ICategory {
    id: string
    name: string
    description: string
}

export interface IDocument {
    id: string
    category: ICategory
    fileName: string
    size: string
    key: string
    url: string
}

export interface IFile {
    id: string
    name: string
    category?: ICategory
    readableSize: string
    uploaded?: boolean
    preview: string
    file: File | null
    progress?: number
    error?: boolean
    url: string
}

export enum MidweekDays {
    SEGUNDA = "Segunda-feira",
    TERCA = "Terça-feira",
    QUARTA = "Quarta-feira",
    QUINTA = "Quinta-feira",
    SEXTA = "Sexta-feira"
}

export enum CongregationTypeEnum {
    SYSTEM = "system",
    AUXILIARY = "auxiliary",
}

export enum EndweekDays {
    SEXTA = "Sexta-feira",
    SABADO = "Sábado",
    DOMINGO = "Domingo",
}

export enum Categories {
    limpeza = 'Limpeza',
    meioDeSemana = 'Reunião do meio de semana',
    fimDeSemana = 'Reunião do fim de semana',
    campo = 'Campo',
    financeiro = 'Financeiro',
    eventos = 'Eventos especiais',
    testemunhoPublico = 'Testemunho público',
    saidasDeCampo = 'Saídas de campo'
}

export enum Privileges {
    PUBLICADOR = "Publicador",
    ANCIAO = "Ancião",
    SM = 'Servo Ministerial',
    PIONEIROAUXILIAR = 'Pioneiro Auxiliar',
    PIONEIROREGULAR = 'Pioneiro Regular',
    PIONEIROESPECIAL = 'Pioneiro Especial',
    AUXILIARINDETERMINADO = 'Auxiliar Indeterminado',
    MISSIONARIOEMCAMPO = 'Missionário em Campo',
    ORADOR = "Orador",
    LEITOR = "Leitor",
    PRESIDENTE = "Presidente",
    INDICADOR = "Indicador",
    MICROFONEVOLANTE = "Microfone Volante"
}

export enum PrivilegesMinistry {
    PUBLICADOR = "Publicador",
    PIONEIROAUXILIAR = 'Pioneiro Auxiliar',
    PIONEIROREGULAR = 'Pioneiro Regular',
    PIONEIROESPECIAL = 'Pioneiro Especial',
    MISSIONARIOEMCAMPO = 'Missionário em Campo'
}

export enum WORKTYPESTERRITORY {
    NORMAL = "Padrão",
    VISITA = "Visita",
    CELEBRACAO = 'Celebração',
    CONGRESSO = 'Congresso',
    OUTRA = 'Outra',
}

export enum TotalsFrom {
    PUBLICADORES = "Publicadores",
    PIONEIROSREGULARES = "Pioneiros regulares",
    PIONEIROSAUXILIARES = "Pioneiros auxiliares",
    ESPECIAISEMISSIONARIOS = 'Pioneiros especiais e Missionários em campo',
}

export interface IPublisherConsent {
    id: string,
    fullName: string,
    nickname?: string,
    congregation_id: string
    congregation_number: string
}


export interface CongregationTypes {
    id: string
    name: string
    number: string
    city: string
    circuit: string
    imageUrl: string
    dayMeetingLifeAndMinistary: string
    hourMeetingLifeAndMinistary: string,
    dayMeetingPublic: string
    hourMeetingPublic: string
}

export interface INotice {
    id: string
    title: string
    text: string
    startDay?: number
    endDay?: number
    expired?: Date
}

export interface IPermission {
    id: string
    name: string
    description: string
}

export interface IRole {
    id: string
    name: string
    description: string
    permissions: IPermission[]
}

export interface ITotalsReports {
    month: string
    year: string
    publishersActives: number
    privileges?: string[]
    totalsFrom: string
    quantity: number
    hours?: number
    studies?: number
}

export interface IMeetingAssistance {
    id: string
    month: string
    year: string
    midWeek: string[]
    midWeekTotal: number
    midWeekAverage: number
    endWeek: string[]
    endWeekTotal: number
    endWeekAverage: number
}

export interface IEmergencyContact {
    id: string
    name: string
    phone: string
    relationship: string
    isTj: boolean
}
export interface ILinkPublisherToUser {
    user_id: string
    publisher_id: string
    force?: boolean

}
export interface IUnlinkPublisherToUser {
    publisher_id: string
}

export interface ITalk {
    id: string
    number: number
    title: string
}

export interface ISpeaker {
    id: string
    fullName: string
    phone?: string
    address?: string
    originCongregation: ICongregation
    publisher?: IPublisher
    talks?: ITalk[]
}

