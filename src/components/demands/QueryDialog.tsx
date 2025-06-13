import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDemands, Demand } from "@/context/DemandContext";
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

interface QueryDialogProps {
  demand: Demand;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const QueryDialog = ({ demand, open, onOpenChange }: QueryDialogProps) => {
  const { currentUser } = useAuth();
  const { queries, addQuery, respondToQuery } = useDemands();
  const [queryMessage, setQueryMessage] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  // Get queries for this specific demand
  const demandQueries = queries.filter(q => q.demandId === demand.id);

  const handleAddQuery = () => {
    if (!queryMessage.trim() || !currentUser) return;
    
    addQuery(demand.id, queryMessage, currentUser.email);
    setQueryMessage("");
    toast.success("Query sent successfully");
  };

  const handleRespond = (queryId: string) => {
    if (!responseMessage.trim() || !currentUser) return;
    
    respondToQuery(queryId, responseMessage, currentUser.email);
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
            Queries for: {demand.title}
          </DialogTitle>
          <DialogDescription>
            Ask questions or provide responses related to this demand
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Queries */}
          {demandQueries.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Previous Queries</h4>
              {demandQueries.map((query) => (
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

          {/* Add New Query (Finance users only) */}
          {currentUser?.role === "finance" && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Ask a Question</h4>
              <Textarea
                placeholder="Type your question about this demand..."
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
          )}
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

export default QueryDialog;