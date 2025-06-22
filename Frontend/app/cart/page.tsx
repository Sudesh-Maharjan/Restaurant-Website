"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Minus, Plus, Trash2, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "../../components/header"
import { useAppDispatch, useAppSelector, selectAuth, selectCart } from "@/redux/hooks"
import { removeFromCart, updateQuantity, checkout, CartItem } from "@/redux/slices/cartSlice"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Price } from "@/components/ui/price"
import { formatPrice } from "@/lib/currency"

export default function CartPage() {
  const dispatch = useAppDispatch()
  const { items, total, itemCount, isLoading } = useAppSelector(selectCart)
  const { isAuthenticated } = useAppSelector(selectAuth)
  const { settings } = useAppSelector((state) => state.settings)
  const currency = settings?.currency || 'USD'
  const { toast } = useToast()
  const router = useRouter()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated && !redirecting) {
      setRedirecting(true)
      toast({
        title: "Authentication required",
        description: "Please login to view your cart",
        variant: "destructive",
      })
      router.push("/auth")
    }
  }, [isAuthenticated, router, toast, redirecting])

  if (!isAuthenticated || redirecting) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-500 mb-8">Please login to view your cart</p>
            <Link href="/auth">
              <Button className="bg-orange-600 hover:bg-orange-700">Go to Login</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }))
  }

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id))
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart",
    })
  }

  const handleCheckout = () => {
    router.push("/checkout")
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/#menu">
              <Button className="bg-orange-600 hover:bg-orange-700">Browse Menu</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({itemCount})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {items.map((item: CartItem) => (
                      <div key={item.id} className="flex items-center space-x-4 py-4 border-b last:border-0">
                        <div className="relative h-24 w-24 rounded-md overflow-hidden">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.description}</p>
                          <p className="text-orange-600 font-semibold mt-1">
                            <Price amount={item.price} />
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(total, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee</span>
                      <span>{formatPrice(4.99, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>{formatPrice(total * 0.08, currency)}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total + 4.99 + total * 0.08, currency)}</span>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Proceed to Checkout"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
