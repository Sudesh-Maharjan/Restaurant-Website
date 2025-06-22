"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Package, XCircle, Loader2, ArrowLeft, Receipt, CalendarClock, CreditCard, BanknoteIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import Link from "next/link"
import api from "@/services/api"
import { getMyOrders } from "@/redux/slices/orderSlice"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Price } from "@/components/ui/price"
import { formatDate } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

// Define the order status badge component
const OrderStatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Clock className="w-3 h-3 mr-1" /> Pending
      </Badge>
    case 'preparing':
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
        <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Preparing
      </Badge>
    case 'ready':
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
        <CheckCircle className="w-3 h-3 mr-1" /> Ready
      </Badge>
    case 'delivered':
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
        <Package className="w-3 h-3 mr-1" /> Delivered
      </Badge>
    case 'cancelled':
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
        <XCircle className="w-3 h-3 mr-1" /> Cancelled
      </Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function OrdersPage() {
  const dispatch = useAppDispatch()
  const { orders, isLoading } = useAppSelector((state) => state.orders)
  const { settings } = useAppSelector((state) => state.settings)
  const { toast } = useToast()
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [openOrderDetails, setOpenOrderDetails] = useState(false)

  useEffect(() => {
    dispatch(getMyOrders())
      .unwrap()
      .catch((error) => {
        toast({
          title: "Error",
          description: error || "Failed to load your orders",
          variant: "destructive",
        })
      })
  }, [dispatch, toast])

  // Filter orders by status for the tabs
  const pendingOrders = orders.filter(order => 
    ['pending', 'preparing', 'ready'].includes(order.status))
  const completedOrders = orders.filter(order => 
    order.status === 'delivered')
  const cancelledOrders = orders.filter(order => 
    order.status === 'cancelled')
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center mb-6">
          <Link href="/" passHref>
            <Button variant="ghost" className="p-0 mr-4 h-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">My Orders</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="w-full">
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="w-full">
            <CardContent className="p-6 text-center">
              <div className="py-12 flex flex-col items-center">
                <Receipt className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-1">No orders yet</h3>
                <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                <Link href="/menu" passHref>
                  <Button>Browse Menu</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({pendingOrders.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledOrders.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetails={() => {
                    setSelectedOrder(order)
                    setOpenOrderDetails(true)
                  }}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="active" className="space-y-4">
              {pendingOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetails={() => {
                    setSelectedOrder(order)
                    setOpenOrderDetails(true)
                  }}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {completedOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetails={() => {
                    setSelectedOrder(order)
                    setOpenOrderDetails(true)
                  }}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              {cancelledOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onViewDetails={() => {
                    setSelectedOrder(order)
                    setOpenOrderDetails(true)
                  }}
                />
              ))}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Order Details Dialog */}
        <Dialog open={openOrderDetails} onOpenChange={setOpenOrderDetails}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Order #{selectedOrder._id.substring(selectedOrder._id.length - 6)}</span>
                    <OrderStatusBadge status={selectedOrder.status} />
                  </DialogTitle>
                  <DialogDescription>
                    Placed on {formatDate(selectedOrder.createdAt)}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 my-4">
                  {/* Payment & Order Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <CalendarClock className="h-4 w-4 mr-2" />
                          Order Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="font-medium">{selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="font-medium">{selectedOrder.paid ? 'Paid' : 'Not Paid'}</div>
                        {selectedOrder.paymentMethod && (
                          <div className="text-sm text-gray-500">via {selectedOrder.paymentMethod}</div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                          <BanknoteIcon className="h-4 w-4 mr-2" />
                          Total
                        </CardTitle>
                      </CardHeader>                      <CardContent>
                        <div className="font-medium">
                          <Price 
                            amount={selectedOrder.total} 
                            currency={settings?.currency || 'USD'} 
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Order Items */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Order Items</h3>
                    <Card>
                      <CardContent className="p-0">
                        <div className="divide-y">
                          {selectedOrder.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center py-4 px-6">
                              <div className="flex-shrink-0 mr-4">
                                {item.image ? (
                                  <div className="h-16 w-16 rounded-md overflow-hidden relative">
                                    <Image
                                      src={item.image}
                                      alt={item.name}
                                      fill
                                      sizes="64px"
                                      className="object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder.jpg';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                                    <Package className="h-8 w-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>                                <div className="text-sm text-gray-500">
                                  <Price 
                                    amount={item.price} 
                                    currency={settings?.currency || 'USD'} 
                                  /> x {item.quantity}
                                </div>
                              </div>                              <div className="font-medium">
                                <Price 
                                  amount={item.price * item.quantity} 
                                  currency={settings?.currency || 'USD'} 
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between bg-gray-50 px-6 py-3">
                        <span className="font-medium">Total</span>                        <span className="font-medium">
                          <Price 
                            amount={selectedOrder.total} 
                            currency={settings?.currency || 'USD'} 
                          />
                        </span>
                      </CardFooter>
                    </Card>
                  </div>
                  
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Customer Information</h3>
                    <Card>
                      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Name</div>
                          <div>{selectedOrder.customer?.name || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Phone</div>
                          <div>{selectedOrder.phone || selectedOrder.customer?.phone || 'N/A'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Email</div>
                          <div>{selectedOrder.email || selectedOrder.customer?.email || 'N/A'}</div>
                        </div>
                        {selectedOrder.address && (
                          <div>
                            <div className="text-sm text-gray-500 mb-1">Address</div>
                            <div>{selectedOrder.address}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div>
                      <h3 className="font-medium text-lg mb-3">Notes</h3>
                      <Card>
                        <CardContent className="p-6">
                          <p>{selectedOrder.notes}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingInfo: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

// Status styles
const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusIcons = {
  pending: Clock,
  processing: Package,
  completed: CheckCircle,
  cancelled: XCircle,
}

// Order Card Component
const OrderCard = ({ order, onViewDetails }: { order: any, onViewDetails: () => void }) => {
  const { settings } = useAppSelector((state) => state.settings);
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-4 px-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">
            Order #{order._id.substring(order._id.length - 6)}
          </CardTitle>
          <CardDescription>
            {formatDate(order.createdAt)}
          </CardDescription>
        </div>
        <OrderStatusBadge status={order.status} />
      </CardHeader>
      <CardContent className="px-6 pb-2">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1">
            {order.items.slice(0, 3).map((item: any, idx: number) => (              <div key={idx} className="text-sm py-1 flex justify-between">
                <span className="text-gray-700">{item.quantity}x {item.name}</span>
                <span className="font-medium">
                  <Price amount={item.price * item.quantity} currency={settings?.currency || 'USD'} />
                </span>
              </div>
            ))}
            {order.items.length > 3 && (
              <div className="text-sm text-gray-500 mt-1">
                +{order.items.length - 3} more item(s)
              </div>
            )}
          </div>
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Total</div>            <div className="font-medium">
              <Price amount={order.total} currency={settings?.currency || 'USD'} />
            </div>
          </div>
          <Button onClick={onViewDetails}>View Details</Button>
        </div>
      </CardContent>
    </Card>
  );
};
