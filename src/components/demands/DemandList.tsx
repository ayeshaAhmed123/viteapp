
import { useState } from "react";
import { useDemands, Demand, DemandStatus } from "@/context/DemandContext";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import QueryDialog from "./QueryDialog";

const DemandList = () => {
  const { demands, updateDemandStatus, queries } = useDemands();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [openQueryDialog, setOpenQueryDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Filter demands based on role and filter selection
  const filteredDemands = demands.filter((demand) => {
    if (filter === "all") return true;
    return demand.status === filter;
  });

  const handleAction = (demand: Demand, action: "approve" | "reject") => {
    setSelectedDemand(demand);
    setActionType(action);
    setOpenActionDialog(true);
  };

  const handleQuery = (demand: Demand) => {
    setSelectedDemand(demand);
    setOpenQueryDialog(true);
  };

  const confirmAction = () => {
    if (!selectedDemand || !actionType) return;

    let newStatus: DemandStatus;

    if (actionType === "approve") {
      if (currentUser?.role === "ceo") {
        newStatus = "approved";
      } else if (currentUser?.role === "finance") {
        newStatus = "finance_approved";
      } else {
        return; // Facility managers can't approve
      }
    } else {
      // Reject action
      if (currentUser?.role === "ceo") {
        newStatus = "rejected";
      } else if (currentUser?.role === "finance") {
        newStatus = "finance_rejected";
      } else {
        return; // Facility managers can't reject
      }
    }

    updateDemandStatus(selectedDemand.id, newStatus, rejectionReason);
    toast.success(
      `Demand ${actionType === "approve" ? "approved" : "rejected"} successfully`
    );
    setOpenActionDialog(false);
    setRejectionReason("");
    setActionType(null);
  };

  const formatAmount = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-PK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: DemandStatus) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "finance_approved":
        return <Badge className="bg-blue-500">Finance Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "finance_rejected":
        return <Badge className="bg-orange-500">Finance Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "repair":
        return <Badge variant="outline" className="border-blue-300 text-blue-700">Repair</Badge>;
      case "maintenance":
        return <Badge variant="outline" className="border-green-300 text-green-700">Maintenance</Badge>;
      case "office":
        return <Badge variant="outline" className="border-purple-300 text-purple-700">Office Use</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const canApprove = (demand: Demand) => {
    if (currentUser?.role === "facility") return false;
    if (demand.status !== "pending") return false;
    return true;
  };

  const getQueryCount = (demandId: string) => {
    return queries.filter(q => q.demandId === demandId).length;
  };

  const hasUnrespondedQueries = (demandId: string) => {
    return queries.some(q => q.demandId === demandId && !q.response);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Demands</CardTitle>
            <CardDescription>
              View and manage all submitted demands
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-0">
            <span className="text-sm">Filter:</span>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Demands</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="finance_approved">Finance Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="finance_rejected">Finance Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Queries</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDemands.length > 0 ? (
                filteredDemands.map((demand) => (
                  <TableRow key={demand.id}>
                    <TableCell className="font-medium">{demand.title}</TableCell>
                    <TableCell>{getCategoryBadge(demand.category)}</TableCell>
                    <TableCell>{formatAmount(demand.amount)}</TableCell>
                    <TableCell>{getStatusBadge(demand.status)}</TableCell>
                    <TableCell>{formatDate(demand.submittedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{getQueryCount(demand.id)}</span>
                        {hasUnrespondedQueries(demand.id) && (
                          <Badge variant="destructive" className="text-xs px-1">
                            New
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setSelectedDemand(demand);
                            setOpenViewDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuery(demand)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>

                        {canApprove(demand) && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleAction(demand, "approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleAction(demand, "reject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No demands found matching the selected filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* View Demand Dialog */}
        <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedDemand?.title}</DialogTitle>
              <DialogDescription>
                Submitted by {selectedDemand?.submittedBy} on{" "}
                {selectedDemand?.submittedAt && formatDate(selectedDemand.submittedAt)}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-gray-500">
                  {selectedDemand?.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-sm text-gray-500">
                    {selectedDemand?.amount && formatAmount(selectedDemand.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Category</p>
                  <p className="text-sm text-gray-500">
                    {selectedDemand?.category && getCategoryBadge(selectedDemand.category)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <p className="text-sm text-gray-500">
                    {selectedDemand?.status && getStatusBadge(selectedDemand.status)}
                  </p>
                </div>
              </div>

              {selectedDemand?.rejectedReason && (
                <div>
                  <p className="text-sm font-medium">Rejection Reason</p>
                  <p className="text-sm text-gray-500">
                    {selectedDemand.rejectedReason}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve/Reject Dialog */}
        <Dialog open={openActionDialog} onOpenChange={setOpenActionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {actionType === "approve" ? "Approve Demand" : "Reject Demand"}
              </DialogTitle>
              <DialogDescription>
                {actionType === "approve"
                  ? "Are you sure you want to approve this demand?"
                  : "Please provide a reason for rejecting this demand."}
              </DialogDescription>
            </DialogHeader>
            {actionType === "reject" && (
              <div className="py-4">
                <Textarea
                  placeholder="Reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenActionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmAction}>
                {actionType === "approve" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Query Dialog */}
        {selectedDemand && (
          <QueryDialog
            demand={selectedDemand}
            open={openQueryDialog}
            onOpenChange={setOpenQueryDialog}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default DemandList;