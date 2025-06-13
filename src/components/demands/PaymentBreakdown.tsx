
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormItem } from "@/components/ui/form";
import { X, Plus } from "lucide-react";
import { PaymentBreakdown as PaymentBreakdownType } from "@/context/DemandContext";

interface PaymentBreakdownProps {
  onChange: (breakdown: PaymentBreakdownType) => void;
  initialValue?: PaymentBreakdownType;
}

interface AdditionalItem {
  id: string;
  name: string;
  cost: number;
}

const PaymentBreakdown = ({ onChange, initialValue }: PaymentBreakdownProps) => {
  const [repairing, setRepairing] = useState(initialValue?.repairing || 0);
  const [cleaning, setCleaning] = useState(initialValue?.cleaning || 0);
  const [other, setOther] = useState(initialValue?.other || 0);
  const [additionalItems, setAdditionalItems] = useState<AdditionalItem[]>([]);
  const [total, setTotal] = useState(0);

  // Update the total whenever any value changes
  useEffect(() => {
    const additionalTotal = additionalItems.reduce((sum, item) => sum + (item.cost || 0), 0);
    const newTotal = (repairing || 0) + (cleaning || 0) + (other || 0) + additionalTotal;
    setTotal(newTotal);

    // Notify parent component of the changes
    const newBreakdown: PaymentBreakdownType = {
      repairing: repairing || 0,
      cleaning: cleaning || 0,
      other: other || 0,
    };

    if (additionalItems.length > 0) {
      newBreakdown.additionalItems = additionalItems.map(item => ({
        name: item.name,
        cost: item.cost || 0,
      }));
    }

    onChange(newBreakdown);
  }, [repairing, cleaning, other, additionalItems, onChange]);

  const handleAddItem = () => {
    setAdditionalItems([
      ...additionalItems,
      { id: `item-${Date.now()}`, name: "", cost: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setAdditionalItems(additionalItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id: string, field: "name" | "cost", value: string | number) => {
    setAdditionalItems(
      additionalItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Payment Breakdown</h3>
      
      <div className="grid gap-4">
        <FormItem>
          <Label htmlFor="repairing">Repairing Cost</Label>
          <Input
            id="repairing"
            type="number"
            min="0"
            step="0.01"
            value={repairing || ""}
            onChange={(e) => setRepairing(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </FormItem>
        
        <FormItem>
          <Label htmlFor="cleaning">Daintiness / Cleaning Cost</Label>
          <Input
            id="cleaning"
            type="number"
            min="0"
            step="0.01"
            value={cleaning || ""}
            onChange={(e) => setCleaning(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </FormItem>
        
        <FormItem>
          <Label htmlFor="other">Other Items / Miscellaneous</Label>
          <Input
            id="other"
            type="number"
            min="0"
            step="0.01"
            value={other || ""}
            onChange={(e) => setOther(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
          />
        </FormItem>

        {additionalItems.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_auto] gap-2">
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
              />
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={item.cost || ""}
                onChange={(e) => 
                  handleItemChange(item.id, "cost", parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleRemoveItem(item.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={handleAddItem}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="flex justify-between items-center pt-2 border-t">
        <span className="font-medium">Total Amount:</span>
        <span className="text-lg font-bold">PKR {total.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default PaymentBreakdown;
