"use client"

import { useEffect } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { usePathname } from 'next/navigation'

export default function DynamicTitle() {
  const { settings } = useAppSelector(state => state.settings)
  const pathname = usePathname()

  useEffect(() => {
    if (settings) {
      // Get base title from restaurant name
      let title = settings.restaurantName || 'Restaurant'
      
      // Add page-specific suffix based on pathname
      if (pathname.includes('/menu')) {
        title += ' - Menu'
      } else if (pathname.includes('/orders')) {
        title += ' - My Orders'
      } else if (pathname.includes('/profile')) {
        title += ' - My Profile'
      } else if (pathname.includes('/checkout')) {
        title += ' - Checkout'
      } else if (pathname.includes('/contact')) {
        title += ' - Contact Us'
      } else if (pathname.includes('/admin')) {
        title += ' - Admin Dashboard'
      } else if (pathname !== '/') {
        // For any other page than home
        title += ' - ' + pathname.split('/').pop()?.charAt(0).toUpperCase() + pathname.split('/').pop()?.slice(1)
      }
      
      // Update document title
      document.title = title
      
      // Update favicon if logo exists
      if (settings.logo) {
        const linkElement = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
        linkElement.type = 'image/x-icon';
        linkElement.rel = 'shortcut icon';
        linkElement.href = settings.logo;
        document.getElementsByTagName('head')[0].appendChild(linkElement);
      }
    }
  }, [settings, pathname])

  return null
}
