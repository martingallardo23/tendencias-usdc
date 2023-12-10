import * as d3 from 'd3';

export function findNearestDataPoint(mouseX, data, xScale) {
    return data.reduce((nearest, d) => {
        const dataX = xScale(d3.isoParse(d.created_at));
        const distance = Math.abs(mouseX - dataX);
        return (distance < nearest.distance) ? { distance, point: d } : nearest;
    }, { distance: Infinity, point: null }).point;
}

export function parsePrice (value, valueType) {
    if (valueType === 'ask' || valueType === 'bid' ) {
        const number = Math.round(Number(value) * 100) / 100;
        return `$${number}`
    } else {
        const number = Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;
        return `${number * 100}%`;
    }
}

export function parseDate (value, timeType) {
    const date = d3.isoParse(value);
    const format = timeType === '24h' ? '%d/%m/%Y' : '%d/%m/%Y %H:%M';
    return d3.timeFormat(format)(date);
}

export function roundTime(date, frequency) {
    const rounders = {
        '30m': (d) => {
            const minutes = d.getMinutes();
            d.setMinutes(minutes < 30 ? 0 : 30, 0, 0);
        },
        '1h': (d) => d.setMinutes(0, 0, 0),
        '12h': (d) => d.setHours(d.getHours() < 12 ? 0 : 12, 0, 0, 0),
        '24h': (d) => d.setHours(0, 0, 0, 0)
    };

    date = new Date(date);
    rounders[frequency]?.(date);
    return date;
}

export function isWithinTimeframe(date, timeframe) {
    if (timeframe === 'all') return true;

    const daysBack = parseInt(timeframe, 10);
    const timeframeDate = new Date();
    timeframeDate.setDate(timeframeDate.getDate() - daysBack);

    return new Date(date) >= timeframeDate;
}

export function calculateDaysSinceFirstDataPoint(rawData) {
    const earliestDate = rawData.reduce((minDate, record) => {
        const recordDate = new Date(record.created_at);
        return recordDate < minDate ? recordDate : minDate;
    }, new Date());

    const today = new Date();
    const diffInTime = today - earliestDate;

    return Math.ceil(diffInTime / (1000 * 3600 * 24));
}
