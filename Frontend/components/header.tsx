"use client"

import { Button } from "@/components/ui/button"
import {
  ChefHat,
  User,
  LogOut,
  ShoppingCart,
  Calendar,
  Package,
  MenuIcon,
  X,
  Home,
  Info,
  MapPin,
  Mail,
  Bell,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { logout, getCurrentUser } from "@/redux/slices/authSlice"
import { getSettings } from "@/redux/slices/settingsSlice"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import NotificationDropdown from "./notification-dropdown"
import { Badge } from "@/components/ui/badge"

export function Header() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { items, itemCount } = useAppSelector((state) => state.cart)
  const { settings } = useAppSelector((state) => state.settings)
  const { unreadCount } = useAppSelector((state) => state.notifications)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("token")) {
      dispatch(getCurrentUser())
    }

    dispatch(getSettings())

    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [dispatch, scrolled])

  const handleLogout = () => {
    dispatch(logout())
  }

  const navLinks = [
    { href: "/#home", label: "Home", icon: <Home className="h-4 w-4" /> },
    { href: "/#about", label: "About", icon: <Info className="h-4 w-4" /> },
    { href: "/menu", label: "Menu", icon: <ChefHat className="h-4 w-4" /> },
    { href: "/#location", label: "Location", icon: <MapPin className="h-4 w-4" /> },
    { href: "/contact", label: "Contact", icon: <Mail className="h-4 w-4" /> },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out",
        scrolled
          ? "bg-white/90 border-b border-orange-100/50 shadow-lg shadow-orange-500/5 backdrop-blur-xl"
          : "bg-gradient-to-r from-white/80 via-orange-50/30 to-white/80 backdrop-blur-md",
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-18 md:h-20 items-center justify-between">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-3 group relative">
            <div className="relative">
              {settings?.logo ? (
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-gradient-to-r from-orange-200 to-orange-300 shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <Image
                    src={`http://localhost:5000${settings.logo}`}
                    alt={settings?.restaurantName || "Restaurant"}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-105">
                  <ChefHat className="h-7 w-7" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-3 w-3 text-white m-0.5" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-gray-900 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-orange-500 group-hover:to-orange-600 transition-all duration-300">
                {settings?.restaurantName || "Bella Vista"}
              </span>
              <span className="text-xs text-orange-600/70 font-medium tracking-wider uppercase">Fine Dining</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-4 py-2 text-sm font-semibold text-gray-700 hover:text-orange-600 transition-all duration-300 rounded-xl hover:bg-orange-50/80 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="relative z-10">{link.label}</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-600 group-hover:w-8 group-hover:left-1/2 group-hover:-translate-x-1/2 transition-all duration-300 rounded-full"></div>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            {isAuthenticated && user && (
              <div className="hidden md:block">
                <NotificationDropdown />
              </div>
            )}

            {/* Cart Button */}
            <Link href="/cart">
              <Button
                variant="ghost"
                size="sm"
                className="relative h-11 w-11 rounded-2xl hover:bg-orange-50 transition-all duration-300 hover:shadow-lg hover:scale-105 group border border-orange-100/50"
              >
                <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-orange-600 transition-colors duration-300" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs flex items-center justify-center shadow-lg animate-pulse">
                    {itemCount > 99 ? "99+" : itemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {/* User Menu or Login */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative h-11 w-11 rounded-2xl overflow-hidden border-2 border-orange-100 hover:border-orange-300 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 group"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 p-3 border border-orange-100/50 shadow-2xl shadow-orange-500/10 animate-in slide-in-from-top-5 duration-300 rounded-2xl bg-white/95 backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100/50">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10 border-2 border-orange-200">
                        <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-bold text-gray-900">{user.name}</p>
                        <p className="text-xs text-orange-600 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2 bg-orange-100/50" />

                  <DropdownMenuItem
                    asChild
                    className="py-3 cursor-pointer hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                  >
                    <Link href="/profile" className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mr-3 group-hover:bg-blue-200 transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    asChild
                    className="py-3 cursor-pointer hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                  >
                    <Link href="/orders" className="flex items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600 mr-3 group-hover:bg-green-200 transition-colors">
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="font-medium">My Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "admin" && (
                    <DropdownMenuItem
                      asChild
                      className="py-3 cursor-pointer hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                    >
                      <Link href="/admin" className="flex items-center">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 mr-3 group-hover:bg-purple-200 transition-colors">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <span className="font-medium">Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="my-2 bg-orange-100/50" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="py-3 cursor-pointer hover:bg-red-50 rounded-xl transition-all duration-200 group text-red-600"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 mr-3 group-hover:bg-red-200 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl font-semibold rounded-2xl px-6 py-2.5 transition-all duration-300 hover:scale-105 border-0">
                  <span className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </span>
                </Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative lg:hidden h-11 w-11 rounded-2xl hover:bg-orange-50 transition-all duration-300 hover:shadow-lg hover:scale-105 group border border-orange-100/50"
                >
                  <MenuIcon className="h-6 w-6 text-gray-700 group-hover:text-orange-600 transition-colors duration-300" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[320px] sm:w-[400px] pr-0 border-l border-orange-100/50 bg-white/95 backdrop-blur-xl"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-6 border-b border-orange-100/50">
                    <Link
                      href="/"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 group"
                    >
                      {settings?.logo ? (
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl border-2 border-orange-200">
                          <Image
                            src={`http://localhost:5000${settings.logo}`}
                            alt={settings?.restaurantName || "Restaurant"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                          <ChefHat className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                          {settings?.restaurantName || "Bella Vista"}
                        </span>
                        <span className="text-xs text-orange-600/70 font-medium">Fine Dining</span>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMobileMenuOpen(false)}
                      className="h-10 w-10 rounded-xl hover:bg-orange-50 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex-1 px-6 py-6 space-y-2">
                    {navLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-4 px-4 py-4 text-base font-medium rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100/50 text-gray-700 hover:text-orange-600 transition-all duration-300 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                          {link.icon}
                        </div>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile User Section */}
                  <div className="border-t border-orange-100/50 p-6 space-y-4">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center space-x-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100/50">
                          <Avatar className="h-12 w-12 border-2 border-orange-200">
                            <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-gray-900">{user.name}</p>
                            <p className="text-sm text-orange-600 font-medium">{user.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            href="/profile"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <User className="h-4 w-4" />
                            </div>
                            <span>Profile</span>
                          </Link>

                          <Link
                            href="/orders"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-600">
                              <Package className="h-4 w-4" />
                            </div>
                            <span>My Orders</span>
                          </Link>

                          <Link
                            href="#"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-orange-50 transition-colors"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
                              <Bell className="h-4 w-4" />
                            </div>
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                              <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs">
                                {unreadCount}
                              </Badge>
                            )}
                          </Link>

                          {user.role === "admin" && (
                            <Link
                              href="/admin"
                              onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl hover:bg-orange-50 transition-colors"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <span>Admin Dashboard</span>
                            </Link>
                          )}
                        </div>

                        <Button
                          onClick={() => {
                            handleLogout()
                            setMobileMenuOpen(false)
                          }}
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 rounded-xl py-3 font-medium transition-all duration-300"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl py-3 font-semibold shadow-lg transition-all duration-300">
                          <User className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
