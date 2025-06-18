"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Price } from "@/components/ui/price"
import Image from "next/image"
import { Plus } from "lucide-react"
import { useAppDispatch, useAppSelector, selectAuth, selectProducts } from "@/redux/hooks"
import { addToCart } from "@/redux/slices/cartSlice"
import { useToast } from "./ui/use-toast"
import { useRouter } from "next/navigation"
import { Product } from "@/redux/slices/productSlice"

interface MenuItemProps {
  id: string
  name: string
  price: number
  description: string
  image: string
  badge?: string
  badgeColor?: string
}

export function MenuItemCard({
  id,
  name,
  price,
  description,
  image,
  badge,
  badgeColor = "bg-orange-600",
}: MenuItemProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector(selectAuth)
  const { products } = useAppSelector(selectProducts)
  const { toast } = useToast()
  const router = useRouter()

  // Check if product is available in products state
  const product = products.find((p: Product) => p._id === id)
  const isAvailable = product?.available ?? true

  const addToCartHandler = () => {
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

    dispatch(addToCart({ id, name, price, description, image }))

    toast({
      title: "Added to cart",
      description: `${name} has been added to your cart`,
    })
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow group ${!isAvailable ? "opacity-60" : ""}`}>
      <div className="relative h-48">
        <Image
          src={image || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {badge && <Badge className={`absolute top-4 left-4 ${badgeColor}`}>{badge}</Badge>}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge className="bg-red-600">Unavailable</Badge>
          </div>
        )}
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-start">
          <span className="text-lg">{name}</span>
          <Price value={price} className="text-orange-600 font-bold text-lg" />
        </CardTitle>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Button
          onClick={addToCartHandler}
          disabled={!isAvailable}
          className="w-full bg-orange-600 hover:bg-orange-700 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
          {isAvailable ? "Add to Cart" : "Unavailable"}
        </Button>
      </CardContent>
    </Card>
  )
}
