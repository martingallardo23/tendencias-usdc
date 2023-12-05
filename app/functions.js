"use client";

import * as d3 from 'd3';
import { useBrokerList } from '@/store/zustand';

function isWithinTimeframe(date, timeframe) {
    const currentDate = new Date();
    let timeframeDate;

    switch (timeframe) {
        case '7d':
            timeframeDate = new Date(currentDate.setDate(currentDate.getDate() - 7));
            break;
        case '14d':
            timeframeDate = new Date(currentDate.setDate(currentDate.getDate() - 14));
            break;
        case '30d':
            timeframeDate = new Date(currentDate.setDate(currentDate.getDate() - 30));
            break;
        case 'all':
        default:
            return true;
    }
    
    return new Date(date) >= timeframeDate;
}

export function calculateDaysSinceFirstDataPoint(rawData) {
    const dates = rawData.map(record => new Date(record.created_at));

    const earliestDate = new Date(Math.min(...dates));

    const today = new Date();
    const diffInTime = today.getTime() - earliestDate.getTime();

    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

    return diffInDays;
}

export function calculateAverageData(data, priceType = 'ask', frequency = '1h', timeframe = '7d') {
    let aggregatedData = {};

    data.filter(record => isWithinTimeframe(record.created_at, timeframe)).forEach(record => {
        const roundedTime = roundTime(record.created_at, frequency);
        const key = roundedTime.toISOString();

        if (!aggregatedData[key]) {
        aggregatedData[key] = { sum: 0, count: 0 };
        }

        const singleValues = Object.keys(record)
        .filter(key => key.endsWith(priceType === 'ask' || priceType === 'bid' ? `_total${priceType}` : `_spread_percentage`))
        .map(key => record[key]);

        const averageData = singleValues.reduce((sum, value) => sum + value, 0) / singleValues.length;
        aggregatedData[key].sum += averageData;
        aggregatedData[key].count++;
    });

    return Object.keys(aggregatedData).map(key => ({
        created_at: key,
        average_data: aggregatedData[key].sum / aggregatedData[key].count
    }));
}
  
  export function transformDataForBrokers(rawData, priceType = 'ask', frequency = '1h', timeframe = '7d') {
    let dataByBroker = {};
    const brokers = ['belo', 'bybit', 'ripio', 'lemoncash', 'buenbit', 'fiwind', 'tiendacrypto', 'satoshitango', 'letsbit'];
  
    rawData
    .filter(entry => isWithinTimeframe(entry.created_at, timeframe))
    .forEach(entry => {
      const roundedTime = roundTime(entry.created_at, frequency);
      const key = roundedTime.toISOString();
  
      brokers.forEach(broker => {
        if (!dataByBroker[broker]) {
          dataByBroker[broker] = {};
        }
        if (!dataByBroker[broker][key]) {
          dataByBroker[broker][key] = { sum: 0, count: 0 };
        }
  
        const value = entry[priceType === 'bid' || priceType === 'ask' ? `${broker}_total${priceType}` : `${broker}_spread_percentage`];
        dataByBroker[broker][key].sum += value;
        dataByBroker[broker][key].count++;
      });
    });
  
    Object.keys(dataByBroker).forEach(broker => {
      dataByBroker[broker] = Object.keys(dataByBroker[broker]).map(key => ({
        created_at: key,
        value: dataByBroker[broker][key].sum / dataByBroker[broker][key].count
      }));
    });
  
    return dataByBroker;
  }
  

function roundTime(date, frequency) {
    date = new Date(date);

    switch (frequency) {
        case '30m':
            const minutes = date.getMinutes();
            date.setMinutes(minutes < 30 ? 0 : 30, 0, 0);
            break;
        case '1h':
            date.setMinutes(0, 0, 0);
            break;
        case '12h':
            date.setHours(date.getHours() < 12 ? 0 : 12, 0, 0, 0); 
            break;
        case '24h':
            date.setHours(0, 0, 0, 0); 
            break;
    }
    return date;
}

function setupChart() {
    const svg = d3.select('#chart');
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([height, 0]);

    return { svg, g, x, y, width, height };
}

function findNearestDataPoint(mouseX, data, xScale) {
    let nearestDataPoint = null;
    let nearestDistance = Infinity;

    data.forEach(d => {
        const dataX = xScale(d3.isoParse(d.created_at));
        const distance = Math.abs(mouseX - dataX);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestDataPoint = d;
        }
    });

    return nearestDataPoint;
}

function parsePrice (value, valueType) {
    if (valueType === 'ask' || valueType === 'bid') {
        return `$${Math.round(Number(value) * 100 ) / 100}`
    } else {
        return `${Math.round(Number(value) * 10000) / 100}%`
    }
}

function parseDate (value, timeType) {

    const date = d3.isoParse(value);

    switch(timeType) {
        case '30m':
            return d3.timeFormat('%d/%m/%Y %H:%M')(date);
        case '1h':
            return d3.timeFormat('%d/%m/%Y %H:%M')(date);
        case '12h':
            return d3.timeFormat('%d/%m/%Y %H:%M')(date);
        case '24h':
            return d3.timeFormat('%d/%m/%Y')(date);
    }
}

export function drawLineChart(rawData, priceType, timeType, timeframe) {

    d3.select('#chart').selectAll('*').remove();
    const data = calculateAverageData(rawData, priceType, timeType, timeframe);
    const { svg, g, x, y, width, height } = setupChart();
  
    const line = d3.line()
        .curve(d3.curveMonotoneX)
      .x(d => x(d3.isoParse(d.created_at)))
      .y(d => y(d.average_data));

    const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => {
        return priceType === 'spread' ? `${(d * 100).toFixed(2)}` : `$${d}`;
    });
  
    x.domain(d3.extent(data, d => d3.isoParse(d.created_at)));
    y.domain(d3.extent(data, d => d.average_data));
  
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(8))
  
    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('fill', 'var(--green-main)')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text(priceType === 'ask' || priceType === 'bid' ? '$ARS' : '%');

    const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'var(--orange-main)')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 3)
        .attr('d', line);
  
    const totalLength = path.node().getTotalLength();
  
    path
      .attr('stroke-dasharray', totalLength + " " + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition() 
      .duration(300) 
      .ease(d3.easeSinIn) 
      .attr('stroke-dashoffset', 0);

      g.append('path')
            .datum(data)
            .attr('class', 'line-overlay')
            .style('fill', 'none')
            .attr('d', line)
            .style('stroke', 'transparent') 
            .style('stroke-width', 40) 
            .on('mouseover', () => {
                d3.select('#tooltip')
                    .style('visibility', 'visible')   
            })
            .on('mousemove', function(event, d) {
                const mouseX = d3.pointer(event)[0];
                const nearestDataPoint = findNearestDataPoint(mouseX, data, x);

                if (nearestDataPoint) {

                    const tooltip = d3.select('#tooltip');
                    const tooltipWidth = tooltip.node().getBoundingClientRect().width;
                    const pageWidth = document.body.clientWidth;
                    let left = event.pageX + 10; 
                    if (left + tooltipWidth > pageWidth) {
                        left = event.pageX - tooltipWidth - 10; 
                    }

                    tooltip
                        .html(`<span class="tooltip-title" style="color:var(--green-main)">Promedio</span>
                               <span class="tooltip-price">
                               ${parsePrice(nearestDataPoint.average_data, priceType)}
                               </span>
                               <div class="tooltip-date">
                                ${parseDate(nearestDataPoint.created_at, timeType)}
                                </div>`)
                        .style('top', (event.pageY - 10) + 'px')
                        .style('left', left + 'px');

                        g.selectAll(".hover-dot").remove(); 
                        g.append("circle")
                            .attr("class", "hover-dot")
                            .attr("cx", x(d3.isoParse(nearestDataPoint.created_at)))
                            .attr("cy", y(nearestDataPoint.average_data))
                            .attr("r", 8) 
                            .style("fill", 'var(--orange-main)')
                            .style("stroke", "var(--main-bg)")
                            .style("stroke-width", 2)
                            .style("pointer-events", "none");
                }
            })
            .on('mouseout', () => {
                d3.select('#tooltip').style('visibility', 'hidden');
                g.selectAll(".hover-dot").remove(); 
            });
}


export function drawBrokerChart(data, priceType, timeType, timeframe) {
    d3.select('#chart').selectAll('*').remove();

    const dataByBroker = transformDataForBrokers(data, priceType, timeType, timeframe);

    const {brokersVisible} = useBrokerList.getState();

    const { svg, g, x, y, width, height } = setupChart();

    const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => {
        return priceType === 'spread' ? `${(d * 100).toFixed(2)}` : `$${d}`;
    });

    const xMin = d3.min(Object.values(dataByBroker), brokerData => d3.min(brokerData, d => new Date(d.created_at)));
    const xMax = d3.max(Object.values(dataByBroker), brokerData => d3.max(brokerData, d => new Date(d.created_at)));    
    const yMin = d3.min(Object.values(dataByBroker), brokerData => d3.min(brokerData, d => d.value));
    const yMax = d3.max(Object.values(dataByBroker), brokerData => d3.max(brokerData, d => d.value));

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(7));

    g.append('g')
        .call(yAxis)
        .append('text')
        .attr('fill', 'var(--green-main)')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('text-anchor', 'end')
        .text(priceType === 'ask' || priceType === 'bid' ? '$ARS' : '%');

    const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(d => x( new Date(d.created_at)))
        .y(d => y(d.value));

    Object.keys(dataByBroker).forEach(broker => {

        const data = dataByBroker[broker];

        const path = g.append('path')
            .datum(data)
            .attr('fill', 'none')
            .attr('stroke', 'var(--' + broker)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .attr('stroke-width', 3)
            .attr('d', line)
            .style('visibility', brokersVisible[broker] ? 'visible' : 'hidden')
            .style('opacity', 0.2)
            .attr('id', 'line'+broker);

        const totalLength = path.node().getTotalLength();

        path.attr('stroke-dasharray', totalLength + " " + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition('transition'+broker)
            .duration(200)
            .ease(d3.easeSinIn)
            .attr('stroke-dashoffset', 0);
            
         g.append('path')
            .datum(data)
            .attr('class', 'line-overlay')
            .style('fill', 'none') 
            .attr('d', line)
            .attr('id', 'lineOverlay'+broker)
            .style('display', brokersVisible[broker] ? 'block' : 'none')
            .style('stroke', 'transparent') 
            .style('stroke-width', 25) 
            .on('mouseover', function(event, d) {

                d3.select('#line' + broker)
                    .transition()
                    .duration(200)
                    .style('opacity', 1);
                
                    d3.select('#tooltip')
                    .style('visibility', 'visible')
                    const lineToTop = d3.select(this);
                    lineToTop.node().parentNode.appendChild(lineToTop.node());
                    
                })
            .on('mousemove', function(event, d) {
                const mouseX = d3.pointer(event, this)[0]; 
                const nearestDataPoint = findNearestDataPoint(mouseX, data, x);
                if (nearestDataPoint) {
                    const tooltip = d3.select('#tooltip');
                    const tooltipWidth = tooltip.node().getBoundingClientRect().width;
                    const viewportWidth = window.innerWidth;

                    let left = event.clientX + 10;
                    if (left + tooltipWidth > viewportWidth) {
                        left = event.clientX - tooltipWidth - 10;
                    }
                    tooltip
                        .style('visibility', 'visible')
                        .html(`<span class="tooltip-title" style="color:var(--${broker})">
                            ${broker.charAt(0).toUpperCase() + broker.slice(1)}
                        </span>
                        <span class="tooltip-price">
                            ${parsePrice(nearestDataPoint.value, priceType)}
                        </span>
                        <div class="tooltip-date">
                            ${parseDate(nearestDataPoint.created_at, timeType)}
                        </div>`)
                        .style('top', (event.clientY - 10) + 'px')
                        .style('left', left + 'px');

                    g.selectAll(".hover-dot").remove(); 
                    g.append("circle")
                    .attr("class", "hover-dot")
                    .attr("cx", x(d3.isoParse(nearestDataPoint.created_at)))
                    .attr("cy", y(nearestDataPoint.value))
                    .attr("r", 8) 
                    .style("fill", 'var(--' + broker)
                    .style("stroke", "var(--main-bg)")
                    .style("stroke-width", 2)
                    .style("pointer-events", "none");
                }
            })
            .on('mouseout', () => {
                g.selectAll(".hover-dot").remove(); 
                d3.select('#tooltip').style('visibility', 'hidden')
                d3.select('#line'+broker)
                    .transition()
                    .duration(300)
                    .style('opacity', 0.2);
            });
    });
}
