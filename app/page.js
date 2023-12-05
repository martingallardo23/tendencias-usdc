"use client";

import {  useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Chart from '../app/Chart.jsx';
import { useStore } from '@/store/zustand.js';
import { calculateDaysSinceFirstDataPoint } from './functions.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [setRawData, setDaysSinceFirst] = useStore(state => [state.setRawData, state.setDaysSinceFirst]);

  useEffect(() => {
    async function fetchData() {
      let { data: usdcExchangeRates, error } = await supabase
        .from('usdc_exchange_rates')
        .select('*');

      if (error) {
        console.error(error);
        return;
      } {
        setRawData(usdcExchangeRates);
        setDaysSinceFirst(calculateDaysSinceFirstDataPoint(usdcExchangeRates));
      }
    }

    fetchData();
  }, []);

  return (
    <div className = 'flex flex-row items-center justify-center m-auto h-full'>
        <Chart/>
    </div>
  )
}
