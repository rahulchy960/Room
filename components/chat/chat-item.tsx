"use client";

import * as z from "zod";
import axios from "axios";
import qs from "query-string";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Member, Profile } from "@/lib/generated/prisma/browser";
import { MemberRole } from "@/lib/generated/prisma/enums";
import {
  Edit,
  FileIcon,
  FileText,
  ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Trash,
} from "lucide-react";

import { UserAvatar } from "../user-avatar";
import { ActionTooltip } from "../action-tooltip";
import { Form, FormControl, FormField, FormItem } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useModal } from "@/hooks/use-modal-store";

interface ChatItemProps {
  id: string;
  content: string;
  member: Member & {
    profile: Profile;
  };
  timestamp: string;
  fileUrl: string | null;
  deleted: boolean;
  currentMember: Member;
  isUpdated: boolean;
  socketUrl: string;
  socketQuery: Record<string, string>;
}

const roleIconMap = {
  GUEST: null,
  MODERATOR: <ShieldCheck className="ml-2 h-4 w-4 text-primary" />,
  ADMIN: <ShieldAlert className="ml-2 h-4 w-4 text-rose-500" />,
};

const isImageUrl = (url: string) => {
  return /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url.split("?")[0]);
};

const isPdfUrl = (url: string) => {
  return /\.pdf$/i.test(url.split("?")[0]);
};

const formSchema = z.object({
  content: z.string().min(1),
});

export const ChatItem = ({
  id,
  content,
  member,
  timestamp,
  fileUrl,
  deleted,
  currentMember,
  isUpdated,
  socketUrl,
  socketQuery,
}: ChatItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { onOpen } = useModal();

  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;

  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;

  const isPDF = !!fileUrl && isPdfUrl(fileUrl);
  const isImage = !!fileUrl && isImageUrl(fileUrl);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: content,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    form.reset({ content });
  }, [content, form]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `${socketUrl}/${id}`,
        query: socketQuery,
      });

      await axios.patch(url, values);

      form.reset({ content: values.content });
      setIsEditing(false);
    } catch (error) {
      console.log(error);
    }
  };

  const onDelete = () => {
    onOpen("deleteMessage", {
      apiUrl: `${socketUrl}/${id}`,
      query: socketQuery,
    });
  };

  return (
    <div className="group relative flex w-full items-center p-4 transition hover:bg-muted">
      <div className="flex w-full items-start gap-x-2">
        <div className="cursor-pointer transition hover:drop-shadow-md">
          <UserAvatar src={member.profile.imageUrl} />
        </div>

        <div className="flex w-full flex-col">
          <div className="flex items-center gap-x-2">
            <div className="flex items-center">
              <p className="cursor-pointer text-sm font-semibold hover:underline">
                {member.profile.name}
              </p>

              {roleIconMap[member.role] && (
                <ActionTooltip label={member.role}>
                  {roleIconMap[member.role]}
                </ActionTooltip>
              )}
            </div>

            <span className="text-xs text-muted-foreground">
              {timestamp}
            </span>
          </div>

          {isImage && fileUrl && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative mt-2 block aspect-square h-48 w-48 overflow-hidden rounded-md border bg-secondary"
            >
              <ImageIcon className="h-4 w-4" />
              Image attachment
            </a>
          )}

          {isPDF && fileUrl && (
            <div className="relative mt-2 flex items-center rounded-md bg-background/10 p-2">
              <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />

              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
              >
                <FileText className="h-4 w-4" />
                PDF attachment
              </a>
            </div>
          )}

          {fileUrl && !isImage && !isPDF && (
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400 flex gap-2"
            >
              <FileIcon className="h-4 w-4" />
              File attachment
            </a>
          )}

          {!fileUrl && !deleted && !isEditing && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {content}

              {isUpdated && (
                <span className="mx-2 text-[10px] text-muted-foreground">
                  edited
                </span>
              )}
            </p>
          )}

          {!fileUrl && isEditing && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full items-center gap-x-2 pt-2"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            disabled={isLoading}
                            className="bg-muted/50 border-0 focus-visible:ring-0 text-foreground focus-visible:ring-offset-0"
                            placeholder="Edited message"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button disabled={isLoading} size="sm">
                  Save
                </Button>
              </form>
              <span className="mt-1 text-[10px] text-muted-foreground">
                Press escape to cancel, enter to save
              </span>
            </Form>
          )}

          {deleted && (
            <p className="mt-1 text-sm italic text-muted-foreground">
              This message has been deleted.
            </p>
          )}
        </div>
      </div>

      {!deleted && (canEditMessage || canDeleteMessage) && (
        <div className="absolute right-5 top-5 hidden items-center gap-x-2 rounded-sm border bg-background p-1 group-hover:flex">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="text-muted-foreground transition hover:text-foreground"
              >
                <Edit className="h-4 w-4" />
              </button>
            </ActionTooltip>
          )}

          {canDeleteMessage && (
            <ActionTooltip label="Delete">
              <button
                type="button"
                onClick={onDelete}
                className="text-muted-foreground transition hover:text-rose-500"
              >
                <Trash className="h-4 w-4" />
              </button>
            </ActionTooltip>
          )}
        </div>
      )}
    </div>
  );
};
