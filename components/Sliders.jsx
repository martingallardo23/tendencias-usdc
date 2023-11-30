'use client'; 

import { useStore, useBrokerList } from "@/store/zustand";
import { Tabs,TabsList,TabsTrigger } from "./ui/tabs"
import { Toggle } from "@/components/ui/toggle";
import * as d3 from "d3";

export const TimeSlider = () => {

    const [seTimeType] = useStore((state) => [
        state.setTimeType
      ]);

    
    return (
        <div className = 'flex flex-row rounded-full border pl-6 pr-3 pt-2 pb-2 bg-[#D7EAD7] gap-4 items-center'> 
            <span className = 'font-bold text-lg'>Time</span> 
            <Tabs defaultValue = '30m' className = 'flex flex-row gap-3 bg-none'>
              <TabsList>
              <TabsTrigger value = '30m' onClick={() => seTimeType('30m')}>30m</TabsTrigger>
              <TabsTrigger value = '1h' onClick={() => seTimeType('1h')}>1h</TabsTrigger>
              <TabsTrigger value = '12h' onClick={() => seTimeType('12h')}> 12h </TabsTrigger>
              <TabsTrigger value = '24h' onClick={() => seTimeType('24h')}> 24h </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
    )
}
export const TypeSlider = () => {

    const [setPriceType] = useStore((state) => [
        state.setPriceType
      ]);

    
    return (
        <div className = 'flex flex-row rounded-full border pl-6 pr-3 pt-2 pb-2 bg-[#D7EAD7] gap-4 items-center'> 
            <span className = 'font-bold text-lg'>Type</span> 
            <Tabs defaultValue = 'bids' className = 'flex flex-row gap-3 bg-none'>
              <TabsList>
              <TabsTrigger value = 'bids' onClick={() => setPriceType('bid')}>Bids</TabsTrigger>
              <TabsTrigger value = 'ask' onClick={() => setPriceType('ask')}>Asks</TabsTrigger>
              <TabsTrigger value = 'spread' onClick={() => setPriceType('spread')}> Spread </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
    )
}

export const ChartTypeSlider = () => {
    
    const [setChartType] = useStore((state) => [
        state.setChartType
      ]);

    return (
        <div className = 'flex flex-row rounded-full border pl-6 pr-3 pt-2 pb-2 bg-[#D7EAD7] gap-4 items-center'> 
            <span className = 'font-bold text-lg'>Statistic</span> 
            <Tabs defaultValue = 'bids' className = 'flex flex-row gap-3 bg-none'>
              <TabsList>
              <TabsTrigger value = 'bids' onClick={() => setChartType('average')}>Average</TabsTrigger>
              <TabsTrigger value = 'ask' onClick={() => setChartType('broker')}>All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
    )

}

export const BrokerList = () => {

    const [chartType] = useStore((state) => [
        state.chartType
      ]);
    const [brokersVisible, setBrokersVisible] = useBrokerList((state) => [
        state.brokersVisible,
        state.setBrokersVisible
      ]);


    function handleBrokerVisibilityChange() {
      const broker = event.target.name;
      const isVisible = event.target.ariaPressed == 'true';
      console.log(broker, isVisible)      
      setBrokersVisible({ ...brokersVisible, [broker]: isVisible})
      d3.select(`#line${broker}`)
      .transition()
      .duration(300)
      .style('visibility', isVisible ? 'visible' : 'hidden');
      d3.select(`#lineOverlay${broker}`)
      .style('display', isVisible ? 'block' : 'none')
    }

    function hoverOver() {
      const broker = event.target.name;
      const isVisible = event.target.ariaPressed == 'true';
      if (isVisible) {
        d3.select(`#line${broker}`)
        .transition()
        .duration(300)
        .style('opacity', '1');
      }
    }

    function hoverOut() {
      const broker = event.target.name;
      const isVisible = event.target.ariaPressed == 'true';
      if (isVisible) {
        d3.select(`#line${broker}`)
        .transition()
        .duration(300)
        .style('opacity', '0.2');
      }
    }

    if (chartType == 'broker') {
      return(
          <div className = 'text-white w-[70%] flex gap-3 flex-wrap'>
          {Object.keys(brokersVisible).map(broker => (
              <Toggle className = "rounded-full data-[state=on]:bg-[#0F5734]
              data-[state=on]:text-[#D7EAD7] data-[state=off]:text-[#D7EAD7] hover:bg-[#12693F]
              hover:text-black hover:outline " name = {broker} defaultPressed = {brokersVisible[broker]} key = {broker}
              onPressedChange = {handleBrokerVisibilityChange} onMouseOver = {hoverOver} onMouseOut = {hoverOut} >
                {broker.charAt(0).toUpperCase() + broker.slice(1)}
                </Toggle>
            ))}
          </div>)
     } else {
      return null;
     }
}