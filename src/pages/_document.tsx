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

        {/* Captura antecipada do evento de instalacao do PWA para nunca ser perdido */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredInstallPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-captured'));
              });
            `,
          }}
        />

        {/* Script síncrono que define a classe do tema e a cor da status bar antes do primeiro desenho da tela */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var params = new URLSearchParams(window.location.search);
                  var urlTheme = params.get('theme');
                  var saved = (urlTheme !== null && urlTheme !== undefined) ? urlTheme : (localStorage.getItem('theme') || '');
                  if (urlTheme !== null && urlTheme !== undefined) {
                    try { localStorage.setItem('theme', urlTheme); } catch(e) {}
                  }
                  var colors = {
                    '': '#178582',
                    'theme-dark': '#6F4EA1',
                    'theme-blue': '#3E6BA3',
                    'theme-purple': '#7B63AD',
                    'theme-pink': '#B6587D'
                    'theme-pink': '#B6587D',
                    'theme-dark-teal': '#178582',
                    'theme-dark-blue': '#3E6BA3',
                    'theme-dark-purple': '#6F4EA1',
                    'theme-dark-pink': '#B6587D'
                  };
                  var color = colors[saved] || '#178582';
                  if (saved) {
                    document.documentElement.className = saved;
                  }
                  var meta = document.createElement('meta');
                  meta.name = 'theme-color';
                  meta.id = 'theme-color-meta';
                  meta.content = color;
                  document.head.appendChild(meta);
                  // Update existing theme-color meta tag if it exists, otherwise create it
                  var meta = document.getElementById('theme-color-meta');
                  var meta = document.querySelector('meta[name="theme-color"]:not([media])');
                  if (!meta) {
                    meta = document.createElement('meta');
                    meta.name = 'theme-color';
                    meta.id = 'theme-color-meta';
                    document.head.appendChild(meta);
                  }
                  meta.setAttribute('content', color);
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