"use client"

import { Button } from "@/components/ui/button"
import { ChefHat, User, LogOut, ShoppingCart, Calendar, Package, Menu as MenuIcon, X, Home, Info, MapPin, Mail, Bell } from "lucide-react"
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

export function Header() {
  const dispatch = useAppDispatch()
  const { user, isAuthenticated } = useAppSelector((state) => state.auth)
  const { items, itemCount } = useAppSelector((state) => state.cart)
  const { settings } = useAppSelector((state) => state.settings)
  const { unreadCount } = useAppSelector((state) => state.notifications)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser());
    }
    
    dispatch(getSettings());
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, scrolled]);

  const handleLogout = () => {
    dispatch(logout());
  }

  const navLinks = [
    { href: "/#home", label: "Home", icon: <Home className="h-4 w-4" /> },
    { href: "/#about", label: "About", icon: <Info className="h-4 w-4" /> },
    { href: "/menu", label: "Menu", icon: <ChefHat className="h-4 w-4" /> },
    { href: "/#location", label: "Location", icon: <MapPin className="h-4 w-4" /> },
    { href: "/contact", label: "Contact", icon: <Mail className="h-4 w-4" /> },
  ]

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      scrolled 
        ? "bg-white/95 border-b shadow-sm backdrop-blur-md" 
        : "bg-transparent backdrop-blur"
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            {settings?.logo ? (
              <div className="relative h-10 w-10 overflow-hidden rounded-full border-2 border-orange-100 transition-all duration-300 group-hover:border-orange-200">
                <Image 
                  src={`http://localhost:5000${settings.logo}`} 
                  alt={settings?.restaurantName || "Restaurant"} 
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 transition-all duration-300 group-hover:bg-orange-200">
                <ChefHat className="h-6 w-6" />
              </div>
            )}
            <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-orange-600 transition-colors duration-300">
              {settings?.restaurantName || "Bella Vista"}
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-orange-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <NotificationDropdown />
            )}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative rounded-full h-10 w-10 flex items-center justify-center hover:bg-orange-100 transition-colors duration-200 shadow-sm">
                <ShoppingCart className="h-5 w-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange-600 text-white text-xs flex items-center justify-center shadow-sm">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white hover:border-orange-200 transition-all duration-200 shadow-sm">
                    <Avatar className="h-full w-full">
                      <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                      <AvatarFallback className="bg-orange-100 text-orange-800 font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 border border-orange-100 shadow-lg animate-in slide-in-from-top-5 duration-300">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild className="py-2 cursor-pointer hover:bg-orange-50 rounded-md transition-colors">
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-orange-600" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="py-2 cursor-pointer hover:bg-orange-50 rounded-md transition-colors">
                    <Link href="/orders" className="flex items-center">
                      <Package className="h-4 w-4 mr-2 text-orange-600" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild className="py-2 cursor-pointer hover:bg-orange-50 rounded-md transition-colors">
                      <Link href="/admin" className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-orange-600" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 py-2 cursor-pointer hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <Button className="bg-orange-600 hover:bg-orange-700 shadow-md font-medium rounded-full px-5">
                  Login
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="relative md:hidden h-10 w-10 rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors">
                  <MenuIcon className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] pr-0 border-l border-orange-100">
                <div className="flex flex-col h-full px-6">
                  <div className="flex items-center justify-between py-4">
                    <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center space-x-2">
                      {settings?.logo ? (
                        <div className="relative h-8 w-8 overflow-hidden rounded-full">
                          <Image 
                            src={`http://localhost:5000${settings.logo}`} 
                            alt={settings?.restaurantName || "Restaurant"} 
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                          <ChefHat className="h-5 w-5" />
                        </div>
                      )}
                      <span className="text-xl font-bold text-orange-600">
                        {settings?.restaurantName || "Bella Vista"}
                      </span>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(false)} className="h-8 w-8 p-0 rounded-full hover:bg-orange-100">
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1 py-6">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        href={link.href} 
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-3 py-3 text-base rounded-md hover:bg-orange-50 text-gray-700 transition-colors"
                      >
                        <span className="text-orange-600">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>                        <div className="mt-auto pb-6 space-y-4">
                          {isAuthenticated && user ? (
                            <>
                              <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
                                <Avatar className="h-10 w-10 border-2 border-orange-100">
                                  <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                                  <AvatarFallback className="bg-orange-100 text-orange-800 font-medium">
                                    {user.name.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                              </div>
                              
                              <Link 
                                href="/profile" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-orange-50 transition-colors"
                              >
                                <User className="h-4 w-4 mr-3 text-orange-600" />
                                Profile
                              </Link>
                              
                              <Link 
                                href="/orders" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-orange-50 transition-colors"
                              >
                                <Package className="h-4 w-4 mr-3 text-orange-600" />
                                My Orders
                              </Link>                                <Link 
                                href="#" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-orange-50 transition-colors"
                              >
                                <Bell className="h-4 w-4 mr-3 text-orange-600" />
                                Notifications
                                {unreadCount > 0 && (
                                  <span className="ml-2 bg-orange-600 text-white text-xs rounded-full px-2 py-0.5">
                                    {unreadCount}
                                  </span>
                                )}
                              </Link>
                        
                        {user.role === 'admin' && (
                          <Link 
                            href="/admin" 
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-orange-50 transition-colors"
                          >
                            <Calendar className="h-4 w-4 mr-3 text-orange-600" />
                            Admin Dashboard
                          </Link>
                        )}
                        
                        <Button 
                          onClick={() => {
                            handleLogout();
                            setMobileMenuOpen(false);
                          }} 
                          variant="outline" 
                          className="w-full text-red-600 border-red-200 hover:bg-red-50 rounded-md"
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </>
                    ) : (
                      <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full bg-orange-600 hover:bg-orange-700 rounded-md">
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
