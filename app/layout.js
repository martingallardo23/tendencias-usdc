import './globals.css'
import LeftPanel from './LeftPanel'

export const metadata = {
  title: 'USDC Exchange Rates',
  description: 'USD Coin exchange rates in Argentina',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LeftPanel />
        <div className="flex flex-row justify-center items-center m-auto">
          {children}
        </div>
      </body>
    </html>
  )
}
