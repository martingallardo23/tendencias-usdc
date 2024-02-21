import {
  FrequencySlider,
  TimeFrameSlider,
  ChartTypeSlider,
  TypeSlider,
  ExchangeList,
} from "@/components/Sliders";

const LeftPanel = ({ daysSinceFirst }) => {
  return (
    <div
      className="w-[30%] top-0 bottom-0 items-center flex flex-col justify-between gap-8 pt-10 pb-10"
      id="leftPanel"
    >
      <div className="title">Tendencias USDC</div>
      <div className="w-auto flex flex-col justify-between items-center gap-4">
        <TypeSlider />
        <FrequencySlider />
        <TimeFrameSlider daysSinceFirst={daysSinceFirst} />
        <ChartTypeSlider />
        <ExchangeList />
      </div>
      <div className="text-sm text-white text-center w-[80%]">
        Elaborado por Martín Gallardo a partir de{" "}
        <a
          href="https://usdc.ar"
          className="font-semibold text-[var(--sliders-bg)]"
        >
          usdc.ar
        </a>{" "}
        (
        <a
          href="https://twitter.com/ferminrp"
          className="font-semibold text-[var(--sliders-bg)]"
        >
          @ferminrp
        </a>
        ). Código disponible en{" "}
        <a
          href="https://github.com/martingallardo23/tendencias-usdc"
          className="font-semibold text-[#FFD2AD]"
        >
          GitHub
        </a>. <span className="opacity-70"> (Martín está buscando empleo intensamente. Si el sitio te resulta útil por favor considerá <a href="mailto:martin.gallardo23@gmail.com" target="_blank" className=" underline underline-offset-2">contactarlo</a>. ¡Martín puede hacer otras cosas también!)</span>
        .
      </div>
    </div>
  );
};

export default LeftPanel;
