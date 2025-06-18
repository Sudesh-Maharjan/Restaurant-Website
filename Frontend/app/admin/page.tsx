"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ShoppingBag, Users, DollarSign, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getOrders } from "@/redux/slices/orderSlice"
import { getCustomers } from "@/redux/slices/customerSlice"
import { getProducts } from "@/redux/slices/productSlice"

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const { orders, isLoading: ordersLoading } = useAppSelector((state) => state.orders)
  const { customers, isLoading: customersLoading } = useAppSelector((state) => state.customers)
  const { products } = useAppSelector((state) => state.product) // Change state.products to state.product
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getOrders()),
          dispatch(getCustomers()),
          dispatch(getProducts())
        ])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [dispatch])

  // Calculate statistics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = orders.length
  const totalCustomers = customers.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Get recent orders (last 5)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // Get popular items
  const itemCounts: Record<string, number> = {}
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const productItem = products.find(p => p._id === item.product)
      const itemName = item.name || (productItem ? productItem.name : 'Unknown Product')
      itemCounts[itemName] = (itemCounts[itemName] || 0) + (item.quantity || 1)
    })
  })

  const popularItems = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, orders: count }))

  if (isLoading || ordersLoading || customersLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
        </div>
      </div>

      <Tabs defaultValue="today" className="mb-8">
        <TabsList>
          <TabsTrigger value="today">All Time</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>From {totalOrders} orders</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingBag className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>
                    {orders.filter((o) => o.status === "pending" || o.status === "preparing").length} active
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers}</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>Registered users</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
                <div className="flex items-center text-xs text-green-500 mt-1">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>Per order</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Other tab contents would show filtered data */}
        <TabsContent value="week">
          <div className="text-center py-8 text-gray-500">Week view - Feature coming soon</div>
        </TabsContent>
        <TabsContent value="month">
          <div className="text-center py-8 text-gray-500">Month view - Feature coming soon</div>
        </TabsContent>
        <TabsContent value="year">
          <div className="text-center py-8 text-gray-500">Year view - Feature coming soon</div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest {recentOrders.length} orders placed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div>
                    <div className="font-medium">Order #{order._id.slice(-6)}</div>
                    <div className="text-sm text-gray-500">
                      {order.customer?.name || 'Guest'} - {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-right">${order.total.toFixed(2)}</div>
                    <div
                      className={`text-sm ${
                        order.status === "delivered"
                          ? "text-green-500"
                          : order.status === "cancelled"
                            ? "text-red-500"
                            : "text-orange-500"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && <div className="text-center py-8 text-gray-500">No orders yet</div>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Items</CardTitle>
            <CardDescription>Most ordered items</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm">
                    <span className="font-semibold">{item.orders}</span> orders
                  </div>
                </div>
              ))}
              {popularItems.length === 0 && <div className="text-center py-8 text-gray-500">No orders yet</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
