import { GetServerSidePropsContext } from 'next'
import { ICongregation } from '@/types/types'

export interface PublicPageOgMeta {
    title: string
    description: string
    ogImageUrl: string
    pageUrl: string
    siteName: string
}

export interface PublicPageServerProps {
    serverNumber: string
    serverCongregation?: ICongregation | null
    ogMeta: PublicPageOgMeta
}

interface PageMetaConfig {
    tipo: string
    defaultTitle: string
    defaultDescription: string
    pathSuffix: string
}

const PAGE_CONFIGS: Record<string, PageMetaConfig> = {
    quadro: {
        tipo: 'quadro',
        defaultTitle: 'Quadro de Anúncios',
        defaultDescription: 'Consulte as programações de reuniões, saídas de campo, limpeza, anúncios e envio de relatórios da congregação.',
        pathSuffix: '',
    },
    anuncios: {
        tipo: 'anuncios',
        defaultTitle: 'Anúncios e Avisos',
        defaultDescription: 'Confira os informativos, avisos e comunicados ativos publicados no quadro de anúncios da congregação.',
        pathSuffix: '/anuncios',
    },
    campo: {
        tipo: 'campo',
        defaultTitle: 'Pregação e Campo',
        defaultDescription: 'Consulte os horários e locais das saídas para o serviço de campo e os arranjos de testemunho público.',
        pathSuffix: '/campo',
    },
    designacoes: {
        tipo: 'designacoes',
        defaultTitle: 'Reuniões e Designações',
        defaultDescription: 'Consulte a programação semanal da Reunião Vida e Ministério e da Reunião Pública e Estudo de A Sentinela.',
        pathSuffix: '/designacoes',
    },
    eventos: {
        tipo: 'eventos',
        defaultTitle: 'Eventos Especiais',
        defaultDescription: 'Confira as datas, locais e programações de assembleias de circuito, congressos regionais e visitas especiais.',
        pathSuffix: '/eventos',
    },
    financeiro: {
        tipo: 'financeiro',
        defaultTitle: 'Relatório Financeiro',
        defaultDescription: 'Consulte os demonstrativos mensais e relatórios de contas da congregação.',
        pathSuffix: '/financeiro',
    },
    limpeza: {
        tipo: 'limpeza',
        defaultTitle: 'Limpeza do Salão do Reino',
        defaultDescription: 'Consulte a escala semanal e os grupos designados para a limpeza e manutenção do Salão do Reino.',
        pathSuffix: '/limpeza',
    },
    'politica-privacidade': {
        tipo: 'politica-privacidade',
        defaultTitle: 'Política de Privacidade',
        defaultDescription: 'Diretrizes sobre privacidade, sigilo e tratamento de dados pessoais no quadro de anúncios da congregação.',
        pathSuffix: '/politica-privacidade',
    },
    relatorio: {
        tipo: 'relatorio',
        defaultTitle: 'Envio de Relatório',
        defaultDescription: 'Envie seu relatório mensal de serviço de campo de forma simples, rápida e segura.',
        pathSuffix: '/relatorio',
    },
}

export function getPublicOrigin(context: GetServerSidePropsContext): string {
    const req = context.req
    const forwardedProto = req.headers['x-forwarded-proto']
    const forwardedHost = req.headers['x-forwarded-host']
    const host = (Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost) || req.headers.host

    if (host) {
        const protoHeader = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto
        const isLocal = host.includes('localhost') || host.startsWith('127.0.0.1')
        const proto = protoHeader ? protoHeader.split(',')[0].trim() : isLocal ? 'http' : 'https'
        return `${proto}://${host}`
    }

    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
    }

    return 'http://localhost:3001'
}

async function fetchCongregationServerSide(number: string): Promise<ICongregation | null> {
    const apiBase = process.env.NEXT_PUBLIC_API_BASE
    if (!apiBase || !number) return null

    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 3500)

        const cleanBase = apiBase.replace(/\/$/, '')
        const res = await fetch(`${cleanBase}/congregation/${encodeURIComponent(number)}`, {
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
            },
        })
        clearTimeout(timeout)

        if (!res.ok) return null
        const data = await res.json()
        return data as ICongregation
    } catch {
        return null
    }
}

export async function buildPublicPageServerProps(
    context: GetServerSidePropsContext,
    pageKey: keyof typeof PAGE_CONFIGS
): Promise<{ props: PublicPageServerProps }> {
    const number = String(context.params?.number || '')
    const query = context.query || {}
    const config = PAGE_CONFIGS[pageKey] || PAGE_CONFIGS.quadro

    const origin = getPublicOrigin(context)
    const congregation = await fetchCongregationServerSide(number)

    const queryTitulo = typeof query.titulo === 'string' && query.titulo.trim() ? query.titulo.trim() : ''
    const querySubtitulo = typeof query.subtitulo === 'string' && query.subtitulo.trim() ? query.subtitulo.trim() : ''
    const queryCongregacao = typeof query.congregacao === 'string' && query.congregacao.trim() ? query.congregacao.trim() : ''

    const congregationName = queryCongregacao || congregation?.name || ''
    const circuitName = congregation?.circuit || ''

    const baseTitle = queryTitulo || config.defaultTitle
    const fullTitle = congregationName
        ? `${baseTitle} - Congregação ${congregationName}`
        : `${baseTitle} - Quadro de Anúncios`

    const description = querySubtitulo || (
        congregationName
            ? `${config.defaultDescription} (Congregação ${congregationName}${circuitName ? ` - ${circuitName}` : ''})`
            : config.defaultDescription
    )

    const ogParams = new URLSearchParams()
    ogParams.set('tipo', config.tipo)
    ogParams.set('titulo', baseTitle)
    ogParams.set('subtitulo', querySubtitulo || config.defaultDescription)
    if (congregationName) {
        ogParams.set('congregacao', congregationName)
    }
    if (circuitName) {
        ogParams.set('circuito', circuitName)
    }

    const ogImageUrl = `${origin}/api/og?${ogParams.toString()}`
    const pageUrl = `${origin}/${encodeURIComponent(number)}${config.pathSuffix}`
    const siteName = congregationName
        ? `Quadro de Anúncios - Congregação ${congregationName}`
        : 'Quadro de Anúncios'

    return {
        props: {
            serverNumber: number,
            serverCongregation: congregation,
            ogMeta: {
                title: fullTitle,
                description,
                ogImageUrl,
                pageUrl,
                siteName,
            },
        },
    }
}

