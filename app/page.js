"use client";

import {  useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Chart from '../app/Chart.jsx';
import { useStore } from '@/store/zustand.js';
import { calculateDaysSinceFirstDataPoint } from '@/lib/aux-functions.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [setRawData, setDaysSinceFirst] = useStore(state => [state.setRawData, state.setDaysSinceFirst]);

  useEffect(() => {
    async function fetchData() {
      // Get the total count of rows in the table
      let { count, error: countError } = await supabase
        .from('usdc_exchange_rates')
        .select('*', { count: 'exact' });
  
      if (countError) {
        console.error(countError);
        return;
      }
  
      let allData = [];
      const pageSize = 1000; // Or any number up to 1000
  
      for (let i = 0; i < count; i += pageSize) {
        let { data: usdcExchangeRates, error } = await supabase
          .from('usdc_exchange_rates')
          .select('*')
          .range(i, i + pageSize - 1);
  
        if (error) {
          console.error(error);
          break; // Stop fetching if there is an error
        }
  
        allData = allData.concat(usdcExchangeRates);
      }
  
      setRawData(allData);
      setDaysSinceFirst(calculateDaysSinceFirstDataPoint(allData));
    }
  
    fetchData();
  }, []);
  

  return (
    <div className = 'flex flex-row items-center justify-center m-auto h-full'>
        <Chart/>
    </div>
  )
}
