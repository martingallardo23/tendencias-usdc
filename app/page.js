import { getDolarPrices } from "@/lib/utils";
import Chart from "./Chart";
import LeftPanel from "./LeftPanel";

export const revalidate = 1800;

export default async function Home() {

  // const rawData = await getData();
  // const daysSinceFirst = calculateDaysSinceFirstDataPoint(rawData);
  const cotizaciones = await getDolarPrices();
  return (
    <>
    <LeftPanel daysSinceFirst={94} />
    
    <div className="fixed top-0 right-0 flex flex-row justify-center items-center h-[100vh] w-[70%]" id="chartContainer">
      <div className='flex flex-row items-center justify-center m-auto h-full'>
        <Chart cotizaciones = {cotizaciones} />
      </div>
    </div>
    <div className='title-secondary'>
      Tendencias USDC
    </div>
    

</>
  )
}
