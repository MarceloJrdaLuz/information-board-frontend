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
          id="theme-color-meta"
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

        {/* Script síncrono que define a classe do tema e a cor da status bar antes do primeiro desenho da tela */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme') || '';
                  var colors = {
                    '': '#178582',
                    'theme-dark': '#6F4EA1',
                    'theme-blue': '#3E6BA3',
                    'theme-purple': '#62468C'
                  };
                  var color = colors[saved] || '#178582';
                  if (saved) {
                    document.documentElement.className = saved;
                  }
                  var meta = document.getElementById('theme-color-meta');
                  if (meta) {
                    meta.setAttribute('content', color);
                  }
                  var meta = document.createElement('meta');
                  meta.name = 'theme-color';
                  meta.id = 'theme-color-meta';
                  meta.content = color;
                  document.head.appendChild(meta);
                  var nav = document.querySelector('meta[name="msapplication-navbutton-color"]');
                  if (nav) {
                    nav.setAttribute('content', color);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}