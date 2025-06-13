
import MonthlyReportChart from "@/components/reports/MonthlyReportChart";
import ReportVariation from "@/components/reports/ReportVariation";

const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
      </div>
      
      <MonthlyReportChart />
      
      <ReportVariation />
    </div>
  );
};

export default ReportsPage;