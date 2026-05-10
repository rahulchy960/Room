"use client";

import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { useTheme } from "next-themes";
import { Smile } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

type EmojiSelect = {
  native: string;
};

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { resolvedTheme } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button">
          <Smile className="text-accent-foreground transition hover:text-accent-foreground/70" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        side="right"
        sideOffset={40}
        className="mb-16 border-none bg-transparent shadow-none drop-shadow-none"
      >
        <Picker
          theme={resolvedTheme === "dark" ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: EmojiSelect) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  );
};