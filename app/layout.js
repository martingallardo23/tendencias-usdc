import './globals.css'
import LeftPanel from './LeftPanel'

export const metadata = {
  title: 'USDC Trends',
  description: 'USDC exchange rates in Argentina',
  google: 'notranslate',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta http-equiv="Content-Language" content="es"/>
      </head>
      <body>
        <LeftPanel />
        <div className="flex flex-row justify-center items-center m-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
