import { TimeSlider, ChartTypeSlider, TypeSlider, BrokerList } from "@/components/Sliders";

const LeftPanel = () => {

    return(
        <div className ='w-[30%] bg-fgsecondary top-0 bottom-0 h-screen items-center flex flex-col justify-between gap-8 pt-10 pb-10' id = 'leftPanel'>
        <div className = 'title'>Tendencias USDC</div>
        <div className = 'w-auto flex flex-col justify-between items-center gap-4'>
        <TypeSlider/>
        <TimeSlider/>
        <ChartTypeSlider/>    
        <BrokerList/>

        </div>
        <div className = 'text-sm text-white text-center'>
        <span>Elaborado por Martín Gallardo a partir de <a href = 'https://usdc.ar' className = 'font-semibold text-[#D7EAD7]'>usdc.ar</a> (<a href='https://twitter.com/ferminrp' className = 'font-semibold text-[#D7EAD7]'>@ferminrp</a>). </span>

        </div>
        </div>
    )
}

export default LeftPanel;