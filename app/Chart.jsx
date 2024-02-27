"use client";

import { drawLineChart, drawExchangeChart } from "./functions";
import { useEffect, useState } from "react";
import { useStore } from "@/store/zustand";
import { getData } from "@/lib/utils";

const Chart = () => {
  const [priceType, chartType, timeType, timeFrame] = useStore((state) => [
    state.priceType,
    state.chartType,
    state.timeType,
    state.timeFrame,
  ]);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  function updateDimensions() {
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    const chartContainer = document.querySelector("#chartContainer");
    if (chartContainer) {
      setDimensions({
        width: isDesktop
          ? 0.8 * chartContainer.clientWidth
          : chartContainer.clientWidth * 0.98,
        height: isDesktop
          ? (2 * chartContainer.clientHeight) / 3
          : chartContainer.clientHeight * 0.95,
      });
    }
  }

  useEffect(() => {

    async function fetchData() {
      const data = await getData();
      setRawData(data);
      setLoading(false);
      updateDimensions();
    }

    fetchData();

    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!loading) {
    if (dimensions.width && dimensions.height) {
      if (chartType === "exchange") {
        drawExchangeChart(rawData, priceType, timeType, timeFrame);
      } else if (chartType === "average") {
        drawLineChart(rawData, priceType, timeType, timeFrame);
      }
    }}
  }, [loading, dimensions, priceType, chartType, timeType, timeFrame]);

  return (
    <>    
    {loading ? <div className="loader"></div> : 
    <div className="flex flex-col relative">
      {dimensions.width && dimensions.height && (
        <svg
          width={dimensions.width}
          height={dimensions.height}
          id="chart"
        ></svg>
      )}
      <div
        id="tooltip"
        style={{
          position: "fixed",
          visibility: "hidden",
          backgroundColor: "var(--main-bg)",
          padding: "10px 20px",
          borderRadius: "9999px",
          pointerEvents: "none",
          color: "black",
        }}
      ></div>
    </div>
}
    </>
  );
};

export default Chart;
