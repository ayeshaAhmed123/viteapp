
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { DemandFormValues } from "./demand-schema";

interface DemandCategoryFieldProps {
  control: Control<DemandFormValues>;
}

const DemandCategoryField = ({ control }: DemandCategoryFieldProps) => {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
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
              <SelectItem value="office">Office Use Items</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Select the category that best fits your demand.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DemandCategoryField;