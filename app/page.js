"use client";

import {  useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Chart from '../app/Chart.jsx';
import { useStore } from '@/store/zustand.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [setRawData] = useStore(state => [state.setRawData]);

  useEffect(() => {
    async function fetchData() {
      let { data: usdcExchangeRates, error } = await supabase
        .from('usdc_exchange_rates')
        .select('*');

        setRawData(usdcExchangeRates);
    }

    fetchData();
  }, []);

  return (
    <div className = 'flex flex-row items-center justify-center m-auto'>
        <Chart/>
    </div>
  )
}
