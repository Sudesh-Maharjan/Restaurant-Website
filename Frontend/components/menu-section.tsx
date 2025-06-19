"use client"

import { Button } from "@/components/ui/button"
import { MenuItemCard } from "./menu-item-card"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "../redux/hooks"
import { useEffect } from "react"
import { getProducts } from "../redux/slices/productsSlice"

export function MenuSection() {
  const dispatch = useAppDispatch();
  const { featured, isLoading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  return (
    <section id="menu" className="py-20">
      <div className="container mx-auto md:px-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Featured Dishes</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our most popular dishes, each crafted with authentic Italian recipes and premium ingredients
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Loading menu items...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {featured.map((product) => (
              <MenuItemCard
                key={product._id}
                id={product._id}
                name={product.name}
                price={product.price}
                description={product.description}
                image={product.image}
                badge={product.category === "Pizza" ? "Popular" : undefined}
                badgeColor={product.category === "Pizza" ? "bg-orange-600" : "bg-green-600"}
              />
            ))}
          </div>
        )}

        {!isLoading && featured.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No menu items available at the moment.</p>
            <p className="text-gray-400">Please check back later.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/menu">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
              View Full Menu
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
