
import { z } from "zod";

export const demandFormSchema = z.object({
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

export type DemandFormValues = z.infer<typeof demandFormSchema>;
 