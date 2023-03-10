import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ResponseAuth, RolesType } from "../entities/types";
import Router from 'next/router'
import { setCookie, parseCookies, destroyCookie } from 'nookies'
import { api } from "@/services/api";

type AuthContextTypes = {
    authenticated: boolean
    user: User | null
    login: (email: string, password: string) => Promise<any>
    roleContains: (role: string) => boolean | undefined
    logout: () => void
    // // cadastro: (nome: string, email: string, senha: string)=> Promise<any>
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
    id: string
    email: string
    roles: RolesType[]
}

export const AuthContext = createContext({} as AuthContextTypes)

export function AuthProvider(props: AuthContextProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [admin, setAdmin] = useState(false)
    const [loading, setLoading] = useState(true)
    const [erroCadastro, setErroCadastro] = useState(false)
    const [btnDisabled, setBtnDisabled] = useState(false)

    useEffect(() => {
        const { 'quadro-token': token } = parseCookies()

        if (token) {
            api.post('/recover-user-information', { token }).then(res => {
                setUser(res.data)
            })
        }
        // const usuarioRecuperado = localStorage.getItem('user')
        // if (usuarioRecuperado) {
        //     setUser(JSON.parse(usuarioRecuperado))
        // }
        // setLoading(false)
    }, [])

    async function login(email: string, password: string) {
        await api.post<ResponseAuth>("/login", {
            email,
            password
        }).then(res => {
            const usuarioLogado = {
                id: res.data.user.id,
                email: res.data.user.email,
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

            if (message === 'Senha inv??lida') {
                toast.error('Senha n??o confere!')
            }
            if (message === 'E-mail n??o cadastrado') {
                toast.error('Usu??rio inv??lido!')
            }
            setBtnDisabled(false)
        })
    }

    function logout() {
        setUser(null)
        destroyCookie(undefined, 'quadro-token')
        Router.push('/login')
    }

    // async function cadastro(nome: string, email: string, senha: string){
    //     await api.post<ResponseAuth>('auth/register', {
    //         name: nome,
    //         email,
    //         password: senha,
    //     }).then(res => {
    //         const usuarioLogado = {
    //             id: res.data.user._id,
    //             email: res.data.user.email,
    //             permissions: res.data.user.permissions,
    //             token: res.data.token,
    //         }
    //         if(usuarioLogado.token){
    //             toast.success('Cadastro efetuado com sucesso!')
    //             setUser(usuarioLogado)
    //             localStorage.setItem('user', JSON.stringify(usuarioLogado))
    //             navigate('/dashboard')
    //             setBtnDisabled(false)    
    //         }
    //     }).catch(res => {
    //         if(res.response.data.error === 'User already exists'){
    //             toast.error('Usu??rio j?? existe!')
    //             setErroCadastro(true)
    //         }
    //     })
    // }

    async function resetPassword(email: string | undefined, token: string | undefined, newPassword: string) {
        api.post('/reset_password', {
            email,
            token,
            newPassword
        })
            .then(res => {
                console.log(res)
                toast.success('Senha atualizada com sucesso!')
                Router.push('/login')
            })
            .catch(res => {

                const {response: {data: {message}}} = res
                
                switch (message) {
                    case "User not found":
                        toast.error('Email de redefini????o de senha n??o encontrado!')
                        break;
                    case "Token invalid":
                        toast.error('Token inv??lido!')
                        break;
                    case "Token expired, generate a new one":
                        toast.error('Token expirado, gere um novo token!')
                        break;
                }
                Router.push('/forgot-password')
            })
    }

    async function forgotMyPassword(email: string) {
        api.post('/forgot_password', {
            email
        })
            .then(res => {
                setBtnDisabled(false)
                toast.success('E-mail enviado com sucesso!')
                Router.push('/login')
            }).catch(res => {
                setBtnDisabled(false)
                toast.error('Usu??rio ainda n??o cadastrado! Se desejar fa??a seu cadastro.')
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
            authenticated: !!user, /*admin: !!admin,*/ user, loading, login, logout, /*cadastro, */erroCadastro, setErroCadastro, resetPassword, forgotMyPassword, btnDisabled, setBtnDisabled, roleContains
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}