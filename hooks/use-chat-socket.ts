"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useSocket } from "@/components/providers/socket-provider";
import { MessageWithMemberWithProfile } from "./use-chat-query";

type Page = {
  items: MessageWithMemberWithProfile[];
  nextCursor: string | null;
};

type InfiniteData = {
  pages: Page[];
  pageParams: unknown[];
};

interface ChatSocketProps {
  addKey: string;
  updateKey: string;
  queryKey: string;
  paramValue: string;
}

export const useChatSocket = ({
  addKey,
  updateKey,
  queryKey,
  paramValue,
}: ChatSocketProps) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const cacheKey = [queryKey, paramValue];

    socket.on(updateKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData>(cacheKey, (oldData) => {
        if (!oldData?.pages?.length) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === message.id ? message : item,
            ),
          })),
        };
      });
    });

    socket.on(addKey, (message: MessageWithMemberWithProfile) => {
      queryClient.setQueryData<InfiniteData>(cacheKey, (oldData) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [{ items: [message], nextCursor: null }],
            pageParams: [undefined],
          };
        }

        const [first, ...rest] = oldData.pages;
        return {
          ...oldData,
          pages: [
            { ...first, items: [message, ...first.items] },
            ...rest,
          ],
        };
      });
    });

    return () => {
      socket.off(addKey);
      socket.off(updateKey);
    };
  }, [socket, queryClient, addKey, updateKey, queryKey, paramValue]);
};
