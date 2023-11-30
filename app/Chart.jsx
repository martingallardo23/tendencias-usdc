"use client";

import { drawLineChart, drawBrokerChart } from "./functions";
import { useEffect, useState } from "react";
import { useStore } from "@/store/zustand";

const Chart = () => {
    const [rawData, priceType, chartType, timeType] = useStore((state) => [state.rawData, state.priceType, state.chartType, state.timeType]);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        function updateDimensions() {
            const chartContainer = document.querySelector('#chartContainer');
            if (chartContainer) {
                setDimensions({
                    width: chartContainer.clientWidth,
                    height: chartContainer.clientHeight
                });
            }
        }
    
        updateDimensions();
    
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []); // Empty dependency array ensures this runs once on mount
    

    useEffect(() => {
        if (dimensions.width && dimensions.height) {
            if (chartType === 'broker') {
                drawBrokerChart(rawData, priceType, timeType);
            } else if (chartType === 'average') {
                drawLineChart(rawData, priceType, timeType);
            }
        }

    }, [dimensions, rawData, priceType, chartType, timeType]);
    return (
        <>  
             {dimensions.width && dimensions.height && (
                <svg width={0.8 * dimensions.width} height={(2 * dimensions.height) / 3} id="chart"></svg>
            )}
            <div id="tooltip" style={{ position: 'absolute', visibility: 'hidden', backgroundColor: '#F2F8F2', padding: '10px 20px', borderRadius: '9999px', pointerEvents: 'none' , color: "black"}}></div>
        </>
    );
  };
  
export default Chart;
