import { domainUrl } from "@/atoms/atom"
import { api } from "@/services/api"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { useSetAtom } from "jotai"
import Router from 'next/router'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { ResponseAuth, UserTypes } from "../types/types"
import { useSubmitContext } from "./SubmitFormContext"

type AuthContextTypes = {
    authenticated: boolean
    user: UserTypes | null
    login: (email: string, password: string) => Promise<any>
    roleContains: (role: string) => boolean | undefined
    logout: () => void
    signUp: (email: string, password: string, fullName: string) => Promise<any>,
    resetPassword: (email: string | undefined, token: string | undefined, newPassword: string) => Promise<any>
    forgotMyPassword: (email: string) => Promise<any>
    loading: boolean
    setLoading: Dispatch<SetStateAction<boolean>>
    erroCadastro: boolean
    setErroCadastro?: Dispatch<SetStateAction<boolean>>
    btnDisabled?: boolean
    setBtnDisabled?: Dispatch<SetStateAction<boolean>>
}

type AuthContextProviderProps = {
    children: ReactNode
}

const AuthContext = createContext({} as AuthContextTypes)

function AuthProvider(props: AuthContextProviderProps) {
    const { handleSubmitError, handleSubmitSuccess } = useSubmitContext()

    const [user, setUser] = useState<UserTypes | null>(null)
    const [loading, setLoading] = useState(false)
    const [erroCadastro, setErroCadastro] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)

    const setDomainAtom = useSetAtom(domainUrl)

    useEffect(() => {
        const dominio = window.location.origin
        setDomainAtom(dominio)
    }, [setDomainAtom])

    useEffect(() => {
        const recoverUser = async () => {
            try {
                const res = await api.post('/recover-user-information')
                setUser(res.data)
            } catch (err: any) {
                if (err.response?.status === 401) {
                    // usuário não autenticado
                    setUser(null)
                    Router.push('/login')
                } else {
                    console.error('Erro ao recuperar usuário:', err)
                }
            }
        }   
        recoverUser()
    }, [])


    useEffect(() => {
        const handleRouteChangeComplete = (url: string) => {
            // Verifica se a URL atual corresponde à URL de destino
            if (url === '/dashboard') {
                setLoading(false)
            }
        }

        // Adiciona um ouvinte para o evento de conclusão da mudança de rota
        Router.events.on('routeChangeComplete', handleRouteChangeComplete)

        // Remove o ouvinte quando o componente for desmontado
        return () => {
            Router.events.off('routeChangeComplete', handleRouteChangeComplete)
        }
    }, [])

    async function login(email: string, password: string) {
        setLoading(true)
        await api.post<ResponseAuth>("/login", {
            email,
            password
        }).then(res => {
            const userLogged = {
                id: res.data.user.id,
                email: res.data.user.email,
                fullName: res.data.user.fullName,
                code: res.data.user.code,
                congregation: res.data.user.congregation,
                roles: res.data.user.roles,
                profile: res.data.user.profile
            }

            // const userRoles = res.data.user.roles.map(role => (
            //     role.name
            // ))

            // setCookie('quadro-token', token, {
            //     maxAge: 60 * 60 * 8,
            // })

            // setCookie('user-roles', JSON.stringify(userRoles), {
            //     maxAge: 60 * 60 * 8,
            // })

            // api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`

            setUser(userLogged)

        }).catch(res => {
            setLoading(false)
            const { response: { data: { message } } } = res
            if (message === 'Credentials invalid!') {
                handleSubmitError(messageErrorsSubmit.credentialsInvalid)
            }
        })
    }

    async function logout() {
        // deleteCookie('quadro-token', {
        //     path: "/"
        // })
        // deleteCookie('user-roles', {
        //     path: "/"
        // })

        // setUser(null)
        // Router.push('/login')
        try {
            await api.post("/logout"); // backend vai limpar o cookie
            setUser(null);
            Router.push("/login");
        } catch (err) {
            console.error("Erro ao fazer logout", err);
        }
    }


    async function signUp(email: string, password: string, fullName: string) {
        await api.post<ResponseAuth>('/user', {
            email,
            password,
            fullName
        }).then(res => {
            const user = {
                id: res.data.user.id,
                email: res.data.user.email,
                fullName: res.data.user.fullName,
                code: res.data.user.code,
                congregation: res.data.user.congregation,
                profile: res.data.user.profile,
                roles: res.data.user.roles,
            }
            setUser(user)
            handleSubmitSuccess(messageSuccessSubmit.registerCreate, '/dashboard')
        }).catch(res => {
            if (res.response.data.message === 'E-mail already exists') {
                handleSubmitSuccess(messageErrorsSubmit.emailAlreadyExists, "/login")
            }
        })
    }

    async function resetPassword(email: string | undefined, token: string | undefined, newPassword: string) {
        await api.post('/reset_password', {
            email,
            token,
            newPassword
        })
            .then(res => {
                handleSubmitSuccess(messageSuccessSubmit.passwordUpdate, "/login")
            })
            .catch(res => {
                const { response: { data: { message } } } = res

                switch (message) {
                    case "User not found":
                        handleSubmitError(messageErrorsSubmit.emailNotFound, '/forgot-password')
                        break
                    case "Token invalid":
                        handleSubmitError(messageErrorsSubmit.invalidToken, '/forgot-password')
                        break
                    case "Token expired, generate a new one":
                        handleSubmitError(messageErrorsSubmit.tokenExpired, '/forgot-password')
                        break
                }
            })
    }

    async function forgotMyPassword(email: string) {
        await api.post('/forgot_password', {
            email
        })
            .then(res => {
                handleSubmitSuccess(messageSuccessSubmit.emailSend, '/login')
            }).catch(res => {
                const { response: { data: { error } } } = res
                if (error === `User wasn't found`) handleSubmitError(messageErrorsSubmit.userNotRegistered, '/cadastro')
                if (error === 'Cannot send forgot password email') handleSubmitError(messageErrorsSubmit.emailNotSend)
                else {
                    handleSubmitError(messageErrorsSubmit.default)
                }
            })
    }

    function roleContains(role: string) {
        const rolesName = user?.roles.map(userRole => userRole.name)
        const contain = rolesName?.includes(role)
        return contain
    }

    return (
        <AuthContext.Provider value={{
            authenticated: !!user, /*admin: !!admin,*/ user, loading, login, logout, signUp, erroCadastro, setErroCadastro, resetPassword, forgotMyPassword, btnDisabled, setBtnDisabled, roleContains, setLoading
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}

function useAuthContext(): AuthContextTypes {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error("useFiles must be used within FileProvider")
    }

    return context
}

export { AuthProvider, useAuthContext }

