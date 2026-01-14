"use client"
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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
import { useEffect, useState } from "react";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Server name is required."
  }),
  imageUrl: z.string().min(1, {
    message: "Server Image is Required"
  })
});

export const InitialModal = () => {

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
  }

  return (
    <Dialog open>
      <DialogContent className="
        bg-card text-card-foreground
        p-0 overflow-hidden
        border border-border
        shadow-md hover:shadow-xl
        transition-shadow
        rounded-xl
      ">
        <DialogHeader className="p-8 px-6 border-b border-border/60">
          <DialogTitle className="text-2xl text-center font-bold">
            Customize your server
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Give your server a personality
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-8 px-6">
              <div className="flex items-center justify-center text-center">
                TODO: IMAGE UPLOAD
              </div>
              <FormField 
              control={form.control}
              name = "name"
              render={({ field })=> (
                <FormItem>
                  <FormLabel
                    className="uppercase text-xs font-bold text-muted-foreground"
                  >
                    Server Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      disabled={isLoading}
                      className="bg-muted/50 border-0 focus-visible:ring-0 text-foreground focus-visible:ring-offset-0"
                      placeholder="Enter Server Name"
                      {...field}
                    />
                  </FormControl>
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
