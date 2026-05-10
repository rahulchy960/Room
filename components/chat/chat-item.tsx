"use client";

import Image from "next/image";
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
  const isAdmin = currentMember.role === MemberRole.ADMIN;
  const isModerator = currentMember.role === MemberRole.MODERATOR;
  const isOwner = currentMember.id === member.id;

  const canDeleteMessage = !deleted && (isAdmin || isModerator || isOwner);
  const canEditMessage = !deleted && isOwner && !fileUrl;

  const isPDF = !!fileUrl && isPdfUrl(fileUrl);
  const isImage = !!fileUrl && isImageUrl(fileUrl);

  const onEdit = () => {
    console.log("Edit message:", {
      id,
      socketUrl,
      socketQuery,
    });
  };

  const onDelete = () => {
    console.log("Delete message:", {
      id,
      socketUrl,
      socketQuery,
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

          {!fileUrl && !deleted && (
            <p className="text-sm text-zinc-600 dark:text-zinc-300">
              {content}

              {isUpdated && (
                <span className="mx-2 text-[10px] text-muted-foreground">
                  edited
                </span>
              )}
            </p>
          )}

          {deleted && (
            <p className="mt-1 text-sm italic text-muted-foreground">
              This message has been deleted.
            </p>
          )}
        </div>
      </div>

      {(canEditMessage || canDeleteMessage) && (
        <div className="absolute right-5 top-5 hidden items-center gap-x-2 rounded-sm border bg-background p-1 group-hover:flex">
          {canEditMessage && (
            <ActionTooltip label="Edit">
              <button
                type="button"
                onClick={onEdit}
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