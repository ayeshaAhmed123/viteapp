
import * as XLSX from 'xlsx';
import { Demand } from '@/context/DemandContext';

// Helper function to format date
export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Helper function to format currency
export const formatCurrency = (amount: number): string => {
  return `PKR ${amount.toLocaleString()}`;
};

// Excel export for Monthly Report
export const exportMonthlyReportToExcel = (
  month: number, 
  year: number,
  reportData: {
    totalDemands: number;
    approvedDemands: number;
    rejectedDemands: number;
    pendingDemands: number;
    expensesByCategory: Record<string, number>;
  }
) => {
  const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthName = MONTHS[month];
  const reportTitle = `Monthly Report - ${monthName} ${year}`;
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  
  // Summary worksheet
  const summaryData = [
    ['Monthly Report Summary', ''],
    ['Month', `${monthName} ${year}`],
    ['Generated On', formatDate(new Date())],
    ['', ''],
    ['Demand Summary', ''],
    ['Total Demands', reportData.totalDemands],
    ['Approved Demands', reportData.approvedDemands],
    ['Rejected Demands', reportData.rejectedDemands],
    ['Pending Demands', reportData.pendingDemands],
    ['', ''],
    ['Expense Summary', ''],
    ['Repair Expenses', reportData.expensesByCategory.repair],
    ['Maintenance Expenses', reportData.expensesByCategory.maintenance],
    ['Office Expenses', reportData.expensesByCategory.office],
    ['Total Expenses', Object.values(reportData.expensesByCategory).reduce((a, b) => a + b, 0)],
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  const wscols = [{ wch: 25 }, { wch: 15 }];
  summaryWs['!cols'] = wscols;
  
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  
  // Convert workbook to binary string and trigger download
  XLSX.writeFile(wb, `${reportTitle}.xlsx`);
};

// Excel export for Finance Report
export const exportFinanceReportToExcel = (
  year: number,
  monthlyData: Array<{
    month: string;
    repair: number;
    maintenance: number;
    office: number;
    total: number;
  }>,
  annualTotals: {
    repair: number;
    maintenance: number;
    office: number;
    total: number;
  }
) => {
  const reportTitle = `Financial Report - ${year}`;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Monthly breakdown worksheet
  const monthlyHeaders = [
    ['Month', 'Repair (PKR)', 'Maintenance (PKR)', 'Office (PKR)', 'Total (PKR)']
  ];
  
  const monthlyRows = monthlyData.map(month => [
    month.month,
    month.repair,
    month.maintenance,
    month.office,
    month.total
  ]);
  
  // Add annual totals row
  const totalsRow = [
    'Annual Total',
    annualTotals.repair,
    annualTotals.maintenance,
    annualTotals.office,
    annualTotals.total
  ];
  
  const monthlySheet = [...monthlyHeaders, ...monthlyRows, totalsRow];
  const monthlyWs = XLSX.utils.aoa_to_sheet(monthlySheet);
  
  // Set column widths
  const wscols = [
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
  ];
  monthlyWs['!cols'] = wscols;
  
  XLSX.utils.book_append_sheet(wb, monthlyWs, "Monthly Breakdown");
  
  // Summary worksheet with charts data
  const summaryData = [
    ['Finance Report Summary', ''],
    ['Year', year],
    ['Generated On', formatDate(new Date())],
    ['', ''],
    ['Annual Summary', ''],
    ['Total Expenses', annualTotals.total],
    ['Repair Expenses', annualTotals.repair],
    ['Maintenance Expenses', annualTotals.maintenance],
    ['Office Expenses', annualTotals.office],
    ['', ''],
    ['Percentages', ''],
    ['Repair', `${((annualTotals.repair / annualTotals.total) * 100).toFixed(1)}%`],
    ['Maintenance', `${((annualTotals.maintenance / annualTotals.total) * 100).toFixed(1)}%`],
    ['Office', `${((annualTotals.office / annualTotals.total) * 100).toFixed(1)}%`],
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  const summaryCols = [{ wch: 25 }, { wch: 15 }];
  summaryWs['!cols'] = summaryCols;
  
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  
  // Convert workbook to binary string and trigger download
  XLSX.writeFile(wb, `${reportTitle}.xlsx`);
};

// Excel export for Maintenance Records
export const exportMaintenanceRecordsToExcel = (demands: Demand[]) => {
  const reportTitle = `Maintenance and Repair Records`;
  
  // Create workbook
  const wb = XLSX.utils.book_new();
  
  // Records worksheet
  const headers = [
    ['Title', 'Description', 'Category', 'Amount (PKR)', 'Status', 'Submitted By', 'Date']
  ];
  
  const rows = demands.map(demand => [
    demand.title,
    demand.description,
    demand.category,
    demand.amount,
    demand.status,
    demand.submittedBy,
    formatDate(demand.submittedAt)
  ]);
  
  const recordsSheet = [...headers, ...rows];
  const recordsWs = XLSX.utils.aoa_to_sheet(recordsSheet);
  
  // Set column widths
  const wscols = [
    { wch: 20 }, { wch: 30 }, { wch: 15 }, { wch: 15 }, 
    { wch: 15 }, { wch: 15 }, { wch: 15 }
  ];
  recordsWs['!cols'] = wscols;
  
  XLSX.utils.book_append_sheet(wb, recordsWs, "Records");
  
  // Add summary sheet
  const categories = ['repair', 'maintenance'];
  const totals = categories.reduce((acc, category) => {
    acc[category] = demands
      .filter(d => d.category === category)
      .reduce((sum, d) => sum + d.amount, 0);
    return acc;
  }, {} as Record<string, number>);
  
  const summaryData = [
    ['Maintenance and Repair Summary', ''],
    ['Generated On', formatDate(new Date())],
    ['', ''],
    ['Total Repair Expenses', totals.repair || 0],
    ['Total Maintenance Expenses', totals.maintenance || 0],
    ['Combined Total', Object.values(totals).reduce((a, b) => a + b, 0)],
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");
  
  // Convert workbook to binary string and trigger download
  XLSX.writeFile(wb, `${reportTitle}.xlsx`);
};
