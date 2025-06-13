import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDemands } from "@/context/DemandContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Download, FileText } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportMaintenanceRecordsToExcel } from "@/utils/excelExport";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  amount: z.coerce
    .number()
    .min(0, { message: "Amount must be a positive number." }),
  category: z.enum(["repair", "maintenance", "office"], {
    required_error: "Please select a category.",
  }),
});

const MaintenancePage = () => {
  const { currentUser } = useAuth();
  const { demands, addDemand } = useDemands();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      category: "maintenance" as const,
    },
  });

  const repairAndMaintenanceDemands = demands.filter(
    (demand) => demand.category === "repair" || demand.category === "maintenance"
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!currentUser) {
      toast.error("You must be logged in to add a record");
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure that we pass all required non-optional properties
      addDemand({
        title: values.title,
        description: values.description,
        amount: values.amount,
        category: values.category,
        submittedBy: currentUser.name,
        ceoApproved: false,
        financeApproved: false,
      });

      toast.success("Record added successfully");
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error("Failed to add record");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadTextRecords = () => {
    // In a real app, generate a PDF report with detailed data
    const reportTitle = `Maintenance and Repair Records`;
    const reportContent = `
    ${reportTitle}
    
    ${repairAndMaintenanceDemands
      .map(
        (demand) => `
    - Title: ${demand.title}
    - Description: ${demand.description}
    - Amount: PKR ${demand.amount.toLocaleString()}
    - Category: ${demand.category}
    - Status: ${demand.status}
    - Submitted By: ${demand.submittedBy}
    - Submitted Date: ${new Date(demand.submittedAt).toLocaleDateString()}
    `
      )
      .join("\n")}
    
    Generated on: ${new Date().toLocaleDateString()}
    `;

    // Create a Blob and trigger download
    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Records downloaded successfully");
  };

  const downloadExcelRecords = () => {
    exportMaintenanceRecordsToExcel(repairAndMaintenanceDemands);
    toast.success("Excel records downloaded successfully");
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Repair & Maintenance Records
        </h2>

        <div className="flex space-x-2">
          {currentUser?.role === "facility" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Maintenance or Repair Record</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new record
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter record title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the record in detail"
                              {...field}
                              rows={4}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col md:flex-row gap-4">
                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Amount (PKR)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Category</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="repair">Repair</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : "Add Record"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={downloadTextRecords}>
              <FileText className="mr-2 h-4 w-4" />
              Text Records
            </Button>
            <Button variant="outline" onClick={downloadExcelRecords}>
              <Download className="mr-2 h-4 w-4" />
              Excel Records
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance & Repair Records</CardTitle>
          <CardDescription>
            View all maintenance and repair records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {repairAndMaintenanceDemands.length > 0 ? (
                  repairAndMaintenanceDemands.map((demand) => (
                    <TableRow key={demand.id}>
                      <TableCell className="font-medium">{demand.title}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {demand.description}
                      </TableCell>
                      <TableCell className="capitalize">{demand.category}</TableCell>
                      <TableCell>{formatAmount(demand.amount)}</TableCell>
                      <TableCell className="capitalize">{demand.status}</TableCell>
                      <TableCell>{formatDate(demand.submittedAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No maintenance or repair records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenancePage;