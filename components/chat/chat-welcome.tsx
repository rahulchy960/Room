import { AtSign } from "lucide-react";

interface chatWelcomeProps{
  name:string;
  type:"channel" | "conversation";
};



export const ChatWelcome =({name, type} : chatWelcomeProps) => { 
  return (
    <div className="space-y-2 px-4 mb-4">
      {type === "channel" && (
        <div className="h-[75px] w-[75px] rounded-full bg-background/50 flex items-center justify-center">
          <AtSign className="h-12 w-12 text-white"/>
        </div>
      )}
      <p className="text-xl md:text-3xl font-bold bg-card">
        {type === "channel" ? "Welcome to #" : "" }{name}
      </p>
      <p className="text-secondary-foreground text-sm">
        {type === "channel"
          ? `This is the start of the #${name} channel.`
          : `This the the start of your conversation with ${name}`
        }
      </p>
    </div>
  )

}