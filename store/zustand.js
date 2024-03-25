import { create } from 'zustand'

export const useStore = create((set) => ({
    rawData: [],
    priceType: 'bid',
    chartType: 'average',
    timeType: '1h',
    timeFrame: '7d',
    daysSinceFirst: 0,
    setRawData: (data) => set({ rawData: data }),
    setPriceType: (type) => set({ priceType: type }),
    setChartType: (type) => set({ chartType: type }),
    setTimeType: (type) => set({ timeType: type }),
    setTimeFrame: (type) => set({ timeFrame: type }),
    setDaysSinceFirst: (days) => set({ daysSinceFirst: days }),
}))

export const useExchangeList = create((set) => ({
    exchangesVisible: {
        trubit: true,
        latamex: true,
        cocoscrypto: true,
        vibrant: true,
        belo: true,
        bybitp2p:true,
        ripio: true,
        lemoncash: true,
        buenbit: true,
        fiwind: true,
        tiendacrypto: true,
        satoshitango: true,
        letsbit: true,
    },
    setExchangesVisible: (exchanges) => set({ exchangesVisible: exchanges })
}))

