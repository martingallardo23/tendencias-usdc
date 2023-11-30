import { TimeSlider, ChartTypeSlider, TypeSlider, BrokerList } from "@/components/Sliders";

const LeftPanel = () => {

    return(
        <div className ='w-[30%] bg-fgsecondary top-0 bottom-0 h-screen items-center flex flex-col justify-between gap-8 pt-10 pb-10' id = 'leftPanel'>
        <div className = 'title'>USDC / ARS Trends</div>
        <div className = 'w-auto flex flex-col justify-between items-center gap-4'>
        <TypeSlider/>
        <TimeSlider/>
        <ChartTypeSlider/>    
        <BrokerList/>

        </div>
        <div>
        </div>
        </div>
    )
}

export default LeftPanel;