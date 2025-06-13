
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStock, StockItem } from "@/context/StockContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Edit, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";

interface ManualUpdateDialogProps {
  stockItem: StockItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ManualUpdateDialog = ({ stockItem, open, onOpenChange }: ManualUpdateDialogProps) => {
  const { currentUser } = useAuth();
  const { updateStockItem } = useStock();
  const [updateData, setUpdateData] = useState({
    quantity: stockItem.quantity,
    minQuantity: stockItem.minQuantity,
    maxQuantity: stockItem.maxQuantity,
    location: stockItem.location,
    cost: stockItem.cost,
    supplier: stockItem.supplier || "",
    description: stockItem.description || ""
  });

  const handleUpdate = () => {
    if (!currentUser) return;

    updateStockItem(stockItem.id, {
      ...updateData,
      updatedBy: currentUser.email
    });

    toast.success("Stock item updated successfully");
    onOpenChange(false);
  };

  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Update Stock: {stockItem.name}
          </DialogTitle>
          <DialogDescription>
            Manually update stock item details and quantities
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Values Display */}
          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <p className="text-sm font-medium">Current Values:</p>
            <p className="text-xs">Quantity: {stockItem.quantity} {stockItem.unit}</p>
            <p className="text-xs">Cost: {formatPKR(stockItem.cost)}</p>
            <p className="text-xs">Location: {stockItem.location}</p>
          </div>

          {/* Update Form */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Qty</Label>
              <Input
                id="quantity"
                type="number"
                value={updateData.quantity}
                onChange={(e) => setUpdateData({...updateData, quantity: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Qty</Label>
              <Input
                id="minQuantity"
                type="number"
                value={updateData.minQuantity}
                onChange={(e) => setUpdateData({...updateData, minQuantity: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Max Qty</Label>
              <Input
                id="maxQuantity"
                type="number"
                value={updateData.maxQuantity}
                onChange={(e) => setUpdateData({...updateData, maxQuantity: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cost">Cost (PKR)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={updateData.cost}
                onChange={(e) => setUpdateData({...updateData, cost: parseFloat(e.target.value) || 0})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={updateData.location}
                onChange={(e) => setUpdateData({...updateData, location: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Supplier</Label>
            <Input
              id="supplier"
              value={updateData.supplier}
              onChange={(e) => setUpdateData({...updateData, supplier: e.target.value})}
              placeholder="Supplier name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={updateData.description}
              onChange={(e) => setUpdateData({...updateData, description: e.target.value})}
              placeholder="Item description"
              className="min-h-[60px]"
            />
          </div>

          {/* Quick Actions */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium mb-2">Quick Actions:</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUpdateData({...updateData, quantity: updateData.quantity + 10})}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                +10
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUpdateData({...updateData, quantity: Math.max(0, updateData.quantity - 10)})}
              >
                <TrendingDown className="h-4 w-4 mr-1" />
                -10
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUpdateData({...updateData, quantity: 0})}
              >
                Set to 0
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update Stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ManualUpdateDialog;
