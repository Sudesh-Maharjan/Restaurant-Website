"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { Product, createProduct, deleteProduct, getProducts, updateProduct } from "@/redux/slices/productSlice"
import { useToast } from "@/hooks/use-toast"

export default function AdminProducts() {
  const dispatch = useAppDispatch()
  const { products, isLoading, error } = useAppSelector((state) => state.product)
  const { toast } = useToast()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState("")

  useEffect(() => {
    dispatch(getProducts())
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

  const filteredProducts = Array.isArray(products) 
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const handleAddProduct = () => {
    setEditingProduct({
      name: "",
      category: "",
      price: 0,
      image: "",
      description: "",
      available: true,
    })
    setImagePreview("")
    setIsDialogOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product })
    setImagePreview(product.image || "")
    setIsDialogOpen(true)
  }

  const handleDeleteProduct = (id: string) => {
    dispatch(deleteProduct(id))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error || "Failed to delete product",
          variant: "destructive",
        })
      })
  }

  const handleImageChange = (url: string) => {
    setImagePreview(url)
    handleInputChange("image", url)
  }

  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.category || !editingProduct.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const productData = {
      name: editingProduct.name,
      category: editingProduct.category,
      price: editingProduct.price.toString(),
      description: editingProduct.description || "",
      available: editingProduct.available ? "true" : "false",
      image: editingProduct.image || ""
    }

    if (editingProduct._id) {
      dispatch(updateProduct({ id: editingProduct._id, productData }))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Product updated successfully",
          })
          setIsDialogOpen(false)
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error || "Failed to update product",
            variant: "destructive",
          })
        })
    } else {
      dispatch(createProduct(productData))
        .unwrap()
        .then(() => {
          toast({
            title: "Success",
            description: "Product created successfully",
          })
          setIsDialogOpen(false)
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error || "Failed to create product",
            variant: "destructive",
          })
        })
    }
  }

  const handleInputChange = (field: keyof Product, value: any) => {
    setEditingProduct((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingProduct?._id ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct?._id ? "Make changes to the menu item" : "Create a new menu item for your restaurant"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Name *</Label>
                <Input
                  className="col-span-3"
                  placeholder="Product name"
                  value={editingProduct?.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Category *</Label>
                <Select
                  value={editingProduct?.category || ""}
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pizza">Pizza</SelectItem>
                    <SelectItem value="Pasta">Pasta</SelectItem>
                    <SelectItem value="Appetizer">Appetizer</SelectItem>
                    <SelectItem value="Dessert">Dessert</SelectItem>
                    <SelectItem value="Risotto">Risotto</SelectItem>
                    <SelectItem value="Beverage">Beverage</SelectItem>
                    <SelectItem value="Salad">Salad</SelectItem>
                    <SelectItem value="Main Course">Main Course</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Price ($) *</Label>
                <Input
                  className="col-span-3"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editingProduct?.price || ""}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Image URL</Label>
                <div className="col-span-3 space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={editingProduct?.image || ""}
                    onChange={(e) => {
                      handleInputChange("image", e.target.value);
                      setImagePreview(e.target.value);
                    }}
                  />
                  
                  {imagePreview && (
                    <div className="relative h-32 w-32 rounded overflow-hidden border">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onError={() => setImagePreview("/placeholder.svg")}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right">Description</Label>
                <Textarea
                  className="col-span-3"
                  placeholder="Product description"
                  value={editingProduct?.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Available</Label>
                <div className="col-span-3">
                  <Switch
                    checked={editingProduct?.available ?? true}
                    onCheckedChange={(checked) => handleInputChange("available", checked)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-orange-600 hover:bg-orange-700" 
                onClick={handleSaveProduct}
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProduct?._id ? "Save Changes" : "Add Product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Menu Items ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          )}
          
          {!isLoading && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.available ? "Available" : "Unavailable"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the product "{product.name}"
                                  from your menu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteProduct(product._id)}
                                >
                                  Delete Product
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No products found. Try a different search term or add a new product.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
