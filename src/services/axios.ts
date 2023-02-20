import axios from "axios"
import { parseCookies } from 'nookies'

export function getAPIClient(ctx?: any) {

    const { 'quadro-token': token } = parseCookies(ctx)

    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE
    })

    api.interceptors.request.use(config => {
        console.log(config)

        return config
    })

    if (token) {
        api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`
    }

    return api;
}

