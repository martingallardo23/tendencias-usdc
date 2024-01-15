"use client";

import * as d3 from 'd3';
import { useExchangeList } from '@/store/zustand';
import { parsePrice, parseDate, findNearestDataPoint, roundTime, isWithinTimeframe } from '@/lib/aux-functions';

function makeGuideLines(g) {

  const color = "#B0D4B0"
  const guideLineVertical = g.append('line')
    .attr('class', 'guide-line')
    .style('stroke', color)
    .style('stroke-dasharray', '5,5')
    .style('opacity', 0);

  const guideLineHorizontal = g.append('line')
    .attr('class', 'guide-line')
    .style('stroke', color)
    .style('stroke-dasharray', '5,5')
    .style('opacity', 0);

  return [guideLineVertical, guideLineHorizontal];
}

function getAverageData(data, priceType = 'ask', frequency = '1h', timeframe = '7d') {
  let aggregatedData = {};

  data
    .filter(record => isWithinTimeframe(record.created_at, timeframe))
    .forEach(record => {
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
    value: aggregatedData[key].sum / aggregatedData[key].count
  }));
}

function getExchangeData(data, priceType = 'ask', frequency = '1h', timeframe = '7d') {
  let dataByExchange = {};

  const { exchangesVisible } = useExchangeList.getState();

  const exchanges = Object.keys(exchangesVisible)

  data
    .filter(record => isWithinTimeframe(record.created_at, timeframe))
    .forEach(record => {
      const roundedTime = roundTime(record.created_at, frequency);
      const key = roundedTime.toISOString();

      exchanges.forEach(exchange => {
        if (!dataByExchange[exchange]) {
          dataByExchange[exchange] = {};
        }
        if (!dataByExchange[exchange][key]) {
          dataByExchange[exchange][key] = { sum: 0, count: 0 };
        }

        const value = record[priceType === 'bid' || priceType === 'ask' ? `${exchange}_total${priceType}` : `${exchange}_spread_percentage`];
        dataByExchange[exchange][key].sum += value;
        dataByExchange[exchange][key].count++;
      });
    });

  Object.keys(dataByExchange).forEach(exchange => {
    dataByExchange[exchange] = Object.keys(dataByExchange[exchange]).map(key => ({
      created_at: key,
      value: dataByExchange[exchange][key].sum / dataByExchange[exchange][key].count
    }));
  });

  return dataByExchange;
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

export function drawLineChart(rawData, priceType, timeType, timeframe) {

  d3.select('#chart').selectAll('*').remove();
  const data = getAverageData(rawData, priceType, timeType, timeframe);
  const { svg, g, x, y, width, height } = setupChart();

  const [guideLineVertical, guideLineHorizontal] = makeGuideLines(g);

  const line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(d => x(d3.isoParse(d.created_at)))
    .y(d => y(d.value));

  const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => {
      return priceType === 'spread' ? `${(d * 100).toFixed(2)}` : `$${d}`;
    });

  x.domain(d3.extent(data, d => d3.isoParse(d.created_at)));
  y.domain(d3.extent(data, d => d.value));

  const yMin = d3.min(data, d => d.value);

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
    .on('mousemove', function (event, d) {
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


        guideLineVertical
          .attr('x1', x(d3.isoParse(nearestDataPoint.created_at)))
          .attr('x2', x(d3.isoParse(nearestDataPoint.created_at)))
          .attr('y1', y(yMin))
          .attr('y2', y(nearestDataPoint.value))
          .transition()
          .duration(50)
          .style('opacity', 1);

        guideLineHorizontal
          .attr('x1', 0)
          .attr('x2', x(d3.isoParse(nearestDataPoint.created_at)))
          .attr('y1', y(nearestDataPoint.value))
          .attr('y2', y(nearestDataPoint.value))
          .transition()
          .duration(50)
          .style('opacity', 1);

        tooltip
          .html(`<span class="tooltip-title" style="color:var(--green-main)">Promedio</span>
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
          .style("fill", 'var(--orange-main)')
          .style("stroke", "var(--main-bg)")
          .style("stroke-width", 2)
          .style("pointer-events", "none");
      }
    })
    .on('mouseout', () => {
      d3.select('#tooltip').style('visibility', 'hidden');
      g.selectAll(".hover-dot").remove();

      guideLineVertical
        .transition()
        .duration(50)
        .style('opacity', 0);
      guideLineHorizontal
        .transition()
        .duration(50)
        .style('opacity', 0);
    });
}

export function drawExchangeChart(data, priceType, timeType, timeframe) {
  d3.select('#chart').selectAll('*').remove();

  const dataByExchange = getExchangeData(data, priceType, timeType, timeframe);

  const { exchangesVisible } = useExchangeList.getState();

  const { svg, g, x, y, width, height } = setupChart();

  const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => {
      return priceType === 'spread' ? `${(d * 100).toFixed(2)}` : `$${d}`;
    });

  const xMin = d3.min(Object.values(dataByExchange), data => d3.min(data, d => new Date(d.created_at)));
  const xMax = d3.max(Object.values(dataByExchange), data => d3.max(data, d => new Date(d.created_at)));
  const yMin = d3.min(Object.values(dataByExchange), data => d3.min(data, d => d.value));
  const yMax = d3.max(Object.values(dataByExchange), data => d3.max(data, d => d.value));

  x.domain([xMin, xMax]);
  y.domain([yMin, yMax]);

  const [guideLineVertical, guideLineHorizontal] = makeGuideLines(g);

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
    .x(d => x(new Date(d.created_at)))
    .y(d => y(d.value));


  Object.keys(dataByExchange).forEach(exchange => {

    const data = dataByExchange[exchange];

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--' + exchange + ")")
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke-width', 3)
      .attr('d', line)
      .style('visibility', exchangesVisible[exchange] ? 'visible' : 'hidden')
      .style('opacity', 0.2)
      .attr('id', 'line' + exchange);

    const totalLength = path.node().getTotalLength();

    path.attr('stroke-dasharray', totalLength + " " + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition('transition' + exchange)
      .duration(200)
      .ease(d3.easeSinIn)
      .attr('stroke-dashoffset', 0);

    g.append('path')
      .datum(data)
      .attr('class', 'line-overlay')
      .style('fill', 'none')
      .attr('d', line)
      .attr('id', 'lineOverlay' + exchange)
      .style('display', exchangesVisible[exchange] ? 'block' : 'none')
      .style('stroke', 'transparent')
      .style('stroke-width', 25)
      .on('mouseover', function (event, d) {

        const exchangeLine = d3.select('#line' + exchange);

        d3.select('#tooltip')
          .style('visibility', 'visible')

        exchangeLine
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('stroke-width', 4);

        exchangeLine
          .node().parentNode.appendChild(exchangeLine.node());

        const lineOverlay = d3.select(this)

        lineOverlay
          .node().parentNode.appendChild(lineOverlay.node());

      })
      .on('mousemove', function (event, d) {
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

          guideLineVertical
            .attr('x1', x(d3.isoParse(nearestDataPoint.created_at)))
            .attr('x2', x(d3.isoParse(nearestDataPoint.created_at)))
            .attr('y1', y(yMin))
            .attr('y2', y(nearestDataPoint.value))
            .transition()
            .duration(50)
            .style('opacity', 1);

          guideLineHorizontal
            .attr('x1', 0)
            .attr('x2', x(d3.isoParse(nearestDataPoint.created_at)))
            .attr('y1', y(nearestDataPoint.value))
            .attr('y2', y(nearestDataPoint.value))
            .transition()
            .duration(50)
            .style('opacity', 1);

          tooltip
            .style('visibility', 'visible')
            .html(`<span class="tooltip-title" style="color:var(--${exchange})">
                            ${exchange.charAt(0).toUpperCase() + exchange.slice(1)}
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
            .style("fill", 'var(--' + exchange)
            .style("stroke", "var(--main-bg)")
            .style("stroke-width", 2)
            .style("pointer-events", "none");
        }
      })
      .on('mouseout', () => {
        g.selectAll(".hover-dot").remove();
        d3.select('#tooltip').style('visibility', 'hidden')
        d3.select('#line' + exchange)
          .transition()
          .duration(300)
          .style('opacity', 0.2)
          .attr('stroke-width', 3);

        guideLineVertical
          .transition()
          .duration(50)
          .style('opacity', 0);
        guideLineHorizontal
          .transition()
          .duration(50)
          .style('opacity', 0);
      });
  });
}
