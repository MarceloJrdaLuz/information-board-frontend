export interface ResponseAuth {
    user: {
        id: string,
        email: string
        created_at: string
        updated_at: string
        roles: RolesType[]
    },
    token: string
}

export interface RolesType {
    id: string,
    name: string,
    description: string,
    created_at: string,
    updated_at: string
}