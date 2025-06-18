"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Download,
  FileText,
  ImageIcon,
  Search,
  Filter,
  Grid3X3,
  List,
  Clock,
  Utensils,
  ChefHat,
  Leaf,
  MapPin,
  Phone,
} from "lucide-react"
import Link from "next/link"
import { Header } from "../../components/header"
import { MenuItemCardEnhanced } from "../../components/menu-item-card-enhanced"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getProducts } from "@/redux/slices/productsSlice"

export default function MenuPage() {
  const dispatch = useAppDispatch();
  const { products, isLoading } = useAppSelector((state) => state.products);
  const { menuFile } = useAppSelector((state) => state.menu);
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "price" | "popular">("name")
  const [filterBy, setFilterBy] = useState<"all" | "vegetarian">("all")

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  // Get all categories
  const categories = useMemo(() => {
    const cats = ["All", ...new Set(products.map((product) => product.category))]
    return cats.sort()
  }, [products])

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "All" || product.category === selectedCategory

      // Simplified filter logic
      let matchesFilter = true
      if (filterBy === "vegetarian") {
        matchesFilter = !product.name.toLowerCase().includes("meat") && !product.name.toLowerCase().includes("chicken")
      }

      return matchesSearch && matchesCategory && matchesFilter
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return a.price - b.price
        case "popular":
          return b.name.length - a.name.length // Mock popularity
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [products, searchTerm, selectedCategory, sortBy, filterBy])
  // Group products by category for display
  const productsByCategory = useMemo(() => {
    if (selectedCategory !== "All") {
      return { [selectedCategory]: filteredProducts }
    }

    return filteredProducts.reduce(
      (acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = []
        }
        acc[product.category].push(product)
        return acc
      },
      {} as Record<string, typeof filteredProducts>,
    )
  }, [filteredProducts, selectedCategory])

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      Pizza: "🍕",
      Pasta: "🍝",
      Appetizer: "🥗",
      Dessert: "🍰",
      Risotto: "🍚",
      Beverage: "🥤",
      Salad: "🥬",
      "Main Course": "🍖",
    }
    return icons[category] || "🍽️"
  }

  const getCategoryStats = (category: string) => {
    const categoryProducts = products.filter((p: any) => p.category === category)
    const available = categoryProducts.filter((p: any) => p.available).length
    const avgPrice = categoryProducts.reduce((sum: number, p: any) => sum + p.price, 0) / categoryProducts.length || 0
    return { total: categoryProducts.length, available, avgPrice }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-to-r from-orange-600 to-orange-700 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto">
             

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                  <ChefHat className="h-8 w-8" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold mb-6">Our Menu</h1>
                <p className="text-xl md:text-2xl text-orange-100 max-w-2xl mx-auto mb-8">
                  Discover our authentic Italian dishes, crafted with passion and the finest ingredients
                </p>

                {/* Quick Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="outline" className="text-orange-600 border-white hover:bg-white hover:text-orange-600">
                    <Phone className="h-4 w-4 mr-2" />
                    Call for Reservations
                  </Button>
                  <Button variant="outline" className="text-orange-600 border-white hover:bg-white hover:text-orange-600">
                    <Clock className="h-4 w-4 mr-2" />
                    Order for Pickup
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>        <div className="container mx-auto px-4 py-8">
          {/* Menu File Display */}
          {menuFile?.url && (
            <div className="max-w-4xl mx-auto mb-12">
              <Card className="border-0 shadow-2xl">
                <CardHeader className="text-center bg-gradient-to-r from-gray-50 to-gray-100">
                  <CardTitle className="flex items-center justify-center space-x-2">
                    {menuFile.type === "pdf" ? (
                      <FileText className="h-6 w-6 text-red-600" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-blue-600" />
                    )}
                    <span>Official Restaurant Menu</span>
                  </CardTitle>
                  <p className="text-gray-600">
                    Uploaded on {menuFile.uploadedAt ? new Date(menuFile.uploadedAt).toLocaleDateString() : 'Unknown date'}
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {menuFile.type === "pdf" ? (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8 text-center">
                        <FileText className="h-16 w-16 text-red-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{menuFile.name}</h3>
                        <p className="text-gray-600 mb-6">
                          View our complete menu with detailed descriptions and pricing
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button asChild className="bg-red-600 hover:bg-red-700">
                            <a href={menuFile.url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 mr-2" />
                              View PDF Menu
                            </a>
                          </Button>
                          <Button variant="outline" asChild>
                            <a href={menuFile.url} download={menuFile.name}>
                              <Download className="h-4 w-4 mr-2" />
                              Download Menu
                            </a>
                          </Button>
                        </div>
                      </div>
                      <div className="w-full h-[800px] border rounded-xl overflow-hidden shadow-inner">
                        <iframe src={menuFile.url} className="w-full h-full" title="Restaurant Menu PDF" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 mb-6">
                        <img
                          src={menuFile.url || "/placeholder.svg"}
                          alt="Restaurant Menu"
                          className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                          style={{ maxHeight: "1000px" }}
                        />
                      </div>
                      <Button variant="outline" asChild>
                        <a href={menuFile.url} download={menuFile.name}>
                          <Download className="h-4 w-4 mr-2" />
                          Download Menu
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex items-center my-12">
                <div className="flex-1 border-t border-gray-300"></div>
                <div className="px-6 text-gray-500 font-medium">OR BROWSE BY CATEGORY</div>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="max-w-7xl mx-auto mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Search dishes, ingredients, or descriptions..."
                      className="pl-10 h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Category:</span>
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-12 px-4 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white min-w-[150px]"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category === "All" ? "All Categories" : category}
                        </option>
                      ))}
                    </select>

                    <select
                      value={filterBy}
                      onChange={(e) => setFilterBy(e.target.value as any)}
                      className="h-12 px-4 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white min-w-[140px]"
                    >
                      <option value="all">All Items</option>
                      <option value="vegetarian">Vegetarian Only</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="h-12 px-4 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white min-w-[120px]"
                    >
                      <option value="name">Sort by Name</option>
                      <option value="price">Sort by Price</option>
                      <option value="popular">Sort by Popular</option>
                    </select>

                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className={viewMode === "grid" ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className={viewMode === "list" ? "bg-orange-600 hover:bg-orange-700" : ""}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(searchTerm || selectedCategory !== "All" || filterBy !== "all") && (
                  <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchTerm && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Search: "{searchTerm}"
                        <button onClick={() => setSearchTerm("")} className="ml-2 hover:text-orange-900">
                          ×
                        </button>
                      </Badge>
                    )}
                    {selectedCategory !== "All" && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Category: {selectedCategory}
                        <button onClick={() => setSelectedCategory("All")} className="ml-2 hover:text-blue-900">
                          ×
                        </button>
                      </Badge>
                    )}
                    {filterBy !== "all" && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Vegetarian Only
                        <button onClick={() => setFilterBy("all")} className="ml-2 hover:text-green-900">
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Category Overview */}
          {selectedCategory === "All" && !searchTerm && filterBy === "all" && (
            <div className="max-w-7xl mx-auto mb-12">
              <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">Browse by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {categories.slice(1).map((category) => {
                  const stats = getCategoryStats(category)
                  return (
                    <Card
                      key={category}
                      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedCategory(category)}
                    >
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-3">{getCategoryIcon(category)}</div>
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {category}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <p>
                            {stats.available} of {stats.total} available
                          </p>
                          <p className="font-medium text-orange-600">Avg ${stats.avgPrice.toFixed(2)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Menu Items Display */}
          {Object.keys(productsByCategory).length > 0 ? (
            <div className="max-w-7xl mx-auto">                  {Object.entries(productsByCategory).map(([category, products]) => (
                <div key={category} className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="text-4xl">{getCategoryIcon(category)}</div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900">{category}</h3>
                        <p className="text-gray-600">
                          {products.length} item{products.length !== 1 ? "s" : ""} •
                          {products.filter((p: any) => p.available).length} available
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {category === "Salad" && (
                        <Badge className="bg-green-100 text-green-800">
                          <Leaf className="h-3 w-3 mr-1" />
                          Fresh
                        </Badge>
                      )}
                      {category === "Pasta" && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Utensils className="h-3 w-3 mr-1" />
                          Handmade
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <MenuItemCardEnhanced
                        key={product._id}
                        id={product._id}
                        name={product.name}
                        price={product.price}
                        description={product.description}
                        image={product.image}
                        category={product.category}
                        badge={!product.available ? "Unavailable" : undefined}
                        badgeColor={!product.available ? "bg-red-600" : "bg-green-600"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center py-16">
              <div className="text-gray-400 text-6xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">No dishes found</h3>
              <p className="text-gray-600 mb-8">
                {searchTerm
                  ? `No results for "${searchTerm}" in ${selectedCategory === "All" ? "any category" : selectedCategory}`
                  : `No items available in ${selectedCategory}`}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("All")
                    setFilterBy("all")
                  }}
                >
                  Clear All Filters
                </Button>
                <Link href="/contact">
                  <Button className="bg-orange-600 hover:bg-orange-700">Contact Us</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
