import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export const getData = async () => {
  let { count, error: countError } = await supabase
    .from("usdc")
    .select("*", { count: "exact" });

  if (countError) {
    console.error(countError);
    return;
  }

  let allData = [];
  const pageSize = 1000;

  for (let i = 0; i < count; i += pageSize) {
    let { data: usdcExchangeRates, error } = await supabase
      .from("usdc")
      .select("*")
      .range(i, i + pageSize - 1);

    if (error) {
      console.error(error);
      break;
    }

    allData = allData.concat(usdcExchangeRates);
  }

  allData = allData.filter((_, i) => i % 2 === 0);

  return allData;
};


export const getDolarPrices = async () => {
  let priceCripto = await
  fetch("https://dolarapi.com/v1/dolares/cripto")
  .then(response => response.json())

  let priceOficial = await
  fetch("https://dolarapi.com/v1/dolares/oficial")
  .then(response => response.json())

  let priceBlue = await
  fetch("https://dolarapi.com/v1/dolares/blue")
  .then(response => response.json())

  const data =[
    priceCripto,
    priceOficial,
    priceBlue
  ]

  return data
}