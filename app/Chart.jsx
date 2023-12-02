"use client";

import { drawLineChart, drawBrokerChart } from "./functions";
import { useEffect, useState } from "react";
import { useStore } from "@/store/zustand";

const Chart = () => {
    const [rawData, priceType, chartType, timeType] = useStore((state) => [state.rawData, state.priceType, state.chartType, state.timeType]);

    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    
    useEffect(() => {
        function updateDimensions() {
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            const chartContainer = document.querySelector('#chartContainer');
            if (chartContainer) {
                setDimensions({
                    width: isDesktop ? 0.8 * chartContainer.clientWidth : chartContainer.clientWidth * 0.98,
                    height: isDesktop ? (2 * chartContainer.clientHeight)/3 : chartContainer.clientHeight * 0.95
                });
            }
        }
    
        updateDimensions();
    
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, []); 
    

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
                <svg width={dimensions.width} height={ dimensions.height} id="chart"></svg>
            )}
            <div id="tooltip" style={{ position: 'absolute', visibility: 'hidden', backgroundColor: 'var(--main-bg)', padding: '10px 20px', borderRadius: '9999px', pointerEvents: 'none' , color: "black"}}></div>
        </>
    );
  };
  
export default Chart;
