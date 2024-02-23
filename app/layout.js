import './globals.css'
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Tendencias USDC',
  description: 'Serie histórica de USDC / ARS',
  google: 'notranslate'
}

export default async function RootLayout({ children }) {

  return (
    <html lang="es">
      <head>
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="Content-Language" content="es" />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
