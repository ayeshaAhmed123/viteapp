
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import DemandList from "@/components/demands/DemandList";

const DemandsPage = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Demands</h2>
        
        {currentUser?.role === "facility" && (
          <Button asChild>
            <Link to="/demands/new">
              <Plus className="mr-2 h-4 w-4" />
              New Demand
            </Link>
          </Button>
        )}
      </div>
      
      <DemandList />
    </div>
  );
};

export default DemandsPage;