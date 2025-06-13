
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useDemands } from "@/context/DemandContext";
import { useState } from "react";

interface MonthData {
  month: string;
  repair: number;
  maintenance: number;
  office: number;
  total: number;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const ReportVariation = () => {
  const { getMonthlyReportData } = useDemands();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Generate data for the current year
  const currentYearData = Array.from({ length: 12 }, (_, i) => {
    const data = getMonthlyReportData(i, selectedYear);
    return {
      month: MONTHS[i],
      repair: data.expensesByCategory.repair,
      maintenance: data.expensesByCategory.maintenance,
      office: data.expensesByCategory.office,
      total: data.expensesByCategory.repair + 
             data.expensesByCategory.maintenance + 
             data.expensesByCategory.office
    };
  });
  
  // Generate data for the previous year
  const prevYearData = Array.from({ length: 12 }, (_, i) => {
    const data = getMonthlyReportData(i, selectedYear - 1);
    return {
      month: MONTHS[i],
      repair: data.expensesByCategory.repair,
      maintenance: data.expensesByCategory.maintenance,
      office: data.expensesByCategory.office,
      total: data.expensesByCategory.repair + 
             data.expensesByCategory.maintenance + 
             data.expensesByCategory.office
    };
  });
  
  // Calculate variations month by month
  const variationData = currentYearData.map((current, index) => {
    const prev = prevYearData[index];
    const totalVariation = prev.total > 0 ? 
      ((current.total - prev.total) / prev.total) * 100 : 0;
    
    return {
      month: current.month,
      current: current.total,
      previous: prev.total,
      variation: parseFloat(totalVariation.toFixed(2)),
      // Add specific variations for each category
      repairVariation: prev.repair > 0 ? 
        parseFloat((((current.repair - prev.repair) / prev.repair) * 100).toFixed(2)) : 0,
      maintenanceVariation: prev.maintenance > 0 ? 
        parseFloat((((current.maintenance - prev.maintenance) / prev.maintenance) * 100).toFixed(2)) : 0,
      officeVariation: prev.office > 0 ? 
        parseFloat((((current.office - prev.office) / prev.office) * 100).toFixed(2)) : 0,
    };
  });
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Year-over-Year Variation</CardTitle>
        <CardDescription>
          Comparing expenses between {selectedYear - 1} and {selectedYear}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={variationData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis
                domain={[-100, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Variation']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="variation"
                stroke="#f43f5e"
                strokeWidth={2}
                name="Total Variation %"
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="repairVariation"
                stroke="#3b82f6"
                name="Repair Variation %"
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="maintenanceVariation"
                stroke="#14b8a6"
                name="Maintenance Variation %"
                strokeDasharray="3 3"
              />
              <Line
                type="monotone"
                dataKey="officeVariation"
                stroke="#a855f7"
                name="Office Variation %"
                strokeDasharray="1 1"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Monthly Variations</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Month
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedYear - 1}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedYear}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Variation %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {variationData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      PKR {item.previous.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      PKR {item.current.toLocaleString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${
                      item.variation > 0 ? 'text-green-600' : 
                      item.variation < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {item.variation > 0 ? '+' : ''}{item.variation}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportVariation;
