import Head from "next/head"

interface HeadComponentProps {
    title: string
    urlMiniatura?: string
}

export default function HeadComponent(props: HeadComponentProps) {
    return (
        <Head>
            <title>{props.title}</title>
            <meta charSet="utf-8" />
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
            <meta property="og:image" content={props.urlMiniatura}></meta>
            <meta property="og:image:width" content="800"></meta>
            <meta property="og:image:height" content="600"></meta>
        </Head>
    )
}