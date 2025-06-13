
import DemandForm from "@/components/demands/DemandForm";

const NewDemandPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">New Demand</h2>
      </div>
      
      <DemandForm />
    </div>
  );
};

export default NewDemandPage;
