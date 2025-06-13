
import { Button } from "@/components/ui/button";

interface DemandFormActionsProps {
  onCancel: () => void;
  isSubmitting: boolean;
}

const DemandFormActions = ({ onCancel, isSubmitting }: DemandFormActionsProps) => {
  return (
    <div className="flex justify-end space-x-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Demand"}
      </Button>
    </div>
  );
};

export default DemandFormActions;