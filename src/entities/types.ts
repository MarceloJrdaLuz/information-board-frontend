export interface ResponseAuth {
    user: {
        id: string,
        email: string
        code: string
        congregation: ICongregation
        created_at: string
        updated_at: string
        roles: RolesType[]
    },
    token: string
}

export interface RolesType extends PermissionType {

}

export interface UserTypes {
    email: string
    id: string
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
    dayMeetingLifeAndMinistary?: string ,
    hourMeetingLifeAndMinistary?:  string ,
    dayMeetingPublic?:  string ,
    hourMeetingPublic?:  string
}

export interface ICategory {
    id?: string
    name: string
    description: string
}

export enum MidweekDays {
    SEGUNDA = "Segunda-feira",
    TERCA = "Terça-feira",
    QUARTA = "Quarta-feira",
    QUINTA = "Quinta-feira",
    SEXTA = "Sexta-feira"
} 

export enum EndweekDays {
    SABADO = "Sábado",
    DOMINGO = "Domingo",
} 


