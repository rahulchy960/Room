"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useModal } from "@/hooks/use-modal-store";
import { Button } from "../ui/button";
import { useState } from "react";
import axios from "axios";
import qs from "query-string";
import { useRouter } from "next/navigation";

export const DeleteChannelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const router = useRouter();

  const isModalOpen = isOpen && type === "deleteChannel";
  const { server, channel } = data; 

  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try{
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        }
      })

      await axios.delete(url);

      onClose();
      router.refresh();
      // router.push(`/servers/${server?.id}`);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }
 
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
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
            Delete Channel
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Are you sure you want to do this? <br />
            <span className="font-semibold text-primary">
              @{channel?.name} 
            </span>{" "}
            will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="bg-muted px-6 py-4">
          <div className="flex items-center justify-between w-full">
            <Button
              disabled={isLoading}
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading}
              onClick={onClick}
              variant="destructive"
            >
              Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
