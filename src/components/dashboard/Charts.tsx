
import { 
  ResponsiveContainer, 
  PieChart as RechartPieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RechartsLineChart,
  Line,
  Legend,
  TooltipProps,
  Area,
  AreaChart as RechartsAreaChart,
  ComposedChart
} from "recharts";

// PieChart component
interface PieChartProps {
  data: { name: string; value: number; color: string }[];
  valueFormatter?: (value: number) => string;
  showPercentage?: boolean;
}

export const PieChart = ({ 
  data, 
  valueFormatter = (value) => `${value}`,
  showPercentage = true 
}: PieChartProps) => {
  if (!data.length) return null;

  const filteredData = data.filter(item => item.value > 0);
  
  // If no data has value > 0, show empty state
  if (!filteredData.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const total = filteredData.reduce((sum, item) => sum + item.value, 0);
      const percentage = ((payload[0].value as number) / total * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-blue-600">{valueFormatter(payload[0].value as number)}</p>
          {showPercentage && <p className="text-gray-500">{percentage}% of total</p>}
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ name, percent }: any) => {
    return showPercentage ? `${name} ${(percent * 100).toFixed(0)}%` : name;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartPieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={100}
          innerRadius={45}
          fill="#8884d8"
          dataKey="value"
          label={renderLabel}
          fontSize={12}
        >
          {filteredData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
          ))}
        </Pie>
        <RechartsTooltip content={<CustomTooltip />} />
      </RechartPieChart>
    </ResponsiveContainer>
  );
};

// Enhanced BarChart component
interface BarChartProps {
  data: any[];
  variant?: "default" | "stacked" | "simple" | "comparison";
  valueFormatter?: (value: number) => string;
  showGrid?: boolean;
  showLegend?: boolean;
}

export const BarChart = ({ 
  data, 
  variant = "default", 
  valueFormatter = (value) => `${value}`,
  showGrid = true,
  showLegend = true
}: BarChartProps) => {
  // Return empty state if no data
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  // Handle simple variant (single bar per category)
  if (variant === "simple") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip
            formatter={(value: number) => [valueFormatter(value), "Value"]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  // Handle comparison variant
  if (variant === "comparison") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip
            formatter={(value: number, name: string) => [valueFormatter(value), name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          {showLegend && <Legend />}
          <Bar dataKey="current" name="Current Month" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="previous" name="Previous Month" fill="#94a3b8" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="trend" name="Trend" stroke="#ef4444" strokeWidth={2} />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  // Handle trend data (default and stacked variants)
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-medium" style={{ color: entry.color }}>
              {`${entry.name}: ${valueFormatter(entry.value as number)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data} barGap={8} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />}
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tickFormatter={(value) => value.toLocaleString()} 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        
        {variant === "stacked" ? (
          <>
            <Bar dataKey="approved" stackId="a" name="Approved" fill="#22c55e" radius={[0, 0, 0, 0]} />
            <Bar dataKey="pending" stackId="a" name="Pending" fill="#eab308" radius={[0, 0, 0, 0]} />
            <Bar dataKey="rejected" stackId="a" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </>
        ) : (
          <>
            <Bar dataKey="total" name="Total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            <Bar dataKey="approved" name="Approved" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="rejected" name="Rejected" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </>
        )}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

// Enhanced LineChart component
interface LineChartProps {
  data: any[];
  valueFormatter?: (value: number) => string;
  showArea?: boolean;
  multiLine?: boolean;
}

export const LineChart = ({ 
  data, 
  valueFormatter = (value) => `${value}`,
  showArea = false,
  multiLine = true
}: LineChartProps) => {
  // Return empty state if no data
  if (!data.length) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg text-sm">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-medium" style={{ color: entry.color }}>
              {`${entry.name}: ${valueFormatter(entry.value as number)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (showArea) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            tickFormatter={(value) => value.toLocaleString()} 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <RechartsTooltip content={<CustomTooltip />} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="total" 
            name="Total" 
            stroke="#6366f1" 
            fill="#6366f1" 
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {multiLine && (
            <>
              <Area 
                type="monotone" 
                dataKey="approved" 
                name="Approved" 
                stroke="#22c55e" 
                fill="#22c55e" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="rejected" 
                name="Rejected" 
                stroke="#ef4444" 
                fill="#ef4444" 
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </>
          )}
        </RechartsAreaChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          tickFormatter={(value) => value.toLocaleString()} 
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <RechartsTooltip content={<CustomTooltip />} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="total" 
          name="Total" 
          stroke="#6366f1" 
          strokeWidth={3} 
          activeDot={{ r: 6, fill: '#6366f1' }}
          dot={{ r: 4, fill: '#6366f1' }}
        />
        {multiLine && (
          <>
            <Line 
              type="monotone" 
              dataKey="approved" 
              name="Approved" 
              stroke="#22c55e" 
              strokeWidth={2}
              activeDot={{ r: 5, fill: '#22c55e' }}
              dot={{ r: 3, fill: '#22c55e' }}
            />
            <Line 
              type="monotone" 
              dataKey="rejected" 
              name="Rejected" 
              stroke="#ef4444" 
              strokeWidth={2}
              activeDot={{ r: 5, fill: '#ef4444' }}
              dot={{ r: 3, fill: '#ef4444' }}
            />
          </>
        )}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};