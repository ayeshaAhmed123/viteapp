
import { DocumentAttachment, PaymentBreakdown } from "@/context/DemandContext";
import FileUploader from "./FileUploader";
import PaymentBreakdownComponent from "./PaymentBreakdown";

interface DemandAdditionalSectionsProps {
  onDocumentsChange: (files: DocumentAttachment[]) => void;
  onPaymentBreakdownChange: (breakdown: PaymentBreakdown) => void;
  paymentBreakdown: PaymentBreakdown;
}

const DemandAdditionalSections = ({
  onDocumentsChange,
  onPaymentBreakdownChange,
  paymentBreakdown,
}: DemandAdditionalSectionsProps) => {
  return (
    <>
      {/* Payment Breakdown Section */}
      <div className="border rounded-md p-4">
        <PaymentBreakdownComponent 
          onChange={onPaymentBreakdownChange}
          initialValue={paymentBreakdown}
        />
      </div>

      {/* Document Upload Section */}
      <div className="border rounded-md p-4">
        <h3 className="text-lg font-medium mb-4">Document Attachments</h3>
        <FileUploader onFilesSelected={onDocumentsChange} />
        <p className="text-xs text-muted-foreground mt-2">
          Supported file types: PDF, JPG, JPEG, PNG (Max 5MB per file)
        </p>
      </div>
    </>
  );
};

export default DemandAdditionalSections;