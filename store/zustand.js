import { create } from 'zustand'

export const useStore = create((set) => ({
    rawData: [],
    priceType: 'bid',
    chartType: 'average',
    timeType: '1h',
    timeFrame: '7d',
    daysSinceFirst : 0,
    setRawData: (data) => set({ rawData: data }),
    setPriceType: (type) => set({ priceType: type }),
    setChartType: (type) => set({ chartType: type }),
    setTimeType: (type) => set({ timeType: type }),
    setTimeFrame: (type) => set({ timeFrame: type }),
    setDaysSinceFirst: (days) => set({ daysSinceFirst: days }),
}))

export const useBrokerList = create((set) => ({
    brokersVisible: {
        belo : true,
        bybit : true,
        ripio : true,
        lemoncash : true,
        buenbit : true,
        fiwind : true,
        tiendacrypto : true,
        satoshitango : true,
        letsbit : true,
    },
    setBrokersVisible: (brokers) => set({ brokersVisible: brokers })
}))

