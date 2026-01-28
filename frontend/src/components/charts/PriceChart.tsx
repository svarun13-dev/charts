import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'
import { format } from 'date-fns'
import type { HistoricalDataPoint } from '../../types'

interface Props {
  data: HistoricalDataPoint[]
  symbol: string
}

export default function PriceChart({ data, symbol }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        Loading chart data...
      </div>
    )
  }

  const chartData = data.map((point) => ({
    ...point,
    date: format(new Date(point.timestamp), 'MMM dd'),
    fullDate: format(new Date(point.timestamp), 'MMM dd, yyyy'),
  }))

  const minPrice = Math.min(...data.map((d) => d.low))
  const maxPrice = Math.max(...data.map((d) => d.high))
  const priceRange = maxPrice - minPrice
  const yDomain = [minPrice - priceRange * 0.1, maxPrice + priceRange * 0.1]

  const priceChange = data.length > 1
    ? ((data[data.length - 1].close - data[0].close) / data[0].close) * 100
    : 0
  const isPositive = priceChange >= 0

  return (
    <div>
      {/* Stats */}
      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <span className="text-gray-400">Current:</span>
          <span className="ml-2 text-white font-medium">
            ${data[data.length - 1]?.close.toLocaleString()}
          </span>
        </div>
        <div>
          <span className="text-gray-400">30d Change:</span>
          <span
            className={`ml-2 font-medium ${
              isPositive ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {isPositive ? '+' : ''}
            {priceChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={isPositive ? '#22c55e' : '#ef4444'}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={isPositive ? '#22c55e' : '#ef4444'}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#9ca3af' }}
              formatter={(value: number) => [
                `$${value.toLocaleString()}`,
                'Price',
              ]}
              labelFormatter={(label: string, payload: any[]) =>
                payload[0]?.payload?.fullDate || label
              }
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke={isPositive ? '#22c55e' : '#ef4444'}
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
        <span>30-day price history for {symbol}</span>
      </div>
    </div>
  )
}
