import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const config = {
    runtime: 'edge',
}

interface ThemeStyle {
    accent: string
    accentLight: string
    accentBg: string
    badgeText: string
}

const TYPE_STYLES: Record<string, ThemeStyle> = {
    quadro: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'QUADRO DIGITAL',
    },
    anuncios: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'INFORMATIVOS E AVISOS',
    },
    campo: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'MINISTÉRIO DE CAMPO',
    },
    designacoes: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'PROGRAMAÇÕES SEMANAIS',
    },
    eventos: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'ASSEMBLEIAS E EVENTOS',
    },
    financeiro: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'CONTAS E FINANÇAS',
    },
    limpeza: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'MANUTENÇÃO E LIMPEZA',
    },
    'politica-privacidade': {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'PROTEÇÃO DE DADOS',
    },
    relatorio: {
        accent: '#178582',
        accentLight: '#2dd4bf',
        accentBg: 'rgba(23, 133, 130, 0.22)',
        badgeText: 'SERVIÇO DE CAMPO',
    },
}

const DEFAULT_TITLES: Record<string, { titulo: string; subtitulo: string }> = {
    quadro: {
        titulo: 'Quadro de Anúncios',
        subtitulo: 'Consulte reuniões, saídas de campo, limpeza, anúncios e relatórios da congregação.',
    },
    anuncios: {
        titulo: 'Anúncios e Avisos',
        subtitulo: 'Confira os avisos e comunicados ativos publicados no quadro da congregação.',
    },
    campo: {
        titulo: 'Pregação e Campo',
        subtitulo: 'Consulte as saídas para o serviço de campo e os arranjos de testemunho público.',
    },
    designacoes: {
        titulo: 'Reuniões e Designações',
        subtitulo: 'Programação semanal das reuniões de meio de semana e fim de semana.',
    },
    eventos: {
        titulo: 'Eventos Especiais',
        subtitulo: 'Datas e informativos de assembleias, congressos, celebração e visitas.',
    },
    financeiro: {
        titulo: 'Relatório Financeiro',
        subtitulo: 'Demonstrativos mensais e relatórios de contas da congregação.',
    },
    limpeza: {
        titulo: 'Limpeza do Salão do Reino',
        subtitulo: 'Escala semanal e grupos designados para a limpeza e manutenção do Salão.',
    },
    'politica-privacidade': {
        titulo: 'Política de Privacidade',
        subtitulo: 'Diretrizes sobre privacidade, sigilo e tratamento de dados no quadro de anúncios.',
    },
    relatorio: {
        titulo: 'Envio de Relatório',
        subtitulo: 'Envie seu relatório mensal de serviço de campo de forma simples e rápida.',
    },
}

function renderIcon(tipo: string) {
    switch (tipo) {
        case 'anuncios':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
            )
        case 'campo':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                </svg>
            )
        case 'designacoes':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            )
        case 'eventos':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                    <path d="M8 14h.01" />
                    <path d="M12 14h.01" />
                    <path d="M16 14h.01" />
                    <path d="M8 18h.01" />
                    <path d="M12 18h.01" />
                    <path d="M16 18h.01" />
                </svg>
            )
        case 'financeiro':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="16" height="20" x="4" y="2" rx="2" />
                    <line x1="8" x2="16" y1="6" y2="6" />
                    <line x1="16" x2="16" y1="14" y2="18" />
                    <path d="M16 10h.01" />
                    <path d="M12 10h.01" />
                    <path d="M8 10h.01" />
                    <path d="M12 14h.01" />
                    <path d="M8 14h.01" />
                    <path d="M12 18h.01" />
                    <path d="M8 18h.01" />
                </svg>
            )
        case 'limpeza':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                </svg>
            )
        case 'politica-privacidade':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            )
        case 'relatorio':
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            )
        default:
            return (
                <svg width="88" height="88" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="14" x="3" y="3" rx="2" />
                    <path d="M7 7h10" />
                    <path d="M7 11h6" />
                    <path d="M7 17v4" />
                    <path d="M17 17v4" />
                    <path d="M5 21h4" />
                    <path d="M15 21h4" />
                </svg>
            )
    }
}

export default async function handler(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const rawTipo = (searchParams.get('tipo') || 'quadro').toLowerCase()
    const tipo = DEFAULT_TITLES[rawTipo] ? rawTipo : 'quadro'

    const defaults = DEFAULT_TITLES[tipo]
    const style = TYPE_STYLES[tipo] || TYPE_STYLES.quadro

    const titulo = searchParams.get('titulo') || defaults.titulo
    const subtitulo = searchParams.get('subtitulo') || defaults.subtitulo
    const congregacao = searchParams.get('congregacao') || ''
    const circuito = searchParams.get('circuito') || ''

    return new ImageResponse(
        (
            <div
                style={{
                    width: '1200px',
                    height: '630px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    backgroundColor: '#0c1f24',
                    backgroundImage:
                        'radial-gradient(circle at 85% 20%, rgba(23, 133, 130, 0.38) 0%, rgba(12, 31, 36, 0) 60%), radial-gradient(circle at 10% 90%, rgba(23, 133, 130, 0.25) 0%, rgba(12, 31, 36, 0) 55%)',
                    padding: '64px 72px',
                    color: '#ffffff',
                    fontFamily: 'sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Top Accent Bar */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '12px',
                        background: 'linear-gradient(90deg, #178582 0%, #2dd4bf 50%, #178582 100%)',
                        display: 'flex',
                    }}
                />

                {/* Top Header */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                            backgroundColor: style.accentBg,
                            border: '1px solid rgba(45, 212, 191, 0.35)',
                            borderRadius: '999px',
                            padding: '10px 24px',
                        }}
                    >
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '999px',
                                backgroundColor: style.accentLight,
                                display: 'flex',
                            }}
                        />
                        <span
                            style={{
                                fontSize: '20px',
                                fontWeight: 700,
                                letterSpacing: '2px',
                                color: '#e2f8f5',
                            }}
                        >
                            {style.badgeText}
                        </span>
                    </div>

                    {congregacao ? (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.16)',
                                borderRadius: '16px',
                                padding: '10px 22px',
                                fontSize: '22px',
                                fontWeight: 600,
                                color: '#f1f5f9',
                            }}
                        >
                            {`Congregação ${congregacao}${circuito ? ` • ${circuito}` : ''}`}
                        </div>
                    ) : null}
                </div>

                {/* Main Content Area */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '48px',
                        width: '100%',
                        marginTop: '12px',
                        marginBottom: '12px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            flex: 1,
                            maxWidth: '780px',
                        }}
                    >
                        <div
                            style={{
                                fontSize: titulo.length > 28 ? '56px' : '66px',
                                fontWeight: 800,
                                lineHeight: 1.12,
                                color: '#ffffff',
                                letterSpacing: '-1px',
                                marginBottom: '22px',
                                display: 'flex',
                            }}
                        >
                            {titulo}
                        </div>

                        <div
                            style={{
                                fontSize: '28px',
                                fontWeight: 400,
                                lineHeight: 1.42,
                                color: '#cbd5e1',
                                display: 'flex',
                            }}
                        >
                            {subtitulo.length > 130 ? `${subtitulo.slice(0, 127)}...` : subtitulo}
                        </div>
                    </div>

                    {/* Right Icon Box */}
                    <div
                        style={{
                            width: '190px',
                            height: '190px',
                            borderRadius: '42px',
                            background: 'linear-gradient(135deg, #178582 0%, #0f5c59 100%)',
                            border: '2px solid rgba(45, 212, 191, 0.45)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {renderIcon(tipo)}
                    </div>
                </div>

                {/* Bottom Footer */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        paddingTop: '24px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '14px',
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '10px',
                                backgroundColor: '#178582',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect width="18" height="14" x="3" y="3" rx="2" />
                                <path d="M7 7h10" />
                                <path d="M7 11h6" />
                            </svg>
                        </div>
                        <span
                            style={{
                                fontSize: '24px',
                                fontWeight: 700,
                                color: '#e2e8f0',
                            }}
                        >
                            Quadro de Anúncios
                        </span>
                    </div>

                    <span
                        style={{
                            fontSize: '20px',
                            fontWeight: 500,
                            color: '#94a3b8',
                        }}
                    >
                        Acesso rápido às informações da congregação
                    </span>
                </div>
            </div>
        ),
        {
            width: 1200,
            height: 630,
        }
    )
}

