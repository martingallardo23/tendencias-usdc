"use client";

import * as d3 from 'd3';
import { useBrokerList } from '@/store/zustand';
const axisConfig = {
    color : '#157A49',
    lineColor : '#EAB41F'
};

const brokers = ['belo', 'bybit', 'ripio', 'lemoncash', 'buenbit', 'fiwind', 'tiendacrypto', 'satoshitango'];

const colorPaletteAlt = {
    belo : '#3c00fe',
    bybit : '#522298',
    ripio : '#7809fe',
    lemoncash : '#4beb55',
    buenbit : '#ffabea',
    fiwind : '#f9bd06',
    tiendacrypto : '#6761ab',
    satoshitango : '#1d43fc'
}

function getColor(broker) {
    return colorPaletteAlt[broker] || '#000000'; 
}
export function calculateAverageData(data, type = 'ask', timeframe = '30m') {
    let aggregatedData = {};

    data.forEach(record => {
        const roundedTime = roundTime(record.created_at, timeframe);
        const key = roundedTime.toISOString();

        if (!aggregatedData[key]) {
        aggregatedData[key] = { sum: 0, count: 0 };
        }

        const singleValues = Object.keys(record)
        .filter(key => key.endsWith(type === 'ask' || type === 'bid' ? `_total${type}` : `_spread_percentage`))
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
  
  export function transformDataForBrokers(rawData, valueType, timeframe = '30m') {
    let dataByBroker = {};
    const brokers = ['belo', 'bybit', 'ripio', 'lemoncash', 'buenbit', 'fiwind', 'tiendacrypto', 'satoshitango'];
  
    rawData.forEach(entry => {
      const roundedTime = roundTime(entry.created_at, timeframe);
      const key = roundedTime.toISOString();
  
      brokers.forEach(broker => {
        if (!dataByBroker[broker]) {
          dataByBroker[broker] = {};
        }
        if (!dataByBroker[broker][key]) {
          dataByBroker[broker][key] = { sum: 0, count: 0 };
        }
  
        const value = entry[valueType === 'bid' || valueType === 'ask' ? `${broker}_total${valueType}` : `${broker}_spread_percentage`];
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
  

function roundTime(date, timeframe) {
    date = new Date(date);

    switch (timeframe) {
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

export function drawLineChart(rawData, priceType, timeType) {

    const data = calculateAverageData(rawData, priceType, timeType);
    d3.select('#chart').selectAll('*').remove();
    const { svg, g, x, y, width, height } = setupChart();
  
    const line = d3.line()
        .curve(d3.curveMonotoneX)
      .x(d => x(d3.isoParse(d.created_at)))
      .y(d => y(d.average_data));

    const yAxis = d3.axisLeft(y).tickFormat(d => {
        return priceType === 'spread' ? `${(d * 100).toFixed(2)}` : `$${d}`;
    });
  
    x.domain(d3.extent(data, d => d3.isoParse(d.created_at)));
    y.domain(d3.extent(data, d => d.average_data));
  
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
  
    g.append('g')
      .call(yAxis)
      .append('text')
      .attr('fill', axisConfig.color)
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text(priceType === 'ask' || priceType === 'bid' ? '$ARS' : '%');

    const path = g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', axisConfig.lineColor)
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
            .on('mouseover', function(event, d) {
                d3.select('#tooltip')
                    .style('visibility', 'visible')   
            })
            .on('mousemove', function(event, d) {
                const mouseX = d3.pointer(event)[0];
                const nearestDataPoint = findNearestDataPoint(mouseX, data, x);
                if (nearestDataPoint) {
                    d3.select('#tooltip')
                        .html(`<span class="tooltip-title" style="color:${axisConfig.color}">Promedio</span>
                               <span class="tooltip-price">
                               ${parsePrice(nearestDataPoint.average_data, priceType)}
                               </span>
                               <div class="tooltip-date">
                                ${parseDate(nearestDataPoint.created_at, timeType)}
                                </div>`)
                        .style('top', (event.pageY - 10) + 'px')
                        .style('left', (event.pageX + 10) + 'px');

                        g.selectAll(".hover-dot").remove(); 
                        g.append("circle")
                            .attr("class", "hover-dot")
                            .attr("cx", x(d3.isoParse(nearestDataPoint.created_at)))
                            .attr("cy", y(nearestDataPoint.average_data))
                            .attr("r", 8) 
                            .style("fill", axisConfig.lineColor)
                            .style("stroke", "#F2F8F2")
                            .style("stroke-width", 2)
                            .style("pointer-events", "none");
                }
            })
            .on('mouseout', function() {
                d3.select('#tooltip').style('visibility', 'hidden');
                g.selectAll(".hover-dot").remove(); 
            });
}


export function drawBrokerChart(data, priceType, timeType) {
    d3.select('#chart').selectAll('*').remove();

    const dataByBroker = transformDataForBrokers(data, priceType, timeType);

    const {brokersVisible} = useBrokerList.getState();

    const { svg, g, x, y, width, height } = setupChart();

    const yAxis = d3.axisLeft(y).tickFormat(d => {
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
        .call(d3.axisBottom(x));

    g.append('g')
        .call(yAxis)
        .append('text')
        .attr('fill', axisConfig.color)
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
            .attr('stroke', getColor(broker))
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
            .transition()
            .duration(300)
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
            .style('stroke-width', 20) 
            .on('mouseover', function(event, d) {

                d3.select('#line'+broker)
                    .transition()
                    .duration(200)
                    .style('opacity', 1);
                
                    d3.select('#tooltip')
                    .style('visibility', 'visible')
                    
                })
            .on('mousemove', function(event, d) {
                const mouseX = d3.pointer(event)[0];
                const nearestDataPoint = findNearestDataPoint(mouseX, data, x);
                if (nearestDataPoint) {
                    d3.select('#tooltip')
                    .style('visibility', 'visible')
                    .html(`<span class="tooltip-title" style="color:${getColor(broker)}">${broker.charAt(0).toUpperCase() + broker.slice(1)}</span>
                    <span class="tooltip-price">
                        ${parsePrice(nearestDataPoint.value, priceType)}
                    </span>
                    <div class="tooltip-date">
                        ${parseDate(nearestDataPoint.created_at, timeType)}
                    </div>`)
                    .style('top', (event.pageY - 10) + 'px')
                    .style('left', (event.pageX + 10) + 'px');

                    g.selectAll(".hover-dot").remove(); 
                    g.append("circle")
                    .attr("class", "hover-dot")
                    .attr("cx", x(d3.isoParse(nearestDataPoint.created_at)))
                    .attr("cy", y(nearestDataPoint.value))
                    .attr("r", 8) 
                    .style("fill", getColor(broker) )
                    .style("stroke", "#F2F8F2")
                    .style("stroke-width", 2)
                    .style("pointer-events", "none");
                }
            })
            .on('mouseout', function() {
                g.selectAll(".hover-dot").remove(); 
                d3.select('#tooltip').style('visibility', 'hidden')
                d3.select('#line'+broker)
                    .transition()
                    .duration(300)
                    .style('opacity', 0.2);
            });
    });
}
