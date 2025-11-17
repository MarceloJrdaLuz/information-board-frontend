export type FormPermission = {
    name: string,
    description: string,
}

export type FormRole = {
    name: string,
    description: string,
    permissions: string[]
}

export type FormUserRoles = {
    userId: string,
    roles: string[]
}
