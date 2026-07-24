import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart as EBarChart, LineChart as ELineChart, PieChart, RadarChart as ERadarChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  EBarChart,
  ELineChart,
  PieChart,
  ERadarChart,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
  CanvasRenderer,
]);

const palette = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#64748b'];

function Chart({ option, height = 280 }) {
  const ref = useRef(null);
  const instance = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    instance.current = echarts.init(ref.current);
    const onResize = () => instance.current?.resize();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      instance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    instance.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} style={{ height, width: '100%' }} />;
}

export function DonutChart({ title, data, height = 280 }) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 500, color: '#64748b' } } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '55%'],
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { formatter: '{b}\n{d}%', fontSize: 11 },
        data: data.map((d) => ({ name: d.name, value: d.pct ?? d.value })),
      },
    ],
  };
  return <Chart option={option} height={height} />;
}

export function BarChart({ title, categories, series, height = 300, horizontal = false }) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 500, color: '#64748b' } } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: horizontal ? 100 : 40, right: 20, top: title ? 40 : 20, bottom: 30 },
    xAxis: horizontal ? { type: 'value' } : { type: 'category', data: categories, axisLabel: { fontSize: 11 } },
    yAxis: horizontal ? { type: 'category', data: categories, axisLabel: { fontSize: 11 } } : { type: 'value' },
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barMaxWidth: 32,
      itemStyle: { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
    })),
  };
  return <Chart option={option} height={height} />;
}

export function LineChart({ title, labels, series, height = 280 }) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 500, color: '#64748b' } } : undefined,
    tooltip: { trigger: 'axis' },
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    grid: { left: 40, right: 20, top: title ? 40 : 20, bottom: series.length > 1 ? 50 : 30 },
    xAxis: { type: 'category', data: labels, boundaryGap: false },
    yAxis: { type: 'value', min: 0 },
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      symbol: 'circle',
      symbolSize: 6,
    })),
  };
  return <Chart option={option} height={height} />;
}

export function RadarChart({ title, indicators, series, height = 320 }) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 500, color: '#64748b' } } : undefined,
    tooltip: {},
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    radar: {
      indicator: indicators.map((i) => ({ name: i.label, max: 100 })),
      radius: '58%',
      splitNumber: 4,
    },
    series: [{ type: 'radar', data: series.map((s) => ({ name: s.name, value: s.values })) }],
  };
  return <Chart option={option} height={height} />;
}
