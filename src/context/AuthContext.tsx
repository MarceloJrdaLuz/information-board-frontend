import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { ICongregation, ResponseAuth, RolesType } from "../entities/types"
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "@/services/api"

type AuthContextTypes = {
    authenticated: boolean
    user: User | null
    login: (email: string, password: string) => Promise<any>
    roleContains: (role: string) => boolean | undefined
    logout: () => void
    signUp: (email: string, password: string) => Promise<any>,
    resetPassword: (email: string | undefined, token: string | undefined, newPassword: string) => Promise<any>
    forgotMyPassword: (email: string) => Promise<any>
    loading: boolean
    erroCadastro: boolean
    setErroCadastro?: Dispatch<SetStateAction<boolean>>
    btnDisabled?: boolean
    setBtnDisabled?: Dispatch<SetStateAction<boolean>>
}

type AuthContextProviderProps = {
    children: ReactNode
}

type User = {
    id: String
    email: string
    code: string
    congregation: ICongregation
    roles: RolesType[]
}

export const AuthContext = createContext({} as AuthContextTypes)

export function AuthProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [erroCadastro, setErroCadastro] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)

    useEffect(() => {
        const { 'quadro-token': token } = parseCookies()

        if (token) {
            api.post('/recover-user-information').then(res => {
                setUser(res.data)
            })
        }
    }, [])

    async function login(email: string, password: string) {
        await api.post<ResponseAuth>("/login", {
            email,
            password
        }).then(res => {
            const usuarioLogado = {
                id: res.data.user.id,
                email: res.data.user.email,
                code: res.data.user.code,
                congregation: res.data.user.congregation,
                roles: res.data.user.roles,
            }

            const token = res.data.token

            setCookie(undefined, 'quadro-token', token, {
                maxAge: 60 * 60 + 1, //1 hora
            })

            api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`

            setUser(usuarioLogado)

            Router.push('/dashboard')

        }).catch(res => {
            const { response: { data: { message } } } = res

            if (message === 'Senha inválida') {
                toast.error('Senha não confere!')
            }
            if (message === 'E-mail não cadastrado') {
                toast.error('Usuário inválido!')
            }
            setBtnDisabled(false)
        })
    }

    function logout() {
        setUser(null)
        destroyCookie(undefined, 'quadro-token')
        Router.push('/login')
    }

    async function signUp(email: string, password: string) {
        await api.post<ResponseAuth>('user', {
            email,
            password
        }).then(res => {
            console.log(res.data)
            const usuarioLogado = {
                id: res.data.user.id,
                email: res.data.user.email,
                code: res.data.user.code,
                congregation: res.data.user.congregation,
                roles: res.data.user.roles,
                token: res.data.token
            }

            if (usuarioLogado.token) {
                toast.success('Cadastro efetuado com sucesso!')
                const token = res.data.token

                setCookie(undefined, 'quadro-token', token, {
                    maxAge: 60 * 60 + 1, //1 hora
                })

                api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`

                setUser(usuarioLogado)

                Router.push('/dashboard')
            }
        }).catch(res => {
            if (res.response.data.message === 'E-mail already exists') {
                Router.push('/login')
                toast.error('E-mail já cadastrado! Caso não lembre da senha, clique em "Esqueci minha senha".')
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
                toast.success('Senha atualizada com sucesso!')
                Router.push('/login')
            })
            .catch(res => {

                const { response: { data: { message } } } = res

                switch (message) {
                    case "User not found":
                        toast.error('Email de redefinição de senha não encontrado!')
                        break
                    case "Token invalid":
                        toast.error('Token inválido!')
                        break
                    case "Token expired, generate a new one":
                        toast.error('Token expirado, gere um novo token!')
                        break
                }
                Router.push('/forgot-password')
            })
    }

    async function forgotMyPassword(email: string) {
        await api.post('/forgot_password', {
            email
        })
            .then(res => {
                setBtnDisabled(false)
                toast.success('E-mail enviado com sucesso!')
                Router.push('/login')
            }).catch(res => {
                setBtnDisabled(false)
                toast.error('Usuário ainda não cadastrado! Se desejar faça seu cadastro.')
                Router.push('/cadastro')
            })
    }

    function roleContains(role: string) {
        const rolesName = user?.roles.map(userRole => userRole.name)
        const contain = rolesName?.includes(role)
        return contain
    }

    return (
        <AuthContext.Provider value={{
            authenticated: !!user, /*admin: !!admin,*/ user, loading, login, logout, signUp, erroCadastro, setErroCadastro, resetPassword, forgotMyPassword, btnDisabled, setBtnDisabled, roleContains
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}