import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ProveedorTema, SCRIPT_TEMA_INICIAL } from '@/lib/tema';

export const metadata: Metadata = {
  title: 'RENOVA — Basura en recurso',
  description:
    'Valorización energética de residuos orgánicos: convertimos 2.000 kg de basura al día en biogás para Santa Cruz.',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0C08' },
    { media: '(prefers-color-scheme: light)', color: '#FBFBF8' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Tipografías por <link> y no por next/font: si no hay red, la página
            degrada al stack del sistema en vez de romper el build. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        {/* Fija el tema antes del primer pintado para evitar el destello. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA_INICIAL }} />
      </head>
      <body>
        <ProveedorTema>{children}</ProveedorTema>
      </body>
    </html>
  );
}
