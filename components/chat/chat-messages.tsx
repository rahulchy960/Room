"use client";

import { Fragment } from "react";
import Image from "next/image";
import { Member, Message, Profile } from "@/lib/generated/prisma/client";
import { FileIcon, Loader2, ServerCrash } from "lucide-react";

import { ChatWelcome } from "./chat-welcome";
import { useChatQuery } from "@/hooks/use-chat-query";

type MessageWithMemberWithProfile = Message & {
  member: Member & {
    profile: Profile
  }
}

const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(url.split("?")[0]);
const isPdfUrl = (url: string) => /\.pdf$/i.test(url.split("?")[0]);

interface ChatMessagesProps {
  name: string;
  member: Member;
  chatId: string;
  apiUrl: string;
  socketUrl: string;
  socketQuery: Record<string, string>;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
  type: "channel" | "conversation";
}

export const ChatMessages = ({
  name,
  chatId,
  apiUrl,
  paramKey,
  paramValue,
  type,
}: ChatMessagesProps) => {
  const queryKey = `chat:${chatId}`;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useChatQuery({
    queryKey,
    apiUrl,
    paramKey,
    paramValue,
  });

  if (status === "pending") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader2 className="my-4 h-7 w-7 animate-spin text-zinc-500" />
        <p className="text-xs text-zinc-500">Loading messages...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <ServerCrash className="my-4 h-7 w-7 text-zinc-500" />
        <p className="text-xs text-zinc-500">Something went wrong!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto py-4">
      <div className="flex-1" />

      <ChatWelcome type={type} name={name} />

      <div className="mt-auto flex flex-col-reverse">
        {hasNextPage && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="my-4 text-xs text-zinc-500 hover:text-zinc-600 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              {isFetchingNextPage ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Load previous messages"
              )}
            </button>
          </div>
        )}

        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message) => (
              <div key={message.id} className="px-4 py-2 space-y-2">
                {message.fileUrl && isImageUrl(message.fileUrl) && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block aspect-square h-48 w-48 overflow-hidden rounded-md border bg-secondary"
                  >
                    <Image
                      src={message.fileUrl}
                      alt={message.content || "Attached image"}
                      fill
                      sizes="192px"
                      className="object-cover"
                    />
                  </a>
                )}
                {message.fileUrl && isPdfUrl(message.fileUrl) && (
                  <div className="relative flex items-center rounded-md bg-background/10 p-2">
                    <FileIcon className="h-10 w-10 fill-indigo-200 stroke-indigo-400" />
                    <a
                      href={message.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-sm text-indigo-500 hover:underline dark:text-indigo-400"
                    >
                      PDF File
                    </a>
                  </div>
                )}
                {message.fileUrl && !isImageUrl(message.fileUrl) && !isPdfUrl(message.fileUrl) && (
                  <a
                    href={message.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-500 hover:underline dark:text-indigo-400"
                  >
                    Open attachment
                  </a>
                )}
                {message.content && <p className="text-sm">{message.content}</p>}
              </div>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
};