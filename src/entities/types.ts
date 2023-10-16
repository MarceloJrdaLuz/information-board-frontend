export interface ResponseAuth {
    user: {
        id: string,
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


export interface PermissionType {
    id: string,
    name: string,
    description: string,
    created_at: string,
    updated_at: string
}

export interface ICongregation {
    id?: string
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
    publications?: number,
    videos?: number,
    hours: number,
    revisits?: number,
    studies?: number,
    observations?: string
}

export interface IPublisher {
    id: string
    fullName: string,
    nickname?: string,
    privileges: string[]
    hope: Hope
    gender: Gender
    dateImmersed?: Date
    birthDate?: Date
    congregation: ICongregation
    group: IGroup
}

export interface IPublisherList {
    fullName: string
    nickname: string
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
    ANCIAO = "Ancião",
    SM = 'Servo Ministerial',
    PIONEIROAUXILIAR = 'Pioneiro Auxiliar',
    PIONEIROREGULAR = 'Pioneiro Regular',
    PIONEIROESPECIAL = 'Pioneiro Especial',
    AUXILIARINDETERMINADO = 'Auxiliar Indeterminado'
}

export interface IPublisherConsent {
    fullName: string,
    nickname: string,
    congregation_id: string
    congregation_number: string
}

export interface ConsentRecordTypes {
    id: string
    publisher: IPublisherConsent
    deviceId: string
    consentDate: string
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