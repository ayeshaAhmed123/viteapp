
import React, { createContext, useContext, useState } from 'react';

// Define types
export type DemandStatus = 'pending' | 'approved' | 'rejected' | 'finance_approved' | 'finance_rejected';
export type DemandCategory = 'repair' | 'maintenance' | 'office';

export interface PaymentBreakdown {
  repairing: number;
  cleaning: number;
  other: number;
  additionalItems?: { name: string; cost: number }[];
}

export interface DocumentAttachment {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
}

export interface DemandQuery {
  id: string;
  demandId: string;
  message: string;
  askedBy: string;
  askedAt: Date;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
}

export interface Demand {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: DemandCategory;
  status: DemandStatus;
  submittedBy: string;
  submittedAt: Date;
  ceoApproved: boolean;
  financeApproved: boolean;
  ceoApprovedAt?: Date;
  financeApprovedAt?: Date;
  rejectedBy?: string;
  rejectedReason?: string;
  rejectedAt?: Date;
  documents?: DocumentAttachment[];
  paymentBreakdown?: PaymentBreakdown;
  queries?: DemandQuery[];
}

interface DemandContextType {
  demands: Demand[];
  queries: DemandQuery[];
  addDemand: (demand: Omit<Demand, 'id' | 'submittedAt' | 'status'>) => void;
  updateDemandStatus: (id: string, status: DemandStatus, reason?: string) => void;
  addQuery: (demandId: string, message: string, askedBy: string) => void;
  respondToQuery: (queryId: string, response: string, respondedBy: string) => void;
  getDemandsByMonth: (month: number, year: number) => Demand[];
  getMonthlyReportData: (month: number, year: number) => {
    totalDemands: number;
    approvedDemands: number;
    rejectedDemands: number;
    pendingDemands: number;
    expensesByCategory: Record<DemandCategory, number>;
  };
}

const DemandContext = createContext<DemandContextType | undefined>(undefined);

// Add some initial demands for testing
const initialDemands: Demand[] = [
  {
    id: "1",
    title: "Office Furniture Repair",
    description: "Repair of broken chairs and tables in the main office",
    amount: 25000,
    category: "repair",
    submittedBy: "Facility Manager",
    submittedAt: new Date(2023, 4, 15),
    status: "pending",
    ceoApproved: false,
    financeApproved: false
  },
  {
    id: "2",
    title: "Monthly Cleaning Service",
    description: "Regular cleaning service for May 2023",
    amount: 15000,
    category: "maintenance",
    submittedBy: "Facility Manager",
    submittedAt: new Date(2023, 4, 10),
    status: "approved",
    ceoApproved: true,
    ceoApprovedAt: new Date(2023, 4, 12),
    financeApproved: true,
    financeApprovedAt: new Date(2023, 4, 13)
  },
  {
    id: "3",
    title: "HVAC System Maintenance",
    description: "Regular maintenance of the air conditioning system",
    amount: 35000,
    category: "maintenance",
    submittedBy: "Facility Manager",
    submittedAt: new Date(2023, 4, 5),
    status: "finance_approved",
    ceoApproved: true,
    ceoApprovedAt: new Date(2023, 4, 7),
    financeApproved: true,
    financeApprovedAt: new Date(2023, 4, 8)
  },
  {
    id: "4",
    title: "Electrical Wiring Repair",
    description: "Fix faulty wiring in the conference room",
    amount: 18000,
    category: "repair",
    submittedBy: "Facility Manager",
    submittedAt: new Date(2023, 4, 1),
    status: "rejected",
    ceoApproved: false,
    rejectedAt: new Date(2023, 4, 3),
    rejectedReason: "Need more detailed cost breakdown",
    rejectedBy: "CEO"
  },
  {
    id: "5",
    title: "Replace broken window",
    description: "Window in conference room is broken and needs replacement",
    amount: 15000,
    category: "repair",
    submittedBy: "John Doe",
    submittedAt: new Date("2023-05-15"),
    status: "rejected",
    ceoApproved: false,
    financeApproved: false,
    rejectedAt: new Date("2023-05-18"),
    rejectedReason: "Too expensive, find a cheaper alternative",
    rejectedBy: "Jane Smith",
  }
];

export const DemandProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demands, setDemands] = useState<Demand[]>(initialDemands);
  const [queries, setQueries] = useState<DemandQuery[]>([]);

  const addDemand = (demandData: Omit<Demand, 'id' | 'submittedAt' | 'status'>) => {
    const newDemand: Demand = {
      ...demandData,
      id: (demands.length + 1).toString(),
      submittedAt: new Date(),
      status: 'pending',
    };
    
    setDemands([...demands, newDemand]);
  };

  const updateDemandStatus = (id: string, status: DemandStatus, reason?: string) => {
    setDemands(demands.map(demand => {
      if (demand.id === id) {
        const updatedDemand = { ...demand, status };
        
        if (status === 'approved') {
          updatedDemand.ceoApproved = true;
          updatedDemand.ceoApprovedAt = new Date();
        } else if (status === 'finance_approved') {
          updatedDemand.financeApproved = true;
          updatedDemand.financeApprovedAt = new Date();
        } else if (status === 'rejected' || status === 'finance_rejected') {
          updatedDemand.rejectedAt = new Date();
          updatedDemand.rejectedReason = reason || 'No reason provided';
          updatedDemand.rejectedBy = status === 'rejected' ? 'CEO' : 'Finance';
        }
        
        return updatedDemand;
      }
      return demand;
    }));
  };

  const addQuery = (demandId: string, message: string, askedBy: string) => {
    const newQuery: DemandQuery = {
      id: (queries.length + 1).toString(),
      demandId,
      message,
      askedBy,
      askedAt: new Date(),
    };
    
    setQueries([...queries, newQuery]);
  };

  const respondToQuery = (queryId: string, response: string, respondedBy: string) => {
    setQueries(queries.map(query => {
      if (query.id === queryId) {
        return {
          ...query,
          response,
          respondedBy,
          respondedAt: new Date(),
        };
      }
      return query;
    }));
  };

  const getDemandsByMonth = (month: number, year: number) => {
    return demands.filter(demand => {
      const demandDate = new Date(demand.submittedAt);
      return demandDate.getMonth() === month && demandDate.getFullYear() === year;
    });
  };

  const getMonthlyReportData = (month: number, year: number) => {
    const monthlyDemands = getDemandsByMonth(month, year);
    
    const approvedDemands = monthlyDemands.filter(d => 
      d.status === 'approved' || d.status === 'finance_approved'
    );
    
    const rejectedDemands = monthlyDemands.filter(d => 
      d.status === 'rejected' || d.status === 'finance_rejected'
    );
    
    const pendingDemands = monthlyDemands.filter(d => d.status === 'pending');
    
    const expensesByCategory = {
      repair: 0,
      maintenance: 0,
      office: 0
    };
    
    approvedDemands.forEach(demand => {
      expensesByCategory[demand.category] += demand.amount;
    });
    
    return {
      totalDemands: monthlyDemands.length,
      approvedDemands: approvedDemands.length,
      rejectedDemands: rejectedDemands.length,
      pendingDemands: pendingDemands.length,
      expensesByCategory
    };
  };

  const value = {
    demands,
    queries,
    addDemand,
    updateDemandStatus,
    addQuery,
    respondToQuery,
    getDemandsByMonth,
    getMonthlyReportData
  };

  return (
    <DemandContext.Provider value={value}>
      {children}
    </DemandContext.Provider>
  );
};

export const useDemands = () => {
  const context = useContext(DemandContext);
  if (context === undefined) {
    throw new Error('useDemands must be used within a DemandProvider');
  }
  return context;
};



