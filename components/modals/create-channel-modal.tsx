"use client"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import axios from "axios";
import qs from "query-string";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation";
import { useModal } from "@/hooks/use-modal-store";
import { ChannelType } from "@/lib/generated/prisma/enums";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Channel name is required."
  }).refine(
    name => name !=="general", {
      message: "Channel name cannot be 'general'"
    }
  ),
  type: z.enum(Object.values(ChannelType))
});

export const CreateChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();
  const params = useParams();

  const isModalOpen = isOpen && type === "createChannel";
  const { channelType } = data;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: channelType || ChannelType.TEXT,
    }
  });

  useEffect(() => {
    if(channelType) {
      form.setValue("type", channelType);
    } else {
      form.setValue("type", ChannelType.TEXT)
    }
  }, [channelType, form]);

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: "/api/channels",
        query: {
          serverId: params?.serverId
        }
      });
      await axios.post(url, values);

      form.reset();
      router.refresh();
      onClose();

    } catch(error) {
      console.log(error)
    }
  }

  const handleClose = () => {
    form.reset();
    onClose();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="
        bg-card text-card-foreground
        p-0 overflow-hidden
        border border-border
        shadow-md hover:shadow-xl
        transition-shadow
        rounded-xl
      "
      onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-8 px-6 border-b border-border/60">
          <DialogTitle className="text-2xl text-center font-bold">
            Create Channel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <FormField 
              control={form.control}
              name = "name"
              render={({ field })=> (
                <FormItem>
                  <FormLabel
                    className="uppercase text-xs font-semibold text-muted-foreground"
                  >
                    Channel Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading}
                      className="bg-muted/50 border-0 focus-visible:ring-0 text-foreground focus-visible:ring-offset-0"
                      placeholder="Enter Channel Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
              />  
              <FormField 
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel
                      className="uppercase text-xs font-semibold text-muted-foreground"
                    >Channel Type</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          className="w-full bg-muted/50 border-0 focus:ring-0
                          text-muted-foreground ring-offset-0 focus:ring-offset-0
                          uppercase outline-none"
                        >
                          <SelectValue placeholder="Select a channel type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ChannelType).map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="capitalize"
                          >
                            {type.toLowerCase()}
                          </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />  
            </div>
            <DialogFooter className="bg-muted/40 px-6 py-4 border-t border-border/60">
              <Button disabled={isLoading}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
