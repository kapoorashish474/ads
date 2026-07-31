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

const palette = [
  '#4f46e5',
  '#7c3aed',
  '#0ea5e9',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#14b8a6',
  '#6366f1',
  '#84cc16',
  '#64748b',
];
const chartText = '#5c6778';
const chartGrid = 'rgba(15, 23, 42, 0.06)';

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

function ChartCaption({ xAxisLabel, yAxisLabel, note }) {
  if (!xAxisLabel && !yAxisLabel && !note) return null;

  return (
    <p className="chart-caption" aria-label="Chart axes">
      {xAxisLabel && (
        <span className="chart-caption__item">
          <strong>X-axis</strong> {xAxisLabel}
        </span>
      )}
      {yAxisLabel && (
        <span className="chart-caption__item">
          <strong>Y-axis</strong> {yAxisLabel}
        </span>
      )}
      {note && <span className="chart-caption__item chart-caption__item--note">{note}</span>}
    </p>
  );
}

function ChartFrame({ children, xAxisLabel, yAxisLabel, note }) {
  return (
    <div className="chart-wrap">
      {children}
      <ChartCaption xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel} note={note} />
    </div>
  );
}

function categoryAxis(categories) {
  return {
    type: 'category',
    data: categories,
    axisLabel: { fontSize: 11, color: chartText },
    axisLine: { lineStyle: { color: chartGrid } },
  };
}

function valueAxis({ max, formatter } = {}) {
  return {
    type: 'value',
    min: 0,
    max,
    splitLine: { lineStyle: { color: chartGrid } },
    axisLabel: formatter ? { formatter, fontSize: 11, color: chartText } : { fontSize: 11, color: chartText },
  };
}

export function DonutChart({
  title,
  data,
  height,
  note = 'Each segment = share of ad revenue (%)',
}) {
  const sliceCount = data?.length || 0;
  const dense = sliceCount > 5;
  const chartHeight = height ?? (dense ? 340 : 280);

  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 600, color: chartText } } : undefined,
    tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
    legend: dense
      ? {
          type: 'scroll',
          orient: 'vertical',
          right: 0,
          top: 'middle',
          height: '78%',
          textStyle: { fontSize: 11, color: chartText },
          pageIconColor: '#4f46e5',
          pageTextStyle: { color: chartText },
        }
      : undefined,
    series: [
      {
        type: 'pie',
        radius: dense ? ['40%', '58%'] : ['48%', '72%'],
        center: dense ? ['36%', '52%'] : ['50%', '55%'],
        itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 3 },
        label: dense
          ? { show: false }
          : { formatter: '{b}\n{d}%', fontSize: 11, color: chartText },
        labelLine: dense ? { show: false } : { length: 12, length2: 8 },
        emphasis: {
          label: dense ? { show: true, formatter: '{b}\n{d}%', fontSize: 11 } : undefined,
        },
        data: data.map((d) => ({ name: d.name, value: d.pct ?? d.value })),
      },
    ],
  };

  return (
    <ChartFrame note={note}>
      <Chart option={option} height={chartHeight} />
    </ChartFrame>
  );
}

export function BarChart({
  title,
  categories,
  series,
  height = 300,
  horizontal = false,
  xAxisLabel,
  yAxisLabel,
}) {
  const xLabel = xAxisLabel ?? (horizontal ? 'Value' : 'Category');
  const yLabel = yAxisLabel ?? (horizontal ? 'Category' : 'Value');

  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 600, color: chartText } } : undefined,
    tooltip: { trigger: 'axis' },
    grid: {
      left: horizontal ? 100 : 40,
      right: 20,
      top: title ? 40 : 20,
      bottom: horizontal ? 30 : 30,
      containLabel: true,
    },
    xAxis: horizontal
      ? valueAxis()
      : categoryAxis(categories),
    yAxis: horizontal
      ? categoryAxis(categories)
      : valueAxis(),
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      data: s.data,
      barMaxWidth: 32,
      itemStyle: { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
    })),
  };

  return (
    <ChartFrame xAxisLabel={xLabel} yAxisLabel={yLabel}>
      <Chart option={option} height={height} />
    </ChartFrame>
  );
}

export function StackedBarChart({
  title,
  categories,
  series,
  height = 320,
  horizontal = true,
  xAxisLabel = 'Share of revenue (%)',
  yAxisLabel = 'Company',
}) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 600, color: chartText } } : undefined,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        if (!Array.isArray(params)) return '';
        const lines = [`<strong>${params[0].axisValue}</strong>`];
        params
          .filter((p) => p.value > 0)
          .forEach((p) => {
            lines.push(`${p.marker} ${p.seriesName}: ${p.value}%`);
          });
        return lines.join('<br/>');
      },
    },
    legend: { bottom: 0, type: 'scroll' },
    grid: { left: horizontal ? 120 : 40, right: 20, top: title ? 40 : 16, bottom: 56 },
    xAxis: horizontal
      ? valueAxis({ max: 100, formatter: '{value}%' })
      : categoryAxis(categories),
    yAxis: horizontal
      ? categoryAxis(categories)
      : valueAxis({ max: 100, formatter: '{value}%' }),
    series: series.map((s) => ({
      name: s.name,
      type: 'bar',
      stack: 'mix',
      emphasis: { focus: 'series' },
      data: s.data,
      barMaxWidth: horizontal ? 28 : 48,
    })),
  };

  return (
    <ChartFrame xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel}>
      <Chart option={option} height={height} />
    </ChartFrame>
  );
}

export function LineChart({
  title,
  labels,
  series,
  height = 280,
  xAxisLabel = 'Month',
  yAxisLabel = 'Index (0–100)',
}) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 600, color: chartText } } : undefined,
    tooltip: { trigger: 'axis' },
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    grid: {
      left: 40,
      right: 20,
      top: title ? 40 : 20,
      bottom: series.length > 1 ? 50 : 30,
    },
    xAxis: {
      ...categoryAxis(labels),
      boundaryGap: false,
    },
    yAxis: valueAxis(),
    series: series.map((s) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      data: s.data,
      symbol: 'circle',
      symbolSize: 6,
    })),
  };

  return (
    <ChartFrame xAxisLabel={xAxisLabel} yAxisLabel={yAxisLabel}>
      <Chart option={option} height={height} />
    </ChartFrame>
  );
}

export function RadarChart({
  title,
  indicators,
  series,
  height = 320,
  note = 'Each axis = strength dimension (0–100). Lines compare scores across dimensions.',
}) {
  const option = {
    color: palette,
    title: title ? { text: title, left: 0, textStyle: { fontSize: 13, fontWeight: 600, color: chartText } } : undefined,
    tooltip: {},
    legend: series.length > 1 ? { bottom: 0 } : undefined,
    radar: {
      indicator: indicators.map((i) => ({ name: i.label, max: 100 })),
      radius: '58%',
      splitNumber: 4,
    },
    series: [{ type: 'radar', data: series.map((s) => ({ name: s.name, value: s.values })) }],
  };

  return (
    <ChartFrame note={note}>
      <Chart option={option} height={height} />
    </ChartFrame>
  );
}
