"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Price } from "@/components/ui/price"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, Loader2, DollarSign, User, MapPin, Check, Trash2 } from "lucide-react"
import {  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getOrders, updateOrderStatus, deleteOrder, updateOrderPayment, Order } from "@/redux/slices/orderSlice"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  preparing: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusIcons = {
  pending: Clock,
  preparing: Package,
  ready: CheckCircle,
  delivered: Truck,
  cancelled: XCircle,
}

export default function AdminOrders() {
  const dispatch = useAppDispatch()
  const { orders, isLoading, error } = useAppSelector((state) => state.orders)
  const { toast } = useToast()
    const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null)

  useEffect(() => {
    dispatch(getOrders())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (order.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }
  
  // Handle dialog close
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      // When dialog closes, reset the selectedOrder after a short delay
      // This prevents UI flicker during the closing animation
      setTimeout(() => {
        setSelectedOrder(null)
      }, 300)
    }
  }
  const handleUpdateOrderStatus = (orderId: string, status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled') => {
    dispatch(updateOrderStatus({ 
      id: orderId, 
      status
    }))
      .unwrap()
      .then((updatedOrder) => {
        // Update the selected order with the updated data
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        
        toast({
          title: "Success",
          description: "Order status updated successfully",
        })      })
      .catch((error: any) => {
        toast({
          title: "Error",
          description: error || "Failed to update order status",
          variant: "destructive",
        })
      })
  }

  const handleDeleteOrder = (orderId: string) => {
    setOrderToDelete(orderId)
    setIsDeleteDialogOpen(true)
  }
  const confirmDeleteOrder = () => {
    if (!orderToDelete) return
    
    dispatch(deleteOrder(orderToDelete))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Order deleted successfully",
        })
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
      })
      .catch((error: any) => {
        toast({
          title: "Error",
          description: error || "Failed to delete order",
          variant: "destructive",
        })
      })
  }
  const handleUpdatePaymentStatus = (orderId: string, paid: boolean, paymentMethod?: string) => {
    dispatch(updateOrderPayment({ 
      id: orderId, 
      paid,
      paymentMethod
    }))
      .unwrap()
      .then((updatedOrder) => {
        // Update the selected order with the updated data if needed
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(updatedOrder);
        }
        
        toast({
          title: "Success",
          description: `Payment status updated to ${paid ? 'Paid' : 'Unpaid'}`,
        })
      })
      .catch((error: any) => {
        toast({
          title: "Error",
          description: error || "Failed to update payment status",
          variant: "destructive",
        })
      })
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid date";
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="text-sm text-gray-500">Total Orders: {orders.length}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">📋</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter((o) => o.status === "pending").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready/Delivered</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter((o) => o.status === "ready" || o.status === "delivered").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-red-600">
                  {orders.filter((o) => o.status === "cancelled").length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">{order._id.slice(-8)}</TableCell>                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customer?.name || 'Guest'}</div>
                          <div className="text-sm text-gray-500">{order.email || order.customer?.email || 'No email'}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.phone || order.customer?.phone || 'No phone'}</TableCell>                      <TableCell>
                        <Price amount={order.total} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`paid-${order._id}`}
                            checked={order.paid}
                            onCheckedChange={(checked) => handleUpdatePaymentStatus(order._id, checked)}
                          />
                          <Label htmlFor={`paid-${order._id}`} className="cursor-pointer">
                            {order.paid ? (
                              <Badge className="bg-green-100 text-green-800">
                                <DollarSign className="h-3 w-3 mr-1" />
                                Paid
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Unpaid
                              </Badge>
                            )}
                          </Label>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.createdAt)}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </TableCell>                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDeleteOrder(order._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No orders found. Try a different search term or filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              <span className="bg-orange-100 text-orange-600 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                📋
              </span>
              Order Details
            </DialogTitle>
            {selectedOrder && (
              <DialogDescription className="text-gray-500 flex items-center justify-between">
                <span>Order #{selectedOrder._id.slice(-8)} • {formatDate(selectedOrder.createdAt || "")}</span>
                <Badge className={`${statusColors[selectedOrder.status]} px-3 py-1`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </Badge>
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="border rounded-lg p-4 space-y-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 flex items-center border-b pb-2">
                    <Package className="h-4 w-4 mr-2 text-orange-600" />
                    Order Items
                  </h3>                  <div className="space-y-3">
                    {selectedOrder?.items?.length > 0 ? (
                      selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center space-x-3 py-2 hover:bg-gray-50 px-2 rounded-md transition-colors">
                          <div className="relative h-14 w-14 rounded-md overflow-hidden border border-gray-200">
                            <Image
                              src={item.image ? (item.image.startsWith('/uploads') ? `${process.env.NEXT_PUBLIC_API_URL}${item.image}` : item.image) : '/placeholder.svg'}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              <Price amount={item.price} /> x {item.quantity}
                            </div>
                          </div>
                          <div className="font-semibold text-gray-900">
                            <Price amount={item.price * item.quantity} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 text-center py-4">No items found in this order</div>
                    )}
                  </div>

                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">                      <span>Subtotal</span>
                      <Price amount={selectedOrder.total} />
                    </div>
                    <div className="flex justify-between font-semibold text-gray-900">                      <span>Total</span>
                      <span className="text-orange-600">
                        <Price amount={selectedOrder.total} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
                    <User className="h-4 w-4 mr-2 text-orange-600" />
                    Customer Information
                  </h3>                  <div className="space-y-2">
                    <p className="text-sm flex items-center">
                      <span className="w-20 text-gray-500">Name:</span>
                      <span className="font-medium">{selectedOrder?.customer?.name || 'Guest'}</span>
                    </p>
                    <p className="text-sm flex items-center">
                      <span className="w-20 text-gray-500">Email:</span>
                      <span>{selectedOrder?.email || selectedOrder?.customer?.email || 'No email provided'}</span>
                    </p>
                    <p className="text-sm flex items-center">
                      <span className="w-20 text-gray-500">Phone:</span>
                      <span>{selectedOrder?.phone || selectedOrder?.customer?.phone || 'No phone provided'}</span>
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
                    <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                    Delivery Address
                  </h3>                  <p className="text-sm">
                    {selectedOrder?.address || 'No address provided'}
                  </p>
                </div>

                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
                    <DollarSign className="h-4 w-4 mr-2 text-orange-600" />
                    Payment Information
                  </h3>                  <div className="space-y-2">                    <p className="text-sm flex items-center">
                      <span className="w-20 text-gray-500">Status:</span>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`dialog-paid-${selectedOrder._id}`}
                          checked={selectedOrder?.paid || false}
                          onCheckedChange={(checked) => handleUpdatePaymentStatus(selectedOrder._id, checked)}
                        />
                        {selectedOrder?.paid ? (
                          <Badge className="bg-green-100 text-green-800">
                            <DollarSign className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Unpaid
                          </Badge>
                        )}
                      </div>
                    </p>                    <p className="text-sm flex items-center">
                      <span className="w-20 text-gray-500">Method:</span>                      <Select 
                        value={selectedOrder?.paymentMethod || "none"} 
                        onValueChange={(value) => handleUpdatePaymentStatus(selectedOrder._id, selectedOrder?.paid || false, value === "none" ? "" : value)}
                      >
                        <SelectTrigger className="w-[180px] h-8">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>                        <SelectContent>
                          <SelectItem value="none">Not specified</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </p>
                  </div>
                </div>                <div className="border rounded-lg p-4 shadow-sm">
                  <h3 className="font-semibold text-gray-800 flex items-center border-b pb-2 mb-3">
                    <Clock className="h-4 w-4 mr-2 text-orange-600" />
                    Order Status
                  </h3>
                  <div className="space-y-4">                    <div className="grid grid-cols-2 gap-2">                      
                      {selectedOrder?.status === "pending" && (
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "preparing")}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Mark as Preparing
                        </Button>
                      )}
                      {selectedOrder?.status === "preparing" && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "ready")}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Ready
                        </Button>
                      )}
                      {selectedOrder?.status === "ready" && (
                        <Button
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "delivered")}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Mark as Delivered
                        </Button>
                      )}                      {selectedOrder && selectedOrder.status !== "cancelled" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleUpdateOrderStatus(selectedOrder._id, "cancelled")}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
                        </Button>
                      )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Status Timeline</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50"                          onClick={() => {
                            setIsDialogOpen(false);
                            setTimeout(() => {
                              if (selectedOrder) {
                                handleDeleteOrder(selectedOrder._id);
                              }
                            }, 200);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete Order
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-xs">
                          <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${selectedOrder?.status === 'pending' ? 'bg-yellow-500 text-white' : (selectedOrder?.status === 'cancelled' ? 'bg-gray-300' : 'bg-green-500 text-white')}`}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="font-medium">Order Received</span>
                          <span className="ml-auto text-gray-500">{formatDate(selectedOrder.createdAt)}</span>
                        </div>
                        
                        <div className="flex items-center text-xs">                          <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${selectedOrder?.status === 'pending' ? 'bg-gray-300' : (selectedOrder?.status === 'cancelled' ? 'bg-gray-300' : 'bg-green-500 text-white')}`}>
                            {selectedOrder?.status !== 'pending' && selectedOrder?.status !== 'cancelled' ? <Check className="h-3 w-3" /> : null}
                          </div>
                          <span className={selectedOrder?.status !== 'pending' && selectedOrder?.status !== 'cancelled' ? "font-medium" : "text-gray-500"}>Preparing</span>
                        </div>
                        
                        <div className="flex items-center text-xs">                          <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${selectedOrder?.status === 'ready' || selectedOrder?.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                            {selectedOrder?.status === 'ready' || selectedOrder?.status === 'delivered' ? <Check className="h-3 w-3" /> : null}
                          </div>
                          <span className={selectedOrder?.status === 'ready' || selectedOrder?.status === 'delivered' ? "font-medium" : "text-gray-500"}>Ready for Pickup</span>
                        </div>
                        
                        <div className="flex items-center text-xs">                          <div className={`w-5 h-5 rounded-full mr-2 flex items-center justify-center ${selectedOrder?.status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-300'}`}>
                            {selectedOrder?.status === 'delivered' ? <Check className="h-3 w-3" /> : null}
                          </div>
                          <span className={selectedOrder?.status === 'delivered' ? "font-medium" : "text-gray-500"}>Delivered</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the order and remove the data from the server.
              {orderToDelete && <div className="mt-2 font-medium">Order ID: {orderToDelete.slice(-8)}</div>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOrderToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDeleteOrder}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
