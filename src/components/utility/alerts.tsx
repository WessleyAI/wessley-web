import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { IconBell, IconBellOff } from "@tabler/icons-react"
import { FC } from "react"
import { SIDEBAR_ICON_SIZE } from "../sidebar/sidebar-switcher"

interface AlertsProps {}

export const Alerts: FC<AlertsProps> = () => {
  // For now, show empty state - notifications will be implemented with real-time updates
  const notifications: Array<{ id: string; title: string; message: string; read: boolean }> = []
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative cursor-pointer hover:opacity-50">
          <IconBell size={SIDEBAR_ICON_SIZE} />
          {unreadCount > 0 && (
            <span className="notification-indicator absolute right-[-4px] top-[-4px] flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className="mb-2 w-80">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
              <IconBellOff size={32} className="mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
              <p className="text-xs opacity-70">You&apos;re all caught up!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`rounded-md p-2 text-sm ${
                    notification.read ? "opacity-60" : "bg-muted"
                  }`}
                >
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-xs text-muted-foreground">{notification.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
