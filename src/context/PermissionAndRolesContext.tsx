import { createContext, ReactNode, useContext } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { useAtom } from "jotai"
import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"
import { useSubmitContext } from "./SubmitFormContext"

type PermissionAndRolesContextTypes = {
    createPermission: (name: string, description: string) => Promise<any>
    createRole: (name: string, description: string, permissions: string[]) => Promise<any>
    userRoles: (user_id: string, roles: string[]) => Promise<any>
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
            toast.success('Permissão criada com sucesso!')
            handleSubmitSuccess()
        }).catch(err => {
            const { response: { data: { message } } } = err
            handleSubmitError()
            if (message === 'Permission already exists') {
                toast.error('Permissão já existe no banco de dados!')
            } else {
                console.log(err)
                toast.error('Ocorreu um erro no servidor!')
            }
        })
    }

    async function createRole(name: string, description: string, permissions: string[]) {
        api.post('role', {
            name,
            description,
            permissions
        }).then(res => {
            toast.success('Função criada com sucesso!')
            handleSubmitSuccess()
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError()
            if (message === 'Role already exists') {
                toast.error('Essa função já existe!')
            } else {
                toast.error('Ocorreu um erro no servidor')
            }
        })
    }
    async function userRoles(user_id: string, roles: string[]) {
        api.put('/user/roles', {
            user_id,
            roles
        }).then(res => {
            toast.success('Função atribuída ao usuário com sucesso!')
            handleSubmitSuccess()
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            handleSubmitError()
            toast.error('Ocorreu um erro no servidor')
        })
    }

    return (
        <PermissionAndRolesContext.Provider value={{
            createPermission, createRole, userRoles
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