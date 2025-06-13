import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useStock } from "@/context/StockContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import StockQueryDialog from "@/components/stock/StockQueryDialog";
import ManualUpdateDialog from "@/components/stock/ManualUpdateDialog";

const StockPage = () => {
  const { currentUser } = useAuth();
  const {
    stockItems,
    stockMovements,
    addStockItem,
    updateStockQuantity,
    getLowStockItems,
    getOutOfStockItems
  } = useStock();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);
  const [isQueryDialogOpen, setIsQueryDialogOpen] = useState(false);
  const [isManualUpdateDialogOpen, setIsManualUpdateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedStockItem, setSelectedStockItem] = useState<any>(null);
  const [movementType, setMovementType] = useState<"in" | "out">("in");

  // Check if current user can add stock items (only facility managers)
  const canAddStockItems = currentUser?.role === "facility";

  // Form states
  const [newItem, setNewItem] = useState({
    name: "",
    category: "office_supplies" as any,
    quantity: 0,
    minQuantity: 0,
    maxQuantity: 0,
    unit: "",
    location: "",
    cost: 0,
    supplier: "",
    description: "",
    updatedBy: currentUser?.email || ""
  });

  const [movement, setMovement] = useState({
    quantity: 0,
    reason: "",
    notes: ""
  });

  const lowStockItems = getLowStockItems();
  const outOfStockItems = getOutOfStockItems();

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Format price in PKR
  const formatPKR = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string, quantity: number) => {
    switch (status) {
      case "in_stock":
        return <Badge className="bg-green-100 text-green-800">In Stock ({quantity})</Badge>;
      case "low_stock":
        return <Badge className="bg-yellow-100 text-yellow-800">Low Stock ({quantity})</Badge>;
      case "out_of_stock":
        return <Badge className="bg-red-100 text-red-800">Out of Stock (0)</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.unit || !newItem.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    addStockItem(newItem);
    toast.success("Stock item added successfully");
    setIsAddDialogOpen(false);
    setNewItem({
      name: "",
      category: "office_supplies",
      quantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      unit: "",
      location: "",
      cost: 0,
      supplier: "",
      description: "",
      updatedBy: currentUser?.email || ""
    });
  };

  const handleMovement = () => {
    if (!selectedItem || !movement.quantity || !movement.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateStockQuantity(
      selectedItem,
      movement.quantity,
      movement.reason,
      currentUser?.email || "",
      movementType
    );

    toast.success(`Stock ${movementType === "in" ? "added" : "removed"} successfully`);
    setIsMovementDialogOpen(false);
    setMovement({ quantity: 0, reason: "", notes: "" });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">
            Track and manage your facility inventory
          </p>
        </div>
        {canAddStockItems && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Stock Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    placeholder="Enter item name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value as any})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="office_supplies">Office Supplies</SelectItem>
                        <SelectItem value="maintenance_tools">Maintenance Tools</SelectItem>
                        <SelectItem value="cleaning_supplies">Cleaning Supplies</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit *</Label>
                    <Input
                      id="unit"
                      value={newItem.unit}
                      onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                      placeholder="e.g., pieces, bottles"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minQuantity">Min Qty</Label>
                    <Input
                      id="minQuantity"
                      type="number"
                      value={newItem.minQuantity}
                      onChange={(e) => setNewItem({...newItem, minQuantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxQuantity">Max Qty</Label>
                    <Input
                      id="maxQuantity"
                      type="number"
                      value={newItem.maxQuantity}
                      onChange={(e) => setNewItem({...newItem, maxQuantity: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={newItem.location}
                      onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                      placeholder="Storage location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost (PKR)</Label>
                    <Input
                      id="cost"
                      type="number"
                      value={newItem.cost}
                      onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                      placeholder="Price per unit"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddItem}>Add Item</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        {!canAddStockItems && (
          <div className="text-sm text-muted-foreground">
            Only Facility Managers can add new stock items
          </div>
        )}
      </div>

      {/* Stock Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPKR(stockItems.reduce((sum, item) => sum + (item.quantity * item.cost), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="office_supplies">Office Supplies</SelectItem>
                <SelectItem value="maintenance_tools">Maintenance Tools</SelectItem>
                <SelectItem value="cleaning_supplies">Cleaning Supplies</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stock Table */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id} className={item.status === 'out_of_stock' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                      <div className="text-xs text-muted-foreground">
                        Min: {item.minQuantity}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status, item.quantity)}</TableCell>
                    <TableCell className="font-medium">{formatPKR(item.cost)}</TableCell>
                    <TableCell className="font-medium">
                      {formatPKR(item.quantity * item.cost)}
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>{formatDate(item.lastUpdated)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item.id);
                            setMovementType("in");
                            setIsMovementDialogOpen(true);
                          }}
                          title="Add Stock"
                        >
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item.id);
                            setMovementType("out");
                            setIsMovementDialogOpen(true);
                          }}
                          disabled={item.quantity === 0}
                          title="Remove Stock"
                        >
                          <TrendingDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStockItem(item);
                            setIsManualUpdateDialogOpen(true);
                          }}
                          title="Manual Update"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedStockItem(item);
                            setIsQueryDialogOpen(true);
                          }}
                          title="Stock Queries"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>Track all stock in and out movements</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.slice(-10).reverse().map((movement) => {
                    const item = stockItems.find(i => i.id === movement.stockItemId);
                    return (
                      <TableRow key={movement.id}>
                        <TableCell>{formatDate(movement.performedAt)}</TableCell>
                        <TableCell>{item?.name}</TableCell>
                        <TableCell>
                          <Badge variant={movement.type === "in" ? "default" : "secondary"}>
                            {movement.type === "in" ? "Stock In" : "Stock Out"}
                          </Badge>
                        </TableCell>
                        <TableCell>{movement.quantity} {item?.unit}</TableCell>
                        <TableCell className="font-medium">
                          {item ? formatPKR(movement.quantity * item.cost) : 'N/A'}
                        </TableCell>
                        <TableCell>{movement.reason}</TableCell>
                        <TableCell>{movement.performedBy}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {outOfStockItems.length > 0 && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Out of Stock Items - Immediate Action Required
                  </CardTitle>
                  <CardDescription>These items need immediate restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {outOfStockItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="flex-1">
                          <p className="font-medium text-red-800">{item.name}</p>
                          <p className="text-sm text-red-600">{item.location}</p>
                          <p className="text-sm text-red-600">Unit Price: {formatPKR(item.cost)}</p>
                          <p className="text-xs text-red-500 mt-1">
                            Minimum required: {item.minQuantity} {item.unit}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setSelectedItem(item.id);
                              setMovementType("in");
                              setIsMovementDialogOpen(true);
                            }}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Restock Now
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {lowStockItems.length > 0 && (
              <Card className="border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Low Stock Items - Action Needed Soon
                  </CardTitle>
                  <CardDescription>These items are running low and need restocking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                        <div className="flex-1">
                          <p className="font-medium text-yellow-800">{item.name}</p>
                          <p className="text-sm text-yellow-600">
                            {item.quantity} {item.unit} remaining (Min: {item.minQuantity})
                          </p>
                          <p className="text-sm text-yellow-600">Unit Price: {formatPKR(item.cost)}</p>
                          <p className="text-sm text-yellow-600">Current Value: {formatPKR(item.quantity * item.cost)}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item.id);
                              setMovementType("in");
                              setIsMovementDialogOpen(true);
                            }}
                            className="border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                          >
                            Add Stock
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {outOfStockItems.length === 0 && lowStockItems.length === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    All Items in Good Stock
                  </CardTitle>
                  <CardDescription>No immediate action required for inventory levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">All items are currently above their minimum stock levels.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Stock Movement Dialog */}
      <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {movementType === "in" ? "Add Stock" : "Remove Stock"}
            </DialogTitle>
            <DialogDescription>
              {movementType === "in" ? "Add items to inventory" : "Remove items from inventory"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={movement.quantity}
                onChange={(e) => setMovement({...movement, quantity: parseInt(e.target.value) || 0})}
                placeholder="Enter quantity"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason *</Label>
              <Input
                id="reason"
                value={movement.reason}
                onChange={(e) => setMovement({...movement, reason: e.target.value})}
                placeholder="e.g., Purchase order, Consumption, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={movement.notes}
                onChange={(e) => setMovement({...movement, notes: e.target.value})}
                placeholder="Additional notes (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMovement}>
              {movementType === "in" ? "Add Stock" : "Remove Stock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Query Dialog */}
      {selectedStockItem && (
        <StockQueryDialog
          stockItem={selectedStockItem}
          open={isQueryDialogOpen}
          onOpenChange={setIsQueryDialogOpen}
        />
      )}

      {/* Manual Update Dialog */}
      {selectedStockItem && (
        <ManualUpdateDialog
          stockItem={selectedStockItem}
          open={isManualUpdateDialogOpen}
          onOpenChange={setIsManualUpdateDialogOpen}
        />
      )}
    </div>
  );
};

export default StockPage;