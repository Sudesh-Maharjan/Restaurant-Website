"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  FileText,
  ImageIcon,
  Trash2,
  Eye,
  ExternalLink,
  Save,
  Loader2
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getSettings, updateSettings, uploadLogo } from "@/redux/slices/settingsSlice"
import { useToast } from "@/hooks/use-toast"

export default function AdminSettings() {
  const dispatch = useAppDispatch()
  const { settings, isLoading, error } = useAppSelector((state) => state.settings)
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("restaurant")
  const [restaurantInfo, setRestaurantInfo] = useState({
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    openingHours: "",
    aboutUs: "",
    currency: "USD",
  })

  const [socialMedia, setSocialMedia] = useState({
    facebook: "",
    instagram: "",
    twitter: "",
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(getSettings())
  }, [dispatch])

  useEffect(() => {
    if (settings) {
      setRestaurantInfo({
        restaurantName: settings.restaurantName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        openingHours: settings.openingHours,
        aboutUs: settings.aboutUs || "",
        currency: settings.currency || "USD",
      })

      setSocialMedia({
        facebook: settings.socialMedia.facebook || "",
        instagram: settings.socialMedia.instagram || "",
        twitter: settings.socialMedia.twitter || "",
      })

      setLogoPreview(settings.logo)
    }
  }, [settings])

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  const handleRestaurantInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setRestaurantInfo(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSocialMedia(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveSettings = () => {
    const updatedSettings = {
      ...restaurantInfo,
      socialMedia
    }

    dispatch(updateSettings(updatedSettings))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Settings updated successfully",
        })
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err || "Failed to update settings",
          variant: "destructive",
        })
      })
  }

  const handleUploadLogo = () => {
    if (!logoFile) {
      toast({
        title: "Error",
        description: "Please select a logo image first",
        variant: "destructive",
      })
      return
    }

    const formData = new FormData()
    formData.append('logo', logoFile)

    dispatch(uploadLogo(formData))
      .unwrap()
      .then(() => {
        toast({
          title: "Success",
          description: "Logo uploaded successfully",
        })
        setLogoFile(null)
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: err || "Failed to upload logo",
          variant: "destructive",
        })
      })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant Information</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
          </div>
        ) : (
          <>
            <TabsContent value="restaurant" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Logo</CardTitle>
                  <CardDescription>Upload your restaurant logo for branding</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-6">
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                      {logoPreview ? (
                        <Image
                          src={logoPreview.startsWith('data:') ? logoPreview : `http://localhost:5000${logoPreview}`}
                          alt="Restaurant Logo"
                          fill
                          className="object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <input
                          type="file"
                          id="logo"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="mr-2"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Logo
                        </Button>
                        <Button
                          onClick={handleUploadLogo}
                          disabled={!logoFile || isLoading}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                          Upload
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500">
                        Recommended: Square image, at least 200x200 pixels. PNG, JPG, or SVG format.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restaurant Information</CardTitle>
                  <CardDescription>Update your restaurant details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="restaurantName">Restaurant Name</Label>
                      <Input
                        id="restaurantName"
                        name="restaurantName"
                        value={restaurantInfo.restaurantName}
                        onChange={handleRestaurantInfoChange}
                        placeholder="Restaurant Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={restaurantInfo.email}
                        onChange={handleRestaurantInfoChange}
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={restaurantInfo.phone}
                        onChange={handleRestaurantInfoChange}
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="openingHours">Opening Hours</Label>
                      <Input
                        id="openingHours"
                        name="openingHours"
                        value={restaurantInfo.openingHours}
                        onChange={handleRestaurantInfoChange}
                        placeholder="Mon-Fri: 9am-10pm, Sat-Sun: 10am-11pm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select
                        value={restaurantInfo.currency}
                        onValueChange={(value) => 
                          setRestaurantInfo(prev => ({ ...prev, currency: value }))
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">US Dollar ($)</SelectItem>
                          <SelectItem value="GBP">British Pound (£)</SelectItem>
                          <SelectItem value="NPR">Nepalese Rupee (₨)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={restaurantInfo.address}
                      onChange={handleRestaurantInfoChange}
                      placeholder="123 Main St, City, State, ZIP"
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aboutUs">About Us</Label>
                    <Textarea
                      id="aboutUs"
                      name="aboutUs"
                      value={restaurantInfo.aboutUs}
                      onChange={handleRestaurantInfoChange}
                      placeholder="Tell customers about your restaurant..."
                      className="min-h-[150px]"
                    />
                  </div>

                  <Button
                    className="bg-orange-600 hover:bg-orange-700 mt-4"
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media</CardTitle>
                  <CardDescription>Connect your restaurant's social media accounts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      name="facebook"
                      value={socialMedia.facebook}
                      onChange={handleSocialMediaChange}
                      placeholder="https://facebook.com/your-restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={socialMedia.instagram}
                      onChange={handleSocialMediaChange}
                      placeholder="https://instagram.com/your-restaurant"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      name="twitter"
                      value={socialMedia.twitter}
                      onChange={handleSocialMediaChange}
                      placeholder="https://twitter.com/your-restaurant"
                    />
                  </div>

                  <Button
                    className="bg-orange-600 hover:bg-orange-700 mt-4"
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
