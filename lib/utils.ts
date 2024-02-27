import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";
import { cache } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getData = cache(async () => {
  let { count, error: countError } = await supabase
    .from("usdc_exchange_rates")
    .select("*", { count: "exact" });

  if (countError) {
    console.error(countError);
    return;
  }

  let allData = [];
  const pageSize = 1000;

  for (let i = 0; i < count; i += pageSize) {
    let { data: usdcExchangeRates, error } = await supabase
      .from("usdc_exchange_rates")
      .select("*")
      .range(i, i + pageSize - 1);

    if (error) {
      console.error(error);
      break;
    }

    allData = allData.concat(usdcExchangeRates);
  }

  allData = allData.filter((_, i) => i % 2 === 0);

    // Convert the data to a JSON string and measure its length
    const jsonString = JSON.stringify(allData);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMegabytes = sizeInBytes / (1024 * 1024);
    console.log(`Data size: ${sizeInMegabytes.toFixed(2)} MB`);

  return allData;
});
