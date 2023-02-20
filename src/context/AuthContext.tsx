import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ResponseAuth, RolesType } from "../entities/types";
import Router from 'next/router'
import { setCookie, parseCookies } from 'nookies'
import { api } from "@/services/api";

type AuthContextTypes = {
    authenticated: boolean
    user: User  | null
    login: (email: string, password: string) => Promise<any>
    // // logout: () => void
    // // cadastro: (nome: string, email: string, senha: string)=> Promise<any>
    // // resetPassword: (email: string | undefined, token: string | undefined, newPassword: string) => Promise<any>
    // // esqueciMinhaSenha: (email: string) => Promise<any>
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

        if(token){
            api.post('/recover-user-information', {token}).then(res => {
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

            // if (usuarioLogado.token) {
            //     setUser(usuarioLogado)
            //     localStorage.setItem('user', JSON.stringify(usuarioLogado))
            //     localStorage.setItem('token', JSON.stringify(usuarioLogado.token))
            //     toast.success('Usuário Autenticado!')
            //     router.push('/')
            // }
            // if(usuarioLogado.permissions === "ADMIN"){
            //     setAdmin(true)
            //     navigate('/admin')
            // }
        }).catch(res => {
            const { response: { data: { message } } } = res

            console.log(message)
            if (message === 'Senha inválida') {
                toast.error('Senha não confere!')
            }
            if (message === 'E-mail não cadastrado') {
                toast.error('Usuário inválido!')
            }
            setBtnDisabled(false)
        })
    }

    // function logout() {
    //     setUser(undefined)
    //     localStorage.removeItem('user')
    //     setAdmin(false)
    //     navigate('/')
    // }

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
    //             toast.error('Usuário já existe!')
    //             setErroCadastro(true)
    //         }
    //     })
    // }

    // async function resetPassword(email: string | undefined, token: string | undefined, password: string){
    //     api.post('/reset_password', {
    //         email, 
    //         token,
    //         password
    //     })
    //     .then(res => {
    //         setBtnDisabled(false)
    //         toast.success('Senha atualizada com sucesso!')
    //         navigate('/login')   
    //     })
    //     .catch(res => {
    //         setBtnDisabled(false)
    //         toast.error('Houve algum erro ao atualizar a senha! Tente novamente.')
    //         navigate('/esqueci-minha-senha')
    //     })
    // }

    // async function esqueciMinhaSenha (email: string){
    //     api.post('/forgot_password', {
    //         email
    //     })
    //     .then(res => {
    //         setBtnDisabled(false)
    //         toast.success('E-mail enviado com sucesso!')
    //         navigate('/')
    //     }).catch(res => {
    //         setBtnDisabled(false)
    //         toast.error('Usuário ainda não cadastrado! Se desejar faça seu cadastro.')
    //         navigate('/cadastro')
    //     })
    // }

    return (
        <AuthContext.Provider value={{
            authenticated: !!user, /*admin: !!admin,*/ user, loading, login, /*logout, cadastro, */erroCadastro, setErroCadastro, /*resetPassword, esqueciMinhaSenha,*/ btnDisabled, setBtnDisabled
        }}>
            {props.children}
        </AuthContext.Provider>
    )
}