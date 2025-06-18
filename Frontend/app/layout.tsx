import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { CartProvider } from "../contexts/cart-context"
import { RestaurantProvider } from "../contexts/restaurant-context"
import { ReduxProvider } from "../redux/provider"
import WebSocketProvider from "@/components/websocket-provider"
import DynamicTitle from "@/components/dynamic-title"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Restaurant - Delicious Food and Experience",
  description: "Experience delicious cuisine in the heart of the city",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <WebSocketProvider>
            <RestaurantProvider>
              <CartProvider>
                <DynamicTitle />
                {children}
              </CartProvider>
            </RestaurantProvider>
          </WebSocketProvider>
        </ReduxProvider>
      </body>
    </html>
  )
}
