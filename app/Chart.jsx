import { drawLineChart, drawBrokerChart } from "./functions";
import { useEffect } from "react";
import { useStore } from "@/store/zustand";

const Chart = () => {
    const [rawData, priceType, chartType, timeType] = useStore((state) => [state.rawData, state.priceType, state.chartType, state.timeType]);
    useEffect(() => {
        if (chartType === 'broker') {
            drawBrokerChart(rawData, priceType, timeType);
        } else if (chartType === 'average') {
            drawLineChart(rawData, priceType, timeType);
        }
    });

    return (
        <>  
            <svg width="800" height="500" id="chart"></svg>
            <div id="tooltip" style={{ position: 'absolute', visibility: 'hidden', backgroundColor: '#F2F8F2', padding: '10px 20px', borderRadius: '9999px', pointerEvents: 'none' , color: "black"}}></div>
        </>
    );
  };
  
export default Chart;
