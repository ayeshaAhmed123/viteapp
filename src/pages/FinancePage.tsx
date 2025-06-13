import { useState } from "react";
import { useDemands } from "@/context/DemandContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { exportFinanceReportToExcel } from "@/utils/excelExport";

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

const FinancePage = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const { demands, getMonthlyReportData } = useDemands();

  // Generate data for each month
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const data = getMonthlyReportData(i, selectedYear);
    return {
      month: MONTHS[i],
      repair: data.expensesByCategory.repair,
      maintenance: data.expensesByCategory.maintenance,
      office: data.expensesByCategory.office,
      total: data.expensesByCategory.repair + data.expensesByCategory.maintenance + data.expensesByCategory.office,
    };
  });

  // Calculate annual totals
  const annualTotals = monthlyData.reduce(
    (acc, month) => {
      acc.repair += month.repair;
      acc.maintenance += month.maintenance;
      acc.office += month.office;
      acc.total += month.total;
      return acc;
    },
    { repair: 0, maintenance: 0, office: 0, total: 0 }
  );

  const downloadTextReport = () => {
    // In a real app, generate a PDF report with detailed data
    const reportTitle = `Financial Report - ${selectedYear}`;
    const reportContent = `
    ${reportTitle}
    
    Monthly Breakdown:
    ${monthlyData
      .map(
        (month) => `
    ${month.month}:
    - Repair: PKR ${month.repair.toLocaleString()}
    - Maintenance: PKR ${month.maintenance.toLocaleString()}
    - Office: PKR ${month.office.toLocaleString()}
    - Total: PKR ${month.total.toLocaleString()}
    `
      )
      .join("\n")}
    
    Annual Totals:
    - Repair: PKR ${annualTotals.repair.toLocaleString()}
    - Maintenance: PKR ${annualTotals.maintenance.toLocaleString()}
    - Office: PKR ${annualTotals.office.toLocaleString()}
    - Total Expenses: PKR ${annualTotals.total.toLocaleString()}
    
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

    toast.success("Finance report downloaded successfully");
  };

  const downloadExcelReport = () => {
    exportFinanceReportToExcel(selectedYear, monthlyData, annualTotals);
    toast.success("Excel finance report downloaded successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Finance</h2>

        <div className="flex space-x-2">
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
            <Button variant="outline" onClick={downloadTextReport}>
              <FileText className="mr-2 h-4 w-4" />
              Text Report
            </Button>
            <Button variant="outline" onClick={downloadExcelReport}>
              <Download className="mr-2 h-4 w-4" />
              Excel Report
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Annual Expense Trends</CardTitle>
          <CardDescription>
            Monthly expenses for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => `PKR ${parseInt(value as string).toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="repair"
                  stroke="#3b82f6"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="maintenance"
                  stroke="#14b8a6"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="office"
                  stroke="#a855f7"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {annualTotals.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              For {selectedYear}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Repair Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {annualTotals.repair.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((annualTotals.repair / annualTotals.total) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Maintenance Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {annualTotals.maintenance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((annualTotals.maintenance / annualTotals.total) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Office Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              PKR {annualTotals.office.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((annualTotals.office / annualTotals.total) * 100 || 0).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expense Breakdown</CardTitle>
          <CardDescription>
            Expenses by month and category for {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead>Repair (PKR)</TableHead>
                  <TableHead>Maintenance (PKR)</TableHead>
                  <TableHead>Office (PKR)</TableHead>
                  <TableHead>Total (PKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((month) => (
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell>{month.repair.toLocaleString()}</TableCell>
                    <TableCell>{month.maintenance.toLocaleString()}</TableCell>
                    <TableCell>{month.office.toLocaleString()}</TableCell>
                    <TableCell className="font-bold">{month.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-bold">Annual Total</TableCell>
                  <TableCell className="font-bold">{annualTotals.repair.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">{annualTotals.maintenance.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">{annualTotals.office.toLocaleString()}</TableCell>
                  <TableCell className="font-bold">{annualTotals.total.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancePage;
