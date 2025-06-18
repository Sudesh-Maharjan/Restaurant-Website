"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAppDispatch, useAppSelector, selectAuth } from "@/redux/hooks"
import { login, register } from "@/redux/slices/authSlice"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export default function AuthPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [userType, setUserType] = useState<"user" | "admin">("user")
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const dispatch = useAppDispatch()
  const { isLoading, isAuthenticated, error } = useAppSelector(selectAuth)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // If user is already authenticated, redirect them
    if (isAuthenticated) {
      router.push(userType === "admin" ? "/admin" : "/")
    }
  }, [isAuthenticated, router, userType])

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isLogin) {
      const result = await dispatch(login({ 
        email: formData.email, 
        password: formData.password 
      }))
      
      if (login.fulfilled.match(result)) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        })
        router.push(userType === "admin" ? "/admin" : "/")
      } else {
        toast({
          title: "Login failed",
          description: result.payload as string || "Please check your credentials and try again",
          variant: "destructive"
        })
      }
    } else {
      const result = await dispatch(register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: userType
      }))
      
      if (register.fulfilled.match(result)) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully!",
        })
        router.push(userType === "admin" ? "/admin" : "/")
      } else {
        toast({
          title: "Registration failed",
          description: result.payload as string || "Please check your information and try again",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header for auth page */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Website</span>
            </Link>
            <Link href="/" className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <span className="text-2xl font-bold text-orange-600">Bella Vista</span>
            </Link>
            <div></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <ChefHat className="h-12 w-12 text-orange-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? "Sign in to your account" : "Create a new account"}
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <CardHeader>
              <Tabs
                defaultValue="user"
                className="w-full"
                onValueChange={(value) => setUserType(value as "user" | "admin")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="user">Customer</TabsTrigger>
                  <TabsTrigger value="admin">Restaurant Admin</TabsTrigger>
                </TabsList>
              </Tabs>
              <CardDescription className="text-center">
                {userType === "user"
                  ? "Access your order history and saved addresses"
                  : "Manage your restaurant's menu, orders, and settings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" onValueChange={(value) => setIsLogin(value === "login")}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input 
                        type="email" 
                        name="email"
                        placeholder="your@email.com" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          name="password"
                          placeholder="••••••••" 
                          required 
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <input
                          id="remember-me"
                          name="remember-me"
                          type="checkbox"
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                          Remember me
                        </label>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <Input 
                        type="text" 
                        name="name"
                        placeholder="John Smith" 
                        required 
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input 
                        type="email" 
                        name="email"
                        placeholder="your@email.com" 
                        required 
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          name="password" 
                          placeholder="••••••••" 
                          required 
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
