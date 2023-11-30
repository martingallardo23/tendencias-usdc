import { drawLineChart, drawBrokerChart } from "./functions";
import { useEffect } from "react";
import { useStore } from "@/store/zustand";

const Chart = () => {
    const [rawData, bidData, askData, spreadData, 
        brokerBidData, brokerAskData,  brokerSpreadData, priceType, chartType, timeType] = useStore((state) => [state.rawData, state.averageBidData, state.averageAskData,
        state.averageSpreadData, state.brokerBidData, state.brokerAskData, state.brokerSpreadData, state.priceType, state.chartType, state.timeType]);

    if (priceType === 'ask') {
        if (chartType === 'broker') {
            var data = brokerAskData;
        } else if (chartType === 'average') {
            var data = askData;
        }
    } else if (priceType === 'bid') {
        if (chartType === 'broker') {
            var data = brokerBidData;
        } else if (chartType === 'average') {
            var data = bidData;
        }
    } else if (priceType === 'spread') {
        if (chartType === 'broker') {
            var data = brokerSpreadData;
        } else if (chartType === 'average') {
            var data = spreadData;
        }
    }

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
