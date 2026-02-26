import { cn } from "@/lib/utils";
import { Avatar, AvatarImage } from "./ui/avatar";

interface UserAvaterProps {
  src?: string;
  className?: string;
};

export const UserAvatar = ({
  src,
  className
}: UserAvaterProps) => {
  return (
    <Avatar className={cn("h-7 w-7", className)}>
      <AvatarImage src={src} />
    </Avatar>
  )
}