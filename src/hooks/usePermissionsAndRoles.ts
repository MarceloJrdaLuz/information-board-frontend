import { api } from "@/services/api"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { toast } from "react-toastify"
import { useSubmit } from "./useSubmitForms"

export function usePermissionsAndRoles() {
    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    async function createPermission(name: string, description: string) {
        try {
            await api.post('/permission', { name, description })
            handleSubmitSuccess(messageSuccessSubmit.permissionCreate)
        } catch (err: any) {
            const message = err.response?.data?.message
            if (message === 'Permission already exists') {
                handleSubmitError(messageErrorsSubmit.permissionAlreadyExists)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        }
    }

    async function updatePermission(permission_id: string, name?: string, description?: string) {
        try {
            await api.put(`/permission/${permission_id}`, { name, description })
            handleSubmitSuccess(messageSuccessSubmit.permissionUpdate, '/permissoes')
        } catch (err) {
            handleSubmitError(messageErrorsSubmit.default)
        }
    }

    async function deletePermission(permission_id: string) {
        try {
            await api.delete(`/permission/${permission_id}`)
            handleSubmitSuccess(messageSuccessSubmit.permissionDelete)
        } catch (err: any) {
            const message = err.response?.data?.message
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        }
    }

    async function createRole(name: string, description: string, permissions: string[]) {
        try {
            await api.post('/role', { name, description, permissions })
            handleSubmitSuccess(messageSuccessSubmit.roleCreate)
        } catch (err: any) {
            const message = err.response?.data?.message
            if (message === 'Role already exists') {
                handleSubmitError(messageErrorsSubmit.roleAlreadyExists)
            } else {
                toast.error(messageErrorsSubmit.default)
            }
        }
    }

    async function updateRole(role_id: string, name?: string, description?: string, permissions?: string[]) {
        try {
            await api.put(`/role/${role_id}`, { name, description, permissions })
            handleSubmitSuccess(messageSuccessSubmit.roleUpdate)
        } catch {
            handleSubmitError(messageErrorsSubmit.default)
        }
    }

    async function userRoles(user_id: string, roles: string[]) {
        try {
            await api.put('/user/roles', { user_id, roles })
            handleSubmitSuccess(messageSuccessSubmit.roleAddUser)
        } catch (err: any) {
            const message = err.response?.data?.message
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        }
    }

    async function deleteRole(role_id: string) {
        try {
            await api.delete(`/role/${role_id}`)
            handleSubmitSuccess(messageSuccessSubmit.roleDelete)
        } catch (err: any) {
            const message = err.response?.data?.message
            if (message === '"Unauthorized"') {
                handleSubmitError(messageErrorsSubmit.unauthorized)
            } else {
                handleSubmitError(messageErrorsSubmit.default)
            }
        }
    }

    return {
        createPermission,
        createRole,
        userRoles,
        deletePermission,
        updatePermission,
        updateRole,
        deleteRole
    }
}
