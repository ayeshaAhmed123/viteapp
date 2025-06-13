import React, { createContext, useContext, useState } from 'react';

export type StockStatus = 'in_stock' | 'out_of_stock' | 'low_stock';
export type StockCategory = 'office_supplies' | 'maintenance_tools' | 'cleaning_supplies' | 'equipment' | 'maintenance';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  location: string;
  status: StockStatus;
  lastUpdated: Date;
  updatedBy: string;
  cost: number;
  unitPrice?: number;
  supplier?: string;
  description?: string;
}

export interface StockMovement {
  id: string;
  stockItemId: string;
  type: 'in' | 'out';
  quantity: number;
  reason: string;
  performedBy: string;
  performedAt: Date;
  notes?: string;
}

export interface StockQuery {
  id: string;
  stockItemId: string;
  message: string;
  askedBy: string;
  askedAt: Date;
  response?: string;
  respondedBy?: string;
  respondedAt?: Date;
}

interface StockContextType {
  stockItems: StockItem[];
  stockMovements: StockMovement[];
  stockQueries: StockQuery[];
  addStockItem: (item: Omit<StockItem, 'id' | 'lastUpdated' | 'status'>) => void;
  updateStockQuantity: (id: string, quantity: number, reason: string, performedBy: string, type: 'in' | 'out') => void;
  updateStockItem: (id: string, updates: Partial<StockItem>) => void;
  deleteStockItem: (id: string) => void;
  getStockByCategory: (category: StockCategory) => StockItem[];
  getLowStockItems: () => StockItem[];
  getOutOfStockItems: () => StockItem[];
  addStockQuery: (stockItemId: string, message: string, askedBy: string) => void;
  respondToStockQuery: (queryId: string, response: string, respondedBy: string) => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

// Add some initial stock items for testing
const initialStockItems: StockItem[] = [
  {
    id: "1",
    name: "Office Paper A4",
    category: "office_supplies",
    quantity: 50,
    unit: "reams",
    unitPrice: 500,
    totalValue: 25000,
    lastUpdated: new Date(2023, 4, 15)
  },
  {
    id: "2",
    name: "Printer Ink Cartridges",
    category: "office_supplies",
    quantity: 10,
    unit: "pieces",
    unitPrice: 2000,
    totalValue: 20000,
    lastUpdated: new Date(2023, 4, 10)
  },
  {
    id: "3",
    name: "Cleaning Supplies",
    category: "maintenance",
    quantity: 15,
    unit: "sets",
    unitPrice: 1200,
    totalValue: 18000,
    lastUpdated: new Date(2023, 4, 5)
  },
  {
    id: "4",
    name: "Light Bulbs",
    category: "maintenance",
    quantity: 30,
    unit: "pieces",
    unitPrice: 300,
    totalValue: 9000,
    lastUpdated: new Date(2023, 4, 1)
  }
];

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [stockQueries, setStockQueries] = useState<StockQuery[]>([]);

  const getStockStatus = (quantity: number, minQuantity: number): StockStatus => {
    if (quantity === 0) return 'out_of_stock';
    if (quantity <= minQuantity) return 'low_stock';
    return 'in_stock';
  };

  const addStockItem = (itemData: Omit<StockItem, 'id' | 'lastUpdated' | 'status'>) => {
    const newItem: StockItem = {
      ...itemData,
      id: (stockItems.length + 1).toString(),
      lastUpdated: new Date(),
      status: getStockStatus(itemData.quantity, itemData.minQuantity),
    };
    setStockItems([...stockItems, newItem]);
  };

  const updateStockQuantity = (id: string, quantityChange: number, reason: string, performedBy: string, type: 'in' | 'out') => {
    setStockItems(items => items.map(item => {
      if (item.id === id) {
        const newQuantity = type === 'in' ? item.quantity + quantityChange : item.quantity - quantityChange;
        const updatedItem = {
          ...item,
          quantity: Math.max(0, newQuantity),
          status: getStockStatus(Math.max(0, newQuantity), item.minQuantity),
          lastUpdated: new Date(),
          updatedBy: performedBy
        };

        // Add movement record
        const movement: StockMovement = {
          id: (stockMovements.length + 1).toString(),
          stockItemId: id,
          type,
          quantity: quantityChange,
          reason,
          performedBy,
          performedAt: new Date()
        };
        setStockMovements(prev => [...prev, movement]);

        return updatedItem;
      }
      return item;
    }));
  };

  const updateStockItem = (id: string, updates: Partial<StockItem>) => {
    setStockItems(items => items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, ...updates, lastUpdated: new Date() };
        if (updates.quantity !== undefined || updates.minQuantity !== undefined) {
          updatedItem.status = getStockStatus(
            updates.quantity ?? item.quantity,
            updates.minQuantity ?? item.minQuantity
          );
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const deleteStockItem = (id: string) => {
    setStockItems(items => items.filter(item => item.id !== id));
    setStockMovements(movements => movements.filter(movement => movement.stockItemId !== id));
  };

  const getStockByCategory = (category: StockCategory) => {
    return stockItems.filter(item => item.category === category);
  };

  const getLowStockItems = () => {
    return stockItems.filter(item => item.status === 'low_stock');
  };

  const getOutOfStockItems = () => {
    return stockItems.filter(item => item.status === 'out_of_stock');
  };

  const addStockQuery = (stockItemId: string, message: string, askedBy: string) => {
    const newQuery: StockQuery = {
      id: (stockQueries.length + 1).toString(),
      stockItemId,
      message,
      askedBy,
      askedAt: new Date()
    };
    setStockQueries([...stockQueries, newQuery]);
  };

  const respondToStockQuery = (queryId: string, response: string, respondedBy: string) => {
    setStockQueries(queries => queries.map(query => {
      if (query.id === queryId) {
        return {
          ...query,
          response,
          respondedBy,
          respondedAt: new Date()
        };
      }
      return query;
    }));
  };

  const value = {
    stockItems,
    stockMovements,
    stockQueries,
    addStockItem,
    updateStockQuantity,
    updateStockItem,
    deleteStockItem,
    getStockByCategory,
    getLowStockItems,
    getOutOfStockItems,
    addStockQuery,
    respondToStockQuery
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};


