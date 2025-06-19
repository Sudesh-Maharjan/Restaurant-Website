"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { markAsRead, markAllAsRead, Notification as NotificationType } from "@/redux/slices/notificationSlice"
import { formatDistanceToNow } from "date-fns"
import {
  Bell,
  Check,
  Package,
  Clock,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function NotificationDropdown() {
  const dispatch = useAppDispatch()
  const { items, unreadCount } = useAppSelector((state) => state.notifications)
  const { user } = useAppSelector((state) => state.auth)
  const [isOpen, setIsOpen] = useState(false)

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order_placed":
        return <Package className="h-4 w-4 mr-2 text-orange-600" />
      case "status_update":
        return <Clock className="h-4 w-4 mr-2 text-blue-600" />
      default:
        return <AlertCircle className="h-4 w-4 mr-2 text-gray-600" />
    }
  }

  const getNotificationUrl = (notification: NotificationType) => {
    if (!notification.orderId) return ""
    
    return user?.role === "admin" 
      ? "/admin/orders" 
      : "/orders"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative h-10 w-10 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
        >
          <Bell className="h-5 w-5 text-gray-700" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-orange-600 text-white"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-2 border border-orange-100 shadow-lg animate-in slide-in-from-top-5 duration-300">
        <div className="flex items-center justify-between px-2 py-2">
          <h3 className="font-semibold text-base">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              onClick={handleMarkAllAsRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        
        <div className="max-h-[350px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start space-y-1 px-3 py-3 cursor-pointer rounded-md transition-colors ${
                  !notification.isRead ? "bg-orange-50" : ""
                }`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <Link 
                  href={getNotificationUrl(notification)}
                  className="w-full"
                >
                  <div className="flex items-start space-x-2 w-full">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${!notification.isRead ? "text-gray-900" : "text-gray-700"}`}>
                          {notification.title}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-xs ${!notification.isRead ? "text-gray-700" : "text-gray-500"}`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </Link>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
