"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Clock, CreditCard, Loader2, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector, selectAuth, selectCart } from "@/redux/hooks"
import { clearCart } from "@/redux/slices/cartSlice"
import { createCustomer } from "@/redux/slices/customerSlice"
import { createOrder } from "@/redux/slices/orderSlice"
import { addNotification } from "@/redux/slices/notificationSlice"
import { useToast } from "@/components/ui/use-toast"
import { formatPrice } from "@/lib/currency"

// Import these at the top of your file
import { Price } from "@/components/ui/price"

export default function CheckoutPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const cartState = useAppSelector(selectCart)
  const { user, isAuthenticated } = useAppSelector(selectAuth)
  const { settings } = useAppSelector((state) => state.settings)
  const currency = settings?.currency || 'USD'
  const { toast } = useToast()
  
  const [orderType, setOrderType] = useState("pickup") // Pickup only
  const [paymentMethod, setPaymentMethod] = useState("cash") // Cash only
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ")[1] || "",
    email: user?.email || "",
    phone: user?.phone || "",
    pickupDate: new Date().toISOString().split("T")[0],
    pickupTime: "12:00",
    // Include empty fields for backward compatibility
    address: "",
    city: "",
    state: "",
    zipCode: "",
    deliveryInstructions: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: ""
  })
  
  // Calculate order total - no delivery fee
  const deliveryFee = 0 // Keep for backward compatibility
  const tax = cartState.total * 0.08
  const finalTotal = cartState.total + tax

  // Redirect to cart if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to checkout",
        variant: "destructive",
      })
      router.push("/auth")
    }
  }, [isAuthenticated, router, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Validate form - only phone is required now
    if (!formData.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide a phone number",
        variant: "destructive"
      })
      setIsSubmitting(false)
      return
    }

    try {
      // Create customer if not logged in
      let customerId = user?._id
      
      if (!customerId) {
        // Create new customer
        const customerData = {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: "" // Empty address is fine for pickup-only
        }
        
        const customerResult = await dispatch(createCustomer(customerData)).unwrap()
        customerId = customerResult._id
      }
      
      // Create order
      const orderData = {
        customer: customerId,
        items: cartState.items.map((item) => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        total: finalTotal,
        status: "pending",
        address: "Pickup in store", // Always pickup
        phone: formData.phone,
        email: formData.email,
        notes: `Pickup date: ${formData.pickupDate}, time: ${formData.pickupTime}`,
        paymentMethod: "cash", // Always cash on pickup
        paid: false // Always marked as unpaid since it's cash on pickup
      }
        
      await dispatch(createOrder(orderData)).unwrap()
      
      // Clear cart
      dispatch(clearCart())

      // Show success message with delay before redirect
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been sent to the restaurant. You'll receive updates on your order status.",
        variant: "default"
      })
      
      // Play notification sound
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.7;
        audio.play().catch(err => console.error('Error playing notification sound:', err));
      } catch (err) {
        console.error('Error playing notification sound:', err);
      }
      
      // Manually create notification in case WebSocket fails
      if (user) {
        const { v4: uuidv4 } = await import('uuid');
        const notificationId = uuidv4();
        dispatch(addNotification({
          id: notificationId,
          title: 'Order Placed',
          message: 'Your order has been received by the restaurant',
          type: 'order_placed',
          isRead: false,
          timestamp: new Date().toISOString(),
        }));
      }
      
      // Trigger a custom order placed event (as a backup in case WebSocket fails)
      if (typeof window !== 'undefined') {
        const customEvent = new CustomEvent('orderPlaced', { 
          detail: { 
            order: orderData,
            timestamp: new Date().toISOString()
          } 
        });
        window.dispatchEvent(customEvent);
      }
      
      // Give the user time to see the success message before redirecting
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartState.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link href="/">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Menu
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Cart</span>
            </Link>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmitOrder}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">              {/* Order Type - Pickup Only */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Order Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      type="button"
                      variant="default"
                      className="bg-orange-600 hover:bg-orange-700"
                      disabled
                    >
                      Pickup Only
                    </Button>
                    <p className="text-sm text-gray-500">We currently offer pickup orders only</p>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">First Name *</label>
                        <Input
                          name="firstName"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Last Name *</label>
                        <Input
                          name="lastName"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Email *</label>
                        <Input
                          name="email"
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone *</label>
                        <Input
                          name="phone"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>              {/* Delivery Address section removed - pickup only */}

              {/* Pickup Time */}
              {orderType === "pickup" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-5 w-5" />
                      <span>Pickup Time</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date *</label>
                        <Input
                          name="pickupDate"
                          type="date"
                          value={formData.pickupDate}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Time *</label>
                        <Input
                          name="pickupTime"
                          type="time"
                          value={formData.pickupTime}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}              {/* Payment Method - Cash on Pickup Only */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <Button
                        type="button"
                        variant="default"
                        className="bg-orange-600 hover:bg-orange-700"
                        disabled
                      >
                        Cash on Pickup
                      </Button>
                      <p className="text-sm text-gray-500">We currently accept cash payment on pickup only</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <p className="text-sm text-gray-500">{cartState.itemCount} items</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cartState.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <Image
                          src={item.image.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${item.image}` : item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium">
                          <Price amount={item.price * item.quantity} />
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartState.total, currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>{formatPrice(tax, currency)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-orange-600">{formatPrice(finalTotal, currency)}</span>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-orange-600 hover:bg-orange-700" 
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>                  <div className="text-xs text-gray-500 text-center">
                    Estimated pickup time: 25-35 minutes
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
