
import { useAuth } from "@/context/AuthContext";
import { useDemands } from "@/context/DemandContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, PieChart, LineChart } from "@/components/dashboard/Charts";
import { FileText, CheckCircle2, XCircle, Clock, Plus, BarChart3, PieChart as PieChartIcon } from "lucide-react";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { demands, getMonthlyReportData } = useDemands();
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyData = getMonthlyReportData(currentMonth, currentYear);

  const pendingDemands = demands.filter(demand => demand.status === "pending");
  const approvedDemands = demands.filter(demand => 
    demand.status === "approved" || demand.status === "finance_approved"
  );
  const rejectedDemands = demands.filter(demand => 
    demand.status === "rejected" || demand.status === "finance_rejected"
  );

  // Data for the charts
  const demandStatusData = [
    { name: "Pending", value: pendingDemands.length, color: "#eab308" },
    { name: "Approved", value: approvedDemands.length, color: "#22c55e" },
    { name: "Rejected", value: rejectedDemands.length, color: "#ef4444" },
  ];

  const expenseData = [
    { name: "Repair", value: monthlyData.expensesByCategory.repair, color: "#3b82f6" },
    { name: "Maintenance", value: monthlyData.expensesByCategory.maintenance, color: "#14b8a6" },
    { name: "Office", value: monthlyData.expensesByCategory.office, color: "#a855f7" },
  ];

  // Generate monthly trend data (6 months)
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const yearOffset = monthIndex > currentMonth ? -1 : 0;
    const trendYear = currentYear + yearOffset;
    const monthData = getMonthlyReportData(monthIndex, trendYear);
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    trendData.push({
      name: monthNames[monthIndex],
      total: monthData.totalDemands,
      approved: monthData.approvedDemands,
      rejected: monthData.rejectedDemands,
    });
  }

  // Calculate the total expenses
  const totalExpenses = 
    monthlyData.expensesByCategory.repair + 
    monthlyData.expensesByCategory.maintenance + 
    monthlyData.expensesByCategory.office;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        
        {currentUser?.role === "facility" && (
          <Button asChild>
            <Link to="/demands/new">
              <Plus className="mr-2 h-4 w-4" />
              New Demand
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Demands</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demands.length}</div>
            <p className="text-xs text-muted-foreground">
              All time demands submitted
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedDemands.length}</div>
            <p className="text-xs text-muted-foreground">
              {((approvedDemands.length / demands.length) * 100 || 0).toFixed(0)}% approval rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedDemands.length}</div>
            <p className="text-xs text-muted-foreground">
              {((rejectedDemands.length / demands.length) * 100 || 0).toFixed(0)}% rejection rate
            </p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDemands.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3 lg:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> 
              Demand Trends
            </CardTitle>
            <CardDescription>
              Monthly trend of demands over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <BarChart data={trendData} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 lg:col-span-1 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Demand Status
            </CardTitle>
            <CardDescription>
              Current distribution of demands
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {demands.length > 0 ? (
                <PieChart data={demandStatusData} />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No demand data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-2 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Expenses By Category
            </CardTitle>
            <CardDescription>
              Breakdown of expenses for {new Date().toLocaleString('default', { month: 'long' })} {currentYear}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <BarChart 
                data={expenseData} 
                variant="simple" 
                valueFormatter={(value) => `PKR ${value.toLocaleString()}`} 
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-muted-foreground">Total Expenses</div>
              <div className="text-xl font-bold">PKR {totalExpenses.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 md:col-span-1 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" /> 
              Expense Distribution
            </CardTitle>
            <CardDescription>
              Current month's expense breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              {totalExpenses > 0 ? (
                <PieChart 
                  data={expenseData} 
                  valueFormatter={(value) => `PKR ${value.toLocaleString()}`}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button asChild variant="outline" className="h-20 flex flex-col">
          <Link to="/demands">
            <FileText className="h-6 w-6 mb-2" />
            View All Demands
          </Link>
        </Button>
        
        <Button asChild variant="outline" className="h-20 flex flex-col">
          <Link to="/reports">
            <PieChartIcon className="h-6 w-6 mb-2" />
            Monthly Reports
          </Link>
        </Button>
        
        {currentUser?.role === "facility" && (
          <Button asChild variant="outline" className="h-20 flex flex-col">
            <Link to="/maintenance">
              <Clock className="h-6 w-6 mb-2" />
              Maintenance Records
            </Link>
          </Button>
        )}
        
        {(currentUser?.role === "finance" || currentUser?.role === "ceo") && (
          <Button asChild variant="outline" className="h-20 flex flex-col">
            <Link to="/finance">
              <Clock className="h-6 w-6 mb-2" />
              Finance Overview
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;