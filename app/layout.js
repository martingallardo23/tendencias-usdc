import './globals.css'
import LeftPanel from './LeftPanel'
import { calculateDaysSinceFirstDataPoint } from '@/lib/aux-functions';
import Chart from './Chart';
import { Analytics } from '@vercel/analytics/react';
import { getData } from '@/lib/utils';

export const revalidate = 1800;

export const metadata = {
  title: 'Tendencias USDC',
  description: 'Serie histórica de USDC / ARS',
  google: 'notranslate'
}

export default async function RootLayout({ children }) {

  const rawData = await getData();
  const daysSinceFirst = calculateDaysSinceFirstDataPoint(rawData);

  return (
    <html lang="es">
      <head>
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="Content-Language" content="es" />
      </head>
      <body>
        <LeftPanel rawData={rawData} daysSinceFirst={daysSinceFirst} />
        <div className="fixed top-0 right-0 flex flex-row justify-center items-center h-[100vh] w-[70%]" id="chartContainer">
          <div className='flex flex-row items-center justify-center m-auto h-full'>
            <Chart rawData={rawData} />
          </div>
        </div>
        <div className='title-secondary'>
          Tendencias USDC
        </div>
        <Analytics />
      </body>
    </html>
  )
}
