"use client"

import { Plus } from "lucide-react"
import { ActionTooltip } from "../action-tooltip"

export const NavigationAction = () => {
  return (
    <div>
      <ActionTooltip 
        side="right"
        align="center"
        label="Add a server"
      >
        <button className="group flex items-center">
          <div className="flex mx-3 h-12 w-12 rounded-3xl
            items-center justify-center overflow-hidden transition-colors
            bg-sidebar-accent text-sidebar-accent-foreground
            group-hover:rounded-2xl group-hover:bg-emerald-500 group-hover:text-white">
              <Plus 
                className="transition-colors text-emerald-500 group-hover:text-white"
                size={25}
              />
          </div>
        </button>
      </ActionTooltip>
    </div>
  )
}
