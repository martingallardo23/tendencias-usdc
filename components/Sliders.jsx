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
        <div className = 'flex flex-row rounded-full border pl-5 pr-2 pt-1 pb-1 bg-[#D7EAD7] gap-3 items-center slider'> 
            <span className = 'font-bold text-lg'>Período</span> 
            <Tabs defaultValue = '30m' className = 'flex flex-row bg-none'>
              <TabsList className= 'flex flex-row gap-1'>
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
        <div className = 'flex flex-row rounded-full border pl-5 pr-2 pt-1 pb-1 bg-[#D7EAD7] gap-3 items-center slider'> 
            <span className = 'font-bold text-lg'>Precio</span> 
            <Tabs defaultValue = 'bids' className = 'flex flex-row bg-none'>
              <TabsList className= 'flex flex-row gap-1'>
              <TabsTrigger value = 'bids' onClick={() => setPriceType('bid')}>Venta</TabsTrigger>
              <TabsTrigger value = 'ask' onClick={() => setPriceType('ask')}>Compra</TabsTrigger>
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
        <div className = 'flex flex-row rounded-full border pl-5 pr-2 pt-1 pb-1 bg-[#D7EAD7] gap-3 items-center slider'> 
            <span className = 'font-bold text-lg'>Tipo</span> 
            <Tabs defaultValue = 'bids' className = 'flex flex-row bg-none'>
              <TabsList className= 'flex flex-row gap-1'>
              <TabsTrigger value = 'bids' onClick={() => setChartType('average')}>Promedio</TabsTrigger>
              <TabsTrigger value = 'ask' onClick={() => setChartType('broker')}>Todos</TabsTrigger>
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
          <div className = 'text-white w-[80%] flex gap-3 items-center justify-center flex-wrap mt-4 broker-list'>
          {Object.keys(brokersVisible).map(broker => (
              <Toggle className = " flex flex-row items-center gap-2 rounded-full data-[state=on]:bg-[#0F5734]
              data-[state=on]:text-[#D7EAD7] data-[state=off]:text-[#D7EAD7] hover:bg-[#12693F]
              hover:text-black data-[state=on]:hover:outline " name = {broker} defaultPressed = {brokersVisible[broker]} key = {broker}
              onPressedChange = {handleBrokerVisibilityChange} onMouseOver = {hoverOver} onMouseOut = {hoverOut} >
                <div className = 'w-2 h-2 rounded-full' style={{backgroundColor:`var(--${broker})`, outline: '2px solid #D7EAD7'}}></div>
                {broker.charAt(0).toUpperCase() + broker.slice(1)}
                </Toggle>
            ))}
          </div>)
     } else {
      return null;
     }
}
