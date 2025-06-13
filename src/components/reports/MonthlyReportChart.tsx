
import { useState } from "react";
import { useDemands } from "@/context/DemandContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, TooltipProps } from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { exportMonthlyReportToExcel } from "@/utils/excelExport";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MonthlyReportChart = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const { getMonthlyReportData } = useDemands();
  
  const reportData = getMonthlyReportData(selectedMonth, selectedYear);
  
  const chartData = [
    {
      name: "Total",
      value: reportData.totalDemands,
      fill: "#6366f1",
    },
    {
      name: "Approved",
      value: reportData.approvedDemands,
      fill: "#22c55e",
    },
    {
      name: "Rejected",
      value: reportData.rejectedDemands,
      fill: "#ef4444",
    },
    {
      name: "Pending",
      value: reportData.pendingDemands,
      fill: "#eab308",
    },
  ];
  
  const expenseData = [
    {
      name: "Repair",
      value: reportData.expensesByCategory.repair,
      fill: "#3b82f6",
    },
    {
      name: "Maintenance",
      value: reportData.expensesByCategory.maintenance,
      fill: "#14b8a6",
    },
    {
      name: "Office Use",
      value: reportData.expensesByCategory.office,
      fill: "#a855f7",
    },
  ];
  
  const downloadTextReport = () => {
    // In a real app, generate a PDF report with detailed data
    const reportTitle = `Monthly Report - ${MONTHS[selectedMonth]} ${selectedYear}`;
    const reportContent = `
    ${reportTitle}
    
    Demand Summary:
    - Total Demands: ${reportData.totalDemands}
    - Approved Demands: ${reportData.approvedDemands}
    - Rejected Demands: ${reportData.rejectedDemands}
    - Pending Demands: ${reportData.pendingDemands}
    
    Expense Summary:
    - Repair Expenses: PKR ${reportData.expensesByCategory.repair.toLocaleString()}
    - Maintenance Expenses: PKR ${reportData.expensesByCategory.maintenance.toLocaleString()}
    - Office Use Expenses: PKR ${reportData.expensesByCategory.office.toLocaleString()}
    - Total Expenses: PKR ${(
      reportData.expensesByCategory.repair +
      reportData.expensesByCategory.maintenance +
      reportData.expensesByCategory.office
    ).toLocaleString()}
    
    Generated on: ${new Date().toLocaleDateString()}
    `;
    
    // Create a Blob and trigger download
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded successfully");
  };
  
  const downloadExcelReport = () => {
    exportMonthlyReportToExcel(selectedMonth, selectedYear, reportData);
    toast.success("Excel report downloaded successfully");
  };
  
  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  const ExpenseTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-medium">{`${payload[0].name}: PKR ${payload[0].value?.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Monthly Report</CardTitle>
            <CardDescription>
              View demand statistics and expenses for the selected month
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {[currentYear, currentYear - 1, currentYear - 2].map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={downloadTextReport} title="Download Text Report">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={downloadExcelReport} title="Download Excel Report">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Demand Summary</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h3 className="text-lg font-medium mb-4">Expense Summary (PKR)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenseData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<ExpenseTooltip />} />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 border rounded-lg">
          <h3 className="text-lg font-medium mb-4">Monthly Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-indigo-50 rounded-lg">
              <span className="block text-sm font-medium text-indigo-600">Total Demands</span>
              <span className="block text-2xl font-bold">{reportData.totalDemands}</span>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <span className="block text-sm font-medium text-green-600">Approved Demands</span>
              <span className="block text-2xl font-bold">{reportData.approvedDemands}</span>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <span className="block text-sm font-medium text-red-600">Rejected Demands</span>
              <span className="block text-2xl font-bold">{reportData.rejectedDemands}</span>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <span className="block text-sm font-medium text-amber-600">Pending Demands</span>
              <span className="block text-2xl font-bold">{reportData.pendingDemands}</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Total Expenses</h4>
            <div className="text-3xl font-bold">
              PKR {(
                reportData.expensesByCategory.repair +
                reportData.expensesByCategory.maintenance +
                reportData.expensesByCategory.office
              ).toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyReportChart;
