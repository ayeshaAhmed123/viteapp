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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";

interface StockQueryDialogProps {
  stockItem: StockItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StockQueryDialog = ({ stockItem, open, onOpenChange }: StockQueryDialogProps) => {
  const { currentUser } = useAuth();
  const { stockQueries, addStockQuery, respondToStockQuery } = useStock();
  const [queryMessage, setQueryMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Get queries for this specific stock item
  const itemQueries = stockQueries.filter(q => q.stockItemId === stockItem.id);

  const handleAddQuery = () => {
    if (!queryMessage.trim() || !currentUser) return;
    
    addStockQuery(stockItem.id, queryMessage, currentUser.email);
    setQueryMessage("");
    toast.success("Query sent successfully");
  };

  const handleRespond = (queryId: string) => {
    if (!responseMessage.trim() || !currentUser) return;
    
    respondToStockQuery(queryId, responseMessage, currentUser.email);
    setResponseMessage("");
    toast.success("Response sent successfully");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Stock Queries for: {stockItem.name}
          </DialogTitle>
          <DialogDescription>
            Ask questions or provide responses related to this stock item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stock Item Info */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm"><strong>Current Stock:</strong> {stockItem.quantity} {stockItem.unit}</p>
            <p className="text-sm"><strong>Location:</strong> {stockItem.location}</p>
            <p className="text-sm"><strong>Status:</strong> {stockItem.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
          </div>

          {/* Existing Queries */}
          {itemQueries.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Previous Queries</h4>
              {itemQueries.map((query) => (
                <div key={query.id} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      Query by {query.askedBy}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(query.askedAt)}
                    </span>
                  </div>
                  <p className="text-sm">{query.message}</p>
                  
                  {query.response && (
                    <div className="border-l-2 border-blue-200 pl-3 mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="secondary" className="text-xs">
                          Response by {query.respondedBy}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {query.respondedAt && formatDate(query.respondedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">{query.response}</p>
                    </div>
                  )}

                  {/* Response input for unanswered queries */}
                  {!query.response && currentUser?.role !== "finance" && (
                    <div className="space-y-2 mt-2">
                      <Textarea
                        placeholder="Type your response..."
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <Button 
                        size="sm" 
                        onClick={() => handleRespond(query.id)}
                        disabled={!responseMessage.trim()}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Response
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Query (All users can ask questions about stock) */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Ask a Question</h4>
            <Textarea
              placeholder="Type your question about this stock item..."
              value={queryMessage}
              onChange={(e) => setQueryMessage(e.target.value)}
              className="min-h-[80px]"
            />
            <Button 
              onClick={handleAddQuery}
              disabled={!queryMessage.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Query
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StockQueryDialog;
