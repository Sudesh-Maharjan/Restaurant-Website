"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { addToCart } from "@/redux/slices/cartSlice"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Plus, Minus, Star, Clock, Info, Leaf } from "lucide-react"
import { Price } from "./ui/price"
import { useRouter } from "next/navigation"

interface MenuItemProps {
  id: string
  name: string
  price: number
  description: string
  image: string
  badge?: string
  badgeColor?: string
  category: string
}

export function MenuItemCardEnhanced({
  id,
  name,
  price,
  description,
  image,
  badge,
  badgeColor = "bg-orange-600",
  category,
}: MenuItemProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const { products } = useAppSelector((state) => state.products)
  const { toast } = useToast()
  const router = useRouter()
  const [quantity, setQuantity] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Check if product is available in products state
  const product = products.find((p) => p._id === id)
  const isAvailable = product?.available ?? true

  // Simplified mock data
  const mockData = {
    rating: 4.8,
    reviewCount: 127,
    prepTime: "15-20 min",
    calories: 650,
    isVegetarian: !name.toLowerCase().includes("meat") && !name.toLowerCase().includes("chicken"),
    ingredients: ["San Marzano tomatoes", "Fresh mozzarella", "Basil leaves", "Extra virgin olive oil"],
  }

  const addToCartHandler = (qty: number = quantity) => {
    if (!isAvailable) return

    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      })
      router.push("/auth")
      return
    }

    // Add the item to cart
    for (let i = 0; i < qty; i++) {
      dispatch(addToCart({ id, name, price, description, image }))
    }

    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    })

    if (isDialogOpen) {
      setIsDialogOpen(false)
      setQuantity(1)
    }
  }

  return (
    <>
      <Card
        className={`overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg ${!isAvailable ? "opacity-60" : ""}`}
      >        <div className="relative h-48">
          <Image
            src={image && !image.includes("placeholder") 
              ? image 
              : "https://images.unsplash.com/photo-1546549032-9571cd6b27df?q=80&w=1887&auto=format&fit=crop"}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-2">
            {badge && <Badge className={`${badgeColor} shadow-lg`}>{badge}</Badge>}
            {mockData.isVegetarian && (
              <Badge className="bg-green-600 shadow-lg">
                <Leaf className="h-3 w-3 mr-1" />
                Vegetarian
              </Badge>
            )}
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Star className="h-3 w-3 text-yellow-500 fill-current" />
            <span className="text-xs font-medium">{mockData.rating}</span>
          </div>

          {/* Unavailable Overlay */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge className="bg-red-600 text-white">Unavailable</Badge>
            </div>
          )}          {/* Quick Add Button */}
          {isAvailable && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  addToCartHandler(1)
                }}
                className="bg-orange-600 hover:bg-orange-700 rounded-full h-8 w-8 p-0 shadow-lg"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg leading-tight">{name}</CardTitle>
            <span className="text-orange-600 font-bold text-lg ml-2">
              <Price value={price} />
            </span>
          </div>

          {/* Quick Info */}
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {mockData.prepTime}
            </div>
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1" />
              {mockData.reviewCount} reviews
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <CardDescription className="text-sm leading-relaxed mb-4 line-clamp-2">{description}</CardDescription>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50"
                  disabled={!isAvailable}
                >
                  <Info className="h-4 w-4 mr-1" />
                  Details
                </Button>
              </DialogTrigger>
            </Dialog>            <Button
              onClick={() => addToCartHandler(1)}
              disabled={!isAvailable}
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Simplified Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Image and Basic Info */}
            <div className="space-y-4">
              <div className="relative h-48 rounded-lg overflow-hidden">
                <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-orange-600">
                  <Price value={price} />
                </span>
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="font-medium">{mockData.rating}</span>
                  <span className="text-gray-500">({mockData.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{mockData.prepTime}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">Calories:</span>
                  <span>{mockData.calories}</span>
                </div>
              </div>

              {/* Badges */}
              {mockData.isVegetarian && (
                <Badge className="bg-green-100 text-green-800">
                  <Leaf className="h-3 w-3 mr-1" />
                  Vegetarian
                </Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>

            {/* Ingredients */}
            <div>
              <h4 className="font-semibold mb-2">Key Ingredients</h4>
              <div className="flex flex-wrap gap-2">
                {mockData.ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {ingredient}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-orange-600">
                    <Price value={price * quantity} />
                  </span>                  <Button
                    onClick={() => addToCartHandler(quantity)}
                    disabled={!isAvailable}
                    className="bg-orange-600 hover:bg-orange-700 px-6"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
