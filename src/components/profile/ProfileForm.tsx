
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  phoneNumber: z.string().optional(),
  profilePicture: z.any().optional(),
});

const ProfileForm = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentUser?.profilePicture || null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentUser?.name || "",
      phoneNumber: currentUser?.phoneNumber || "",
      profilePicture: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // In a real app, you would upload the file to a storage service first
      const updatedUser = {
        name: values.name,
        phoneNumber: values.phoneNumber,
      };
      
      // If a new profile picture is selected, update it
      if (previewUrl && previewUrl !== currentUser?.profilePicture) {
        Object.assign(updatedUser, { profilePicture: previewUrl });
      }
      
      updateUserProfile(updatedUser);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string = "") => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Function to get background color based on role
  const getRoleBgColor = () => {
    switch (currentUser?.role) {
      case "facility":
        return "bg-facility";
      case "finance":
        return "bg-finance";
      case "ceo":
        return "bg-ceo";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Update your personal information and profile picture.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={previewUrl || undefined} />
                <AvatarFallback className={`text-xl ${getRoleBgColor()} text-white`}>
                  {getInitials(currentUser?.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <Input
                  id="profilePicture"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="profilePicture">
                  <Button variant="outline" type="button" className="cursor-pointer" asChild>
                    <span>Change Picture</span>
                  </Button>
                </label>
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Your phone number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter your phone number with country code, e.g., +92 300 1234567
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="border-t bg-gray-50/50 p-6">
        <div className="flex flex-col space-y-2 w-full">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Email</span>
            <span className="text-sm text-gray-500">{currentUser?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Role</span>
            <span className="text-sm text-gray-500">
              {currentUser?.role === "facility" && "Facility Manager"}
              {currentUser?.role === "finance" && "Finance Officer"}
              {currentUser?.role === "ceo" && "Chief Executive"}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProfileForm;
