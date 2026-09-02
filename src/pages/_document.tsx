import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        {/* Viewport fit cover para cobrir notch e status bar no iOS e Android */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Cor da barra de navegação no Android / Chrome */}
        <meta
          name="theme-color"
          content="#178582"
        />

        {/* Windows Phone / Edge */}
        <meta
          name="msapplication-navbutton-color"
          content="#178582"
        />
        <meta
          name="msapplication-TileColor"
          content="#178582"
        />

        {/* PWA no Android */}
        <meta
          name="mobile-web-app-capable"
          content="yes"
        />

        {/* PWA no iOS (Safari) */}
        <meta
          name="apple-mobile-web-app-capable"
          content="yes"
        />

        {/* Faz a barra de status do iOS se fundir perfeitamente com a cor do cabeçalho */}
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        <meta
          name="apple-mobile-web-app-title"
          content="Quadro de Anúncios"
        />

        <link
          rel="manifest"
          href="/manifest.json"
        />

        <link
          rel="apple-touch-icon"
          href="/icons/pwa-192.png"
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}