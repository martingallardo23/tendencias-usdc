import './globals.css'
import LeftPanel from './LeftPanel'
import { createClient } from '@supabase/supabase-js';
import { calculateDaysSinceFirstDataPoint } from '@/lib/aux-functions';
import Chart from './Chart';
import { cache } from 'react'

export const metadata = {
  title: 'Tendencias USDC',
  description: 'Serie histórica de USDC / ARS',
  google: 'notranslate'
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export const revalidate = 3600;

const getData = cache( async () => {
  let { count, error: countError } = await supabase
        .from('usdc_exchange_rates')
        .select('*', { count: 'exact' });
  
  if (countError) {
    console.error(countError);
    return;
  }

  let allData = [];
  const pageSize = 1000; 

  for (let i = 0; i < count; i += pageSize) {
    let { data: usdcExchangeRates, error } = await supabase
      .from('usdc_exchange_rates')
      .select('*')
      .range(i, i + pageSize - 1);

    if (error) {
      console.error(error);
      break; 
    }

    allData = allData.concat(usdcExchangeRates);
  }
  return allData;
})

export default async function RootLayout({ children }) {

  const rawData = await getData();
  const daysSinceFirst = calculateDaysSinceFirstDataPoint(rawData);

  return (
    <html lang="es">
      <head>
        <title>{metadata.title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="Content-Language" content="es"/>
      </head>
      <body>
        <LeftPanel rawData={rawData} daysSinceFirst = {daysSinceFirst} />
        <div className="fixed top-0 right-0 flex flex-row justify-center items-center h-[100vh] w-[70%]" id = "chartContainer">
          <div className = 'flex flex-row items-center justify-center m-auto h-full'>
              <Chart rawData = {rawData}/>
          </div>
        </div>
        <div className = 'title-secondary'>
          Tendencias USDC
        </div>
      </body>
    </html>
  )
}
