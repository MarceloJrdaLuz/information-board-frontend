import { createContext, ReactNode, useContext } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { useSubmitContext } from "./SubmitFormContext"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"

type PermissionAndRolesContextTypes = {
    createPermission: (name: string, description: string) => Promise<any>
    createRole: (name: string, description: string, permissions: string[]) => Promise<any>
    userRoles: (user_id: string, roles: string[]) => Promise<any>
    deletePermission: (permission_id: string) => Promise<any>
    updatePermission: (permission_id: string, name?: string, description?: string) => Promise<any>
    updateRole: (role_id: string, name?: string, description?: string, permissions?: string[]) => Promise<any>
}

type PermissionAndRolesContextProviderProps = {
    children: ReactNode
}

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

const PermissionAndRolesContext = createContext({} as PermissionAndRolesContextTypes)

function PermissionAndRolesProvider(props: PermissionAndRolesContextProviderProps) {

    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    async function createPermission(name: string, description: string) {

        await api.post('/permission', {
            name,
            description
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.permissionCreate)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === 'Permission already exists') {
                handleSubmitError(messageErrorsSubmit.permissionAlreadyExists)
            } else {
                console.log(err)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    async function updatePermission(permission_id: string, name?: string, description?: string) {
        await api.put(`/permission/${permission_id}`, {
            name,
            description
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.permissionUpdate, '/permissoes')
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    async function deletePermission(permission_id: string) {
        api.delete(`/permission/${permission_id}`).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.permissionDelete)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(err)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }

    async function createRole(name: string, description: string, permissions: string[]) {
        api.post('role', {
            name,
            description,
            permissions
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.roleCreate)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            if (message === 'Role already exists') {
                handleSubmitError(messageErrorsSubmit.roleAlreadyExists)
            } else {
                toast.error(messageErrorsSubmit.default)
            }
        })
    }

    async function updateRole(role_id: string, name?: string, description?: string, permissions?: string[]) {
        await api.put(`/role/${role_id}`, {
            name,
            description,
            permissions
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.roleUpdate)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError(messageErrorsSubmit.default)
        })
    }

    async function userRoles(user_id: string, roles: string[]) {
        api.put('/user/roles', {
            user_id,
            roles
        }).then(res => {
            handleSubmitSuccess(messageSuccessSubmit.roleAddUser)
        }).catch(err => {
            const { response: { data: { message } } } = err
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                console.log(err)
                handleSubmitError(messageErrorsSubmit.default)
            }
        })
    }


    return (
        <PermissionAndRolesContext.Provider value={{
            createPermission, createRole, userRoles, deletePermission, updatePermission, updateRole
        }}>
            {props.children}
        </PermissionAndRolesContext.Provider>
    )
}

function usePermissionsAndRolesContext(): PermissionAndRolesContextTypes {
    const context = useContext(PermissionAndRolesContext);

    if (!context) {
        throw new Error("useFiles must be used within FileProvider");
    }

    return context;
}

export { PermissionAndRolesProvider, usePermissionsAndRolesContext, };