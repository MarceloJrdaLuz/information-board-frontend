import { createContext, ReactNode } from "react"
import { toast } from "react-toastify"
import { api } from "@/services/api"
import { useAtom } from "jotai"
import { buttonDisabled, errorFormSend, resetForm, successFormSend } from "@/atoms/atom"

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

export const PermissionAndRolesContext = createContext({} as PermissionAndRolesContextTypes)

export function PermissionAndRolesProvider(props: PermissionAndRolesContextProviderProps) {

    const [, setDisabled] = useAtom(buttonDisabled)
    const [, setResetFormValue] = useAtom(resetForm)
    const [, setSuccessFormSendValue] = useAtom(successFormSend)
    const [, setErrorFormSendValue] = useAtom(errorFormSend)



    async function createPermission(name: string, description: string) {

        await api.post('/permission', {
            name,
            description
        }).then(res => {
            toast.success('Permissão criada com sucesso!')
            setResetFormValue(true)
            setSuccessFormSendValue(true)
            setDisabled(true)
            setTimeout(() => {
                setResetFormValue(false)
                setSuccessFormSendValue(false)
                setDisabled(false)
            }, 6000)
            setErrorFormSendValue(false)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            setDisabled(true)
            setErrorFormSendValue(true)
            setTimeout(() => {
                setResetFormValue(false)
                setDisabled(false)
            }, 6000)
            toast.error('Ocorreu um erro no servidor!')
        })
    }

    async function createRole(name: string, description: string, permissions: string[]) {
        api.post('role', {
            name,
            description,
            permissions
        }).then(res => {
            toast.success('Função criada com sucesso!')
            setResetFormValue(true)
            setSuccessFormSendValue(true)
            setDisabled(true)
            setTimeout(() => {
                setResetFormValue(false)
                setSuccessFormSendValue(false)
                setDisabled(false)
            }, 6000)
            setErrorFormSendValue(false)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            setDisabled(true)
            setErrorFormSendValue(true)
            setTimeout(() => {
                setResetFormValue(false)
                setDisabled(false)
            }, 6000)
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
            setResetFormValue(true)
            setSuccessFormSendValue(true)
            setDisabled(true)
            setTimeout(() => {
                setResetFormValue(false)
                setSuccessFormSendValue(false)
                setDisabled(false)
            }, 6000)
            setErrorFormSendValue(false)
        }).catch(err => {
            console.log(err)
            const { response: { data: { message } } } = err
            setDisabled(true)
            setErrorFormSendValue(true)
            setTimeout(() => {
                setResetFormValue(false)
                setDisabled(false)
            }, 6000)
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