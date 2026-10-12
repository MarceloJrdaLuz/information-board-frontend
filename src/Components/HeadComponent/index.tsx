import Head from "next/head"

interface HeadComponentProps {
    title: string
    description?: string
    urlMiniatura?: string
    pageUrl?: string
    siteName?: string
    imageWidth?: number | string
    imageHeight?: number | string
}

export default function HeadComponent(props: HeadComponentProps) {
    const description =
        props.description ||
        "Quadro de Anúncios Digital — Consulte reuniões, saídas de campo, limpeza, anúncios e relatórios da congregação."
    const siteName = props.siteName || "Quadro de Anúncios"
    const width = String(props.imageWidth ?? 1200)
    const height = String(props.imageHeight ?? 630)

    return (
        <Head>
            <title>{props.title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta key="description" name="description" content={description} />

            {/* OpenGraph / WhatsApp Link Preview */}
            <meta key="og:type" property="og:type" content="website" />
            <meta key="og:locale" property="og:locale" content="pt_BR" />
            <meta key="og:site_name" property="og:site_name" content={siteName} />
            <meta key="og:title" property="og:title" content={props.title} />
            <meta key="og:description" property="og:description" content={description} />
            {props.pageUrl && (
                <meta key="og:url" property="og:url" content={props.pageUrl} />
            )}
            {props.urlMiniatura && (
                <>
                    <meta key="og:image" property="og:image" content={props.urlMiniatura} />
                    <meta key="og:image:secure_url" property="og:image:secure_url" content={props.urlMiniatura} />
                    <meta key="og:image:type" property="og:image:type" content="image/png" />
                    <meta key="og:image:width" property="og:image:width" content={width} />
                    <meta key="og:image:height" property="og:image:height" content={height} />
                    <meta key="og:image:alt" property="og:image:alt" content={props.title} />
                </>
            )}

            {/* Twitter / Telegram Card */}
            <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta key="twitter:title" name="twitter:title" content={props.title} />
            <meta key="twitter:description" name="twitter:description" content={description} />
            {props.urlMiniatura && (
                <meta key="twitter:image" name="twitter:image" content={props.urlMiniatura} />
            )}
        </Head>
    )
}