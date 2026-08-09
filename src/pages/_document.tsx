import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <meta
          name="theme-color"
          content="#208a88"
        />

        <meta
          name="mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="default"
        />

        <meta
          name="apple-mobile-web-app-title"
          content="Information Board"
        />

        <link
          rel="apple-touch-icon"
          href="/images/pwa-192.png"
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}