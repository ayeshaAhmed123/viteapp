
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { DemandFormValues } from "./demand-schema";

interface DemandBasicInfoProps {
  control: Control<DemandFormValues>;
}

const DemandBasicInfo = ({ control }: DemandBasicInfoProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter demand title" {...field} />
            </FormControl>
            <FormDescription>
              A short title for the demand.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the demand in detail"
                {...field}
                rows={4}
              />
            </FormControl>
            <FormDescription>
              Provide detailed information about the demand.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default DemandBasicInfo;