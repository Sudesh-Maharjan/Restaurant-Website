"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Mail, Phone, Calendar, DollarSign, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, Customer } from "@/redux/slices/customerSlice"
import { getOrders } from "@/redux/slices/orderSlice"
import { useToast } from "@/hooks/use-toast"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
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

// Form schema
const customerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(5, { message: "Phone number must be at least 5 characters." }),
  address: z.string().optional(),
})

type CustomerFormValues = z.infer<typeof customerFormSchema>

export default function AdminCustomers() {
  const dispatch = useAppDispatch()
  const { customers, isLoading, error } = useAppSelector((state) => state.customers)
  const { orders } = useAppSelector((state) => state.orders)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Initialize form
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  })

  useEffect(() => {
    dispatch(getCustomers())
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

  useEffect(() => {
    if (selectedCustomer && isEditing) {
      form.reset({
        name: selectedCustomer.name,
        email: selectedCustomer.email,
        phone: selectedCustomer.phone,
        address: selectedCustomer.address || "",
      })
    }
  }, [selectedCustomer, isEditing, form])

  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      customer.name.toLowerCase().includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      (customer.phone && customer.phone.toLowerCase().includes(searchLower))
    )
  })

  const getCustomerOrders = (customerId: string) => {
    return orders.filter((order) => order.customer._id === customerId)
  }

  const getCustomerTier = (totalSpent: number) => {
    if (totalSpent >= 500) return { tier: "Gold", color: "bg-yellow-100 text-yellow-800" }
    if (totalSpent >= 200) return { tier: "Silver", color: "bg-gray-100 text-gray-800" }
    return { tier: "Bronze", color: "bg-orange-100 text-orange-800" }
  }

  const handleAddNewCustomer = () => {
    setIsEditing(false)
    form.reset({
      name: "",
      email: "",
      phone: "",
      address: "",
    })
    setIsFormDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditing(true)
    setIsFormDialogOpen(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCustomer = () => {
    if (selectedCustomer) {
      dispatch(deleteCustomer(selectedCustomer._id))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Customer deleted successfully",
          })
          setIsDeleteDialogOpen(false)
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: err || "Failed to delete customer",
            variant: "destructive",
          })
        })
    }
  }

  const onSubmit = (data: CustomerFormValues) => {
    if (isEditing && selectedCustomer) {
      dispatch(updateCustomer({ id: selectedCustomer._id, customerData: data }))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Customer updated successfully",
          })
          setIsFormDialogOpen(false)
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: err || "Failed to update customer",
            variant: "destructive",
          })
        })
    } else {
      // Ensure address is a string (not undefined) for createCustomer
      const customerData = {
        ...data,
        address: data.address || "", // Convert undefined to empty string
      }
      
      dispatch(createCustomer(customerData))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Customer created successfully",
          })
          setIsFormDialogOpen(false)
        })
        .catch((err) => {
          toast({
            title: "Error",
            description: err || "Failed to create customer",
            variant: "destructive",
          })
        })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button onClick={handleAddNewCustomer} className="bg-orange-600 hover:bg-orange-700">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold">{customers.length}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gold Members</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {customers.filter((c) => c.totalSpent >= 500).length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-bold">⭐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-green-600">
                  $
                  {customers.length > 0 && customers.reduce((sum, c) => sum + c.totalOrders, 0) > 0
                    ? (
                        customers.reduce((sum, c) => sum + c.totalSpent, 0) /
                        customers.reduce((sum, c) => sum + c.totalOrders, 0)
                      ).toFixed(2)
                    : "0.00"}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-purple-600">
                  {
                    customers.filter((c) => {
                      const joinDate = new Date(c.joinedDate)
                      const now = new Date()
                      return joinDate.getMonth() === now.getMonth() && joinDate.getFullYear() === now.getFullYear()
                    }).length
                  }
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => {
                  const customerTier = getCustomerTier(customer.totalSpent)
                  return (
                    <TableRow key={customer._id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-gray-500">ID: {customer._id.slice(-8)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail className="h-3 w-3 mr-1" />
                            {customer.email}
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {customer.phone || 'No phone provided'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={customerTier.color}>{customerTier.tier}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{customer.totalOrders}</TableCell>
                      <TableCell className="font-medium text-green-600">${customer.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>{formatDate(customer.joinedDate)}</TableCell>
                      <TableCell>{formatDate(customer.lastOrderDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-1">
                          <Button variant="outline" size="sm" onClick={() => {
                            setSelectedCustomer(customer)
                            setIsDialogOpen(true)
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditCustomer(customer)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteCustomer(customer)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}

                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No customers found. Try adjusting your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Customer Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedCustomer && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Customer Details - {selectedCustomer.name}
                </DialogTitle>
                <DialogDescription>
                  Customer since {formatDate(selectedCustomer.joinedDate)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Contact Information</h4>
                    <p>
                      <strong>Name:</strong> {selectedCustomer.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {selectedCustomer.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {selectedCustomer.phone || 'No phone provided'}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedCustomer.address || 'No address provided'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Customer Stats</h4>
                    <p>
                      <strong>Total Orders:</strong> {selectedCustomer.totalOrders}
                    </p>
                    <p>
                      <strong>Total Spent:</strong> ${selectedCustomer.totalSpent.toFixed(2)}
                    </p>
                    <p>
                      <strong>Avg Order:</strong> ${
                        selectedCustomer.totalOrders > 0
                          ? (selectedCustomer.totalSpent / selectedCustomer.totalOrders).toFixed(2)
                          : "0.00"
                      }
                    </p>
                    <p>
                      <strong>Tier:</strong>{" "}
                      <Badge className={getCustomerTier(selectedCustomer.totalSpent).color}>
                        {getCustomerTier(selectedCustomer.totalSpent).tier}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Recent Orders</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {getCustomerOrders(selectedCustomer._id)
                      .slice(0, 5)
                      .map((order) => (
                        <div
                          key={order._id}
                          className="flex items-center justify-between p-2 border rounded"
                        >
                          <div>
                            <p className="font-medium">{order._id.slice(-8)}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(order.createdAt)} - {order.items.length} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.totalAmount.toFixed(2)}</p>
                            <Badge
                              className={`text-xs ${
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    {getCustomerOrders(selectedCustomer._id).length === 0 && (
                      <p className="text-gray-500 text-center py-4">No orders found</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Customer Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update customer information in the form below." 
                : "Fill out the form below to add a new customer."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email Address" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone Number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsFormDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isEditing ? "Update Customer" : "Add Customer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer "{selectedCustomer?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteCustomer}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
