import { domainUrl } from "@/atoms/atom"
import { useSubmit } from "@/hooks/useSubmitForms"
import { api } from "@/services/api"
import { messageErrorsSubmit, messageSuccessSubmit } from "@/utils/messagesSubmit"
import { publicRoutes } from "@/utils/publicRoutes"
import { deleteCookie, setCookie } from "cookies-next"
import { useSetAtom } from "jotai"
import Router, { useRouter } from 'next/router'
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react"
import { ResponseAuth, UserTypes } from "../types/types"

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
    authResolved: boolean
    setErroCadastro?: Dispatch<SetStateAction<boolean>>
    btnDisabled?: boolean
    setBtnDisabled?: Dispatch<SetStateAction<boolean>>
}

type AuthContextProviderProps = {
    children: ReactNode
}

const AuthContext = createContext({} as AuthContextTypes)

function AuthProvider(props: AuthContextProviderProps) {
    const router = useRouter();
    const path = router.pathname;
    const isPublic = publicRoutes.includes(path);

    const { handleSubmitError, handleSubmitSuccess } = useSubmit()

    const [user, setUser] = useState<UserTypes | null>(null)
    const [loading, setLoading] = useState(false)
    const [erroCadastro, setErroCadastro] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)
    const [authResolved, setAuthResolved] = useState(false)

    const setDomainAtom = useSetAtom(domainUrl)

    useEffect(() => {
        const dominio = window.location.origin
        setDomainAtom(dominio)
    }, [setDomainAtom])


    useEffect(() => {
        if (isPublic) {
            // Área pública → NÃO recuperar usuário
            setAuthResolved(true);
            return;
        }

        const recoverUser = async () => {
            try {
                const res = await api.get('/recover-user-information')
                setUser(res.data)
            } catch (err: any) {
                setUser(null)
            } finally {
                setAuthResolved(true) // sinaliza que a autenticação foi resolvida
            }
        }
        recoverUser()
    }, [isPublic])

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
            const user = {
                id: res.data.user.id,
                email: res.data.user.email,
                fullName: res.data.user.fullName,
                code: res.data.user.code,
                congregation: res.data.user.congregation,
                roles: res.data.user.roles,
                profile: res.data.user.profile,
                publisher: res.data.user.publisher
            }

            const token = res.data.token

            setCookie('quadro-token', token, {
                maxAge: 60 * 60 * 24 * 30,
            })

            api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`

            setUser(user)

        }).catch(res => {
            setLoading(false)
            delete api.defaults.headers['Authorization']
            const { response: { data: { message } } } = res
            if (message === 'Credentials invalid!') {
                handleSubmitError(messageErrorsSubmit.credentialsInvalid)
            }
        })
    }

    async function logout() {
        deleteCookie('quadro-token', {
            path: "/"
        })
        delete api.defaults.headers['Authorization']
        setUser(null)
        Router.push('/login')
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
                token: res.data.token
            }

            if (user.token) {
                const token = res.data.token

                setCookie('quadro-token', token, {
                    maxAge: 60 * 60 * 24 * 30,
                })

                api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`

                setUser(user)

                handleSubmitSuccess(messageSuccessSubmit.registerCreate, '/dashboard')
            }
        }).catch(res => {
            if (res.response.data.message.includes('already exists')) {
                handleSubmitError(messageErrorsSubmit.emailAlreadyExists, "/login")
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
            authenticated: !!user, user, loading, login, logout, signUp, erroCadastro, setErroCadastro, resetPassword, forgotMyPassword, btnDisabled, setBtnDisabled, roleContains, setLoading, authResolved
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

