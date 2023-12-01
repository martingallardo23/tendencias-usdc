import './globals.css'
import LeftPanel from './LeftPanel'

export const metadata = {
  title: 'Tendencias USDC',
  description: 'Serie histórica de USDC / ARS',
  google: 'notranslate'
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
        <div className="flex flex-row justify-center items-center h-[100vh] w-[70%]" id = "chartContainer">
          {children}
        </div>
        <div className = 'title-secondary'>
          Tendencias USDC
        </div>

      </body>
    </html>
  )
}
