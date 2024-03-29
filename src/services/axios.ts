import axios from "axios"
import { parseCookies } from 'nookies'
import {getCookie } from 'cookies-next'

export function getAPIClient(ctx?: any) {

    const { 'quadro-token': token } = parseCookies(ctx)

    const deviceId = getCookie('deviceId')


    const api = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_BASE, 
    })

    api.interceptors.request.use(config => {

        return config
    })

    if (token) {
        api.defaults.headers['Authorization'] = `Bearer ${token.replace(/"/g, '')}`
    }

    return api
}

