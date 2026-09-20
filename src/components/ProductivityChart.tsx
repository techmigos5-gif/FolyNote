import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DailyThought, IdeaItem, NavView } from '../types';
import { TrendingUp, Sparkles, BookOpen, Lightbulb, Plus } from 'lucide-react';

interface ProductivityChartProps {
  thoughts: DailyThought[];
  ideas: IdeaItem[];
  onNavigate?: (view: NavView) => void;
}

interface ChartDayData {
  dateKey: string;
  dayName: string;
  displayDate: string;
  fullDate: string;
  thoughtsCount: number;
  ideasCount: number;
  total: number;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({
  thoughts,
  ideas,
  onNavigate,
}) => {
  // Normalize various date formats to YYYY-MM-DD
  const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    try {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
    } catch {
      // ignore
    }
    return '';
  };

  // Build 7-day sequence ending today
  const chartData: ChartDayData[] = useMemo(() => {
    const result: ChartDayData[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dateNum = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${dateNum}`;

      const weekdayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
      const dayName = i === 0 ? 'Today' : `${weekdayShort} ${d.getDate()}`;
      const displayDate = `${monthShort} ${d.getDate()}`;
      const fullDate = d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Count thoughts on this day
      const thoughtsCount = thoughts.filter((t) => normalizeDate(t.date) === dateKey).length;

      // Count ideas on this day
      const ideasCount = ideas.filter((item) => normalizeDate(item.date) === dateKey).length;

      result.push({
        dateKey,
        dayName,
        displayDate,
        fullDate,
        thoughtsCount,
        ideasCount,
        total: thoughtsCount + ideasCount,
      });
    }

    return result;
  }, [thoughts, ideas]);

  // Aggregate stats for the 7-day period
  const totalThoughts = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.thoughtsCount, 0),
    [chartData]
  );
  const totalIdeas = useMemo(
    () => chartData.reduce((acc, curr) => acc + curr.ideasCount, 0),
    [chartData]
  );
  const totalActivity = totalThoughts + totalIdeas;
  const todayTotal = chartData[chartData.length - 1]?.total || 0;

  // Custom polished tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartDayData;
      return (
        <div className="bg-white/95 dark:bg-[#221a30] backdrop-blur-md p-3 rounded-xl shadow-lg border border-accent-100 text-xs space-y-1.5 min-w-[170px]">
          <p className="font-bold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 pb-1">
            {data.fullDate}
          </p>
          <div className="flex items-center justify-between text-amber-700 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Daily Thoughts:
            </span>
            <span className="font-bold">{data.thoughtsCount}</span>
          </div>
          <div className="flex items-center justify-between text-accent-700 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-500" />
              Ideas Sparked:
            </span>
            <span className="font-bold">{data.ideasCount}</span>
          </div>
          <div className="flex items-center justify-between text-gray-800 dark:text-gray-200 font-bold pt-1 border-t border-gray-100 dark:border-gray-800">
            <span>Total Activity:</span>
            <span>{data.total}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="dashboard-productivity-chart-card"
      className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#221a30] border border-accent-100/70 shadow-xs space-y-4 w-full min-w-0 overflow-hidden"
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-50">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent-50 text-accent-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                Productivity Trend
              </h3>
              <p className="text-xs text-gray-500">
                Activity breakdown over the last 7 days
              </p>
            </div>
          </div>
        </div>

        {/* 7-Day Stats Badges */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          <div className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold flex items-center gap-1.5">
            <BookOpen className="w-3 h-3 text-amber-600" />
            <span>{totalThoughts} thoughts</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-accent-50 text-accent-900 border border-accent-200/60 font-semibold flex items-center gap-1.5">
            <Lightbulb className="w-3 h-3 text-accent-600" />
            <span>{totalIdeas} ideas</span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold">
            <span>{totalActivity} total this week</span>
          </div>
        </div>
      </div>

      {/* Recharts Container */}
      <div className="w-full h-64 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--chart-grid)"
            />
            <XAxis
              dataKey="dayName"
              stroke="var(--chart-tick)"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: 'var(--chart-axis)' }}
            />
            <YAxis
              allowDecimals={false}
              stroke="var(--chart-tick)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={35}
              domain={[0, (dataMax: number) => Math.max(3, dataMax + 1)]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
            />
            <Bar
              dataKey="thoughtsCount"
              name="Thoughts"
              fill="#F59E0B"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="ideasCount"
              name="Ideas"
              fill="var(--accent-500)"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Encouraging prompt when user starts fresh */}
      {totalActivity === 0 && (
        <div className="p-3.5 rounded-xl bg-accent-50/50 border border-dashed border-accent-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600">
            <Sparkles className="w-4 h-4 text-accent-600 shrink-0" />
            <span>
              Your real workspace is ready! Log thoughts and capture ideas to start your 7-day productivity streak.
            </span>
          </div>
          {onNavigate && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('daily-thoughts')}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Log Thought</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('ideas')}
                className="px-3 py-1.5 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-semibold transition cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3 h-3" />
                <span>Capture Idea</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
