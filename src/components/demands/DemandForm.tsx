
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useDemands, DocumentAttachment, PaymentBreakdown } from "@/context/DemandContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { demandFormSchema, DemandFormValues } from "./demand-schema";
import DemandBasicInfo from "./DemandBasicInfo";
import DemandCategoryField from "./DemandCategoryField";
import DemandAdditionalSections from "./DemandAdditionalSections";
import DemandFormActions from "./DemandFormActions";

const DemandForm = () => {
  const { currentUser } = useAuth();
  const { addDemand } = useDemands();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documents, setDocuments] = useState<DocumentAttachment[]>([]);
  const [paymentBreakdown, setPaymentBreakdown] = useState<PaymentBreakdown>({
    repairing: 0,
    cleaning: 0,
    other: 0,
  });

  const form = useForm<DemandFormValues>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      category: "repair",
    },
  });

  // Update the form amount field when payment breakdown changes
  const handlePaymentBreakdownChange = (breakdown: PaymentBreakdown) => {
    setPaymentBreakdown(breakdown);
    
    // Calculate total from breakdown
    let total = breakdown.repairing + breakdown.cleaning + breakdown.other;
    
    // Add any additional items
    if (breakdown.additionalItems) {
      total += breakdown.additionalItems.reduce((sum, item) => sum + item.cost, 0);
    }
    
    // Update the form's amount field
    form.setValue("amount", total);
  };

  const handleDocumentsChange = (files: DocumentAttachment[]) => {
    setDocuments(files);
  };

  const onSubmit = (values: DemandFormValues) => {
    if (!currentUser) {
      toast.error("You must be logged in to submit a demand");
      return;
    }

    // Check if we have at least one payment category filled
    const hasPaymentData = 
      paymentBreakdown.repairing > 0 || 
      paymentBreakdown.cleaning > 0 || 
      paymentBreakdown.other > 0 ||
      (paymentBreakdown.additionalItems && paymentBreakdown.additionalItems.some(item => item.cost > 0));

    if (!hasPaymentData) {
      toast.error("Please fill at least one payment category");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Ensure all required properties are provided and non-optional
      addDemand({
        title: values.title,
        description: values.description,
        amount: values.amount,
        category: values.category,
        submittedBy: currentUser.name,
        ceoApproved: false,
        financeApproved: false,
        documents: documents.length > 0 ? documents : undefined,
        paymentBreakdown: hasPaymentData ? paymentBreakdown : undefined,
      });
      
      toast.success("Demand submitted successfully");
      navigate("/demands");
    } catch (error) {
      toast.error("Failed to submit demand");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit New Demand</CardTitle>
        <CardDescription>
          Fill out the form to submit a new demand for approval.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DemandBasicInfo control={form.control} />
            <DemandCategoryField control={form.control} />
            <DemandAdditionalSections 
              onDocumentsChange={handleDocumentsChange}
              onPaymentBreakdownChange={handlePaymentBreakdownChange}
              paymentBreakdown={paymentBreakdown}
            />
            <DemandFormActions 
              onCancel={() => navigate("/demands")} 
              isSubmitting={isSubmitting}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default DemandForm;