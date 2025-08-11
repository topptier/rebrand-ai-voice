import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Call, CallForm } from "@/hooks/useCalls";

const callSchema = z.object({
  caller_name: z.string().min(1, "Caller name is required"),
  caller_phone: z.string().min(1, "Caller phone is required"),
  call_type: z.enum(["inbound", "outbound"], {
    required_error: "Call type is required",
  }),
  notes: z.string().optional(),
});

type CallFormData = z.infer<typeof callSchema>;

interface CallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  call?: Call | null;
  onSubmit: (data: CallForm) => Promise<void>;
  loading?: boolean;
}

export const CallModal = ({
  open,
  onOpenChange,
  call,
  onSubmit,
  loading = false,
}: CallModalProps) => {
  const form = useForm<CallFormData>({
    resolver: zodResolver(callSchema),
    defaultValues: {
      caller_name: "",
      caller_phone: "",
      call_type: "inbound",
      notes: "",
    },
  });

  const isEditMode = !!call;

  useEffect(() => {
    if (call) {
      form.reset({
        caller_name: call.caller_name,
        caller_phone: call.caller_phone,
        call_type: call.call_type,
        notes: call.notes || "",
      });
    } else {
      form.reset({
        caller_name: "",
        caller_phone: "",
        call_type: "inbound",
        notes: "",
      });
    }
  }, [call, form]);

  const handleSubmit = async (data: CallFormData) => {
    try {
      await onSubmit({
        caller_name: data.caller_name,
        caller_phone: data.caller_phone,
        call_type: data.call_type,
        notes: data.notes || undefined,
      });
      onOpenChange(false);
      if (!isEditMode) {
        form.reset();
      }
    } catch (error) {
      // Error handling is done in the hook
      console.error("Failed to save call:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Call" : "Log New Call"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="caller_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caller Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter caller name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="caller_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="call_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select call type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inbound">Inbound</SelectItem>
                      <SelectItem value="outbound">Outbound</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any notes about the call..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Call" : "Log Call"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};