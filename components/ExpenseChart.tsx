"use client";

interface ChartDataPoint {
  month: string;
  total: number;
}

export function ExpenseChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) return null;

  // Take latest 6 items for better layout spacing if list is too long, and reverse to chronological order
  const chartData = data.slice(0, 6).reverse();
  const maxValue = Math.max(...chartData.map((d) => d.total), 1);

  // SVG dimensions
  const svgWidth = 500;
  const svgHeight = 240;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const barWidth = Math.min(30, (chartWidth / chartData.length) * 0.4);
  const colWidth = chartWidth / chartData.length;

  // Grid ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 dark:text-slate-500">
        แนวโน้มรายจ่าย / Expense Trend
      </h3>
      <div className="relative w-full aspect-[500/240]">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" className="overflow-visible">
          <defs>
            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#c5a880" />
              <stop offset="100%" stopColor="#c5a880" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {ticks.map((t, idx) => {
            const y = paddingTop + chartHeight * (1 - t);
            const val = maxValue * t;
            return (
              <g key={idx} className="opacity-60">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="text-slate-100 dark:text-slate-800/80"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[9px] font-mono fill-slate-400 dark:fill-slate-600 font-semibold"
                >
                  {val >= 1000 ? `฿${(val / 1000).toFixed(0)}k` : `฿${val.toFixed(0)}`}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {chartData.map((d, idx) => {
            const pct = d.total / maxValue;
            const bHeight = chartHeight * pct;
            const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
            const y = paddingTop + chartHeight - bHeight;

            // Shorten monthly labels for display (e.g., '2026-07' -> '07/26')
            let displayLabel = d.month;
            if (d.month.includes("-")) {
              const parts = d.month.split("-");
              displayLabel = `${parts[1]}/${parts[0].slice(2)}`;
            }

            return (
              <g key={d.month} className="group">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(4, bHeight)}
                  rx="3"
                  className="fill-[url(#barGrad)] transition-all duration-300 hover:fill-[#b2936a] cursor-pointer"
                />
                {/* Hover value label */}
                <text
                  x={x + barWidth / 2}
                  y={y - 8}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-800 dark:fill-slate-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-mono"
                >
                  ฿{d.total.toLocaleString()}
                </text>
                {/* X axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  className="text-[9px] font-bold fill-slate-400 dark:fill-slate-500 font-sans"
                >
                  {displayLabel}
                </text>
              </g>
            );
          })}
          
          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-slate-200 dark:text-slate-800"
          />
        </svg>
      </div>
    </div>
  );
}
