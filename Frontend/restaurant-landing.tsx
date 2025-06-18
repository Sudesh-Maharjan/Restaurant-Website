"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Phone, Mail, Star, ChefHat, Users, Award } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "./components/header"
import { MenuSection } from "./components/menu-section"
import { useAppDispatch, useAppSelector } from "./redux/hooks"
import { useEffect } from "react"
import { getSettings } from "./redux/slices/settingsSlice"

export default function RestaurantLanding() {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">        {/* Hero Section */}
        <section id="home" className="relative h-[90vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
            alt="Restaurant interior"
            fill
            className="object-cover"
            priority
          />
          <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              {settings?.restaurantName || "Authentic Italian"}
              <span className="block text-orange-400">Dining Experience</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Savor the finest Italian cuisine crafted with passion, tradition, and the freshest ingredients
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700 text-lg px-8 py-3">
                  View Menu
                </Button>
              </Link>
              <Link href="#contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-white border-white hover:bg-white hover:text-black text-lg px-8 py-3"
                >
                  Make Reservation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">              <div>
                <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                <p className="text-lg text-gray-600 mb-6">
                  {settings?.aboutUs || "For over 30 years, we have been serving authentic Italian cuisine in the heart of the city. Our family recipes, passed down through generations, bring the true taste of Italy to your table."}
                </p>
                <p className="text-lg text-gray-600 mb-8">
                  From our wood-fired pizzas to our handmade pasta, every dish is prepared with love, using only the
                  finest imported ingredients and locally sourced produce.
                </p>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center">
                    <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-2xl">30+</div>
                    <div className="text-sm text-gray-600">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-2xl">50K+</div>
                    <div className="text-sm text-gray-600">Happy Customers</div>
                  </div>
                  <div className="text-center">
                    <Star className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="font-bold text-2xl">4.9</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <Image
                  src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=2070&auto=format&fit=crop"
                  alt="Chef preparing food"
                  width={500}
                  height={600}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Menu Section */}
        <MenuSection />

        {/* Location & Hours Section */}
        <section id="location" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-4xl font-bold mb-8">Visit Us</h2>

                <div className="space-y-6">                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Address</h3>
                      <p className="text-gray-600">
                        {settings?.address}
                        <br />
                        {settings?.city}, {settings?.state} {settings?.zipCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Hours</h3>
                      <div className="text-gray-600 space-y-1">
                        {settings?.hours ? (
                          <>
                            <p>Monday - Friday: {settings.hours.monFri}</p>
                            <p>Saturday - Sunday: {settings.hours.satSun}</p>
                          </>
                        ) : (
                          <p>{settings?.openingHours}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Phone</h3>
                      <p className="text-gray-600">{settings?.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Email</h3>
                      <p className="text-gray-600">{settings?.email}</p>
                    </div>
                  </div>
                </div>
              </div>              <div className="bg-gray-300 rounded-lg h-96 flex items-center justify-center overflow-hidden">
                <Image 
                  src="https://maps.googleapis.com/maps/api/staticmap?center=New+York,NY&zoom=13&size=600x400&maptype=roadmap&markers=color:red%7Clabel:R%7CNew+York,NY&key=YOUR_API_KEY"
                  alt="Restaurant location map"
                  width={800}
                  height={400}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Reservation Section */}
        <section id="contact" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-4xl font-bold mb-4">Make a Reservation</h2>
              <p className="text-xl text-gray-600 mb-12">Reserve your table for an unforgettable dining experience</p>

              <Card>
                <CardHeader>
                  <CardTitle>Book Your Table</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll confirm your reservation within 24 hours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Name</label>
                        <Input placeholder="Your full name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <Input type="email" placeholder="your@email.com" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <Input placeholder="(555) 123-4567" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Party Size</label>
                        <Input type="number" placeholder="2" min="1" max="12" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Date</label>
                        <Input type="date" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Time</label>
                        <Input type="time" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Special Requests</label>
                      <Textarea placeholder="Any special dietary requirements or requests..." />
                    </div>

                    <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
                      Request Reservation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                {settings?.logo ? (
                  <Image 
                    src={settings.logo} 
                    alt={settings?.restaurantName || "Restaurant Logo"} 
                    width={32} 
                    height={32} 
                    className="h-8 w-8 object-contain"
                  />
                ) : (
                  <ChefHat className="h-8 w-8 text-orange-600" />
                )}
                <span className="text-2xl font-bold text-orange-600">
                  {settings?.restaurantName || "Bella Vista"}
                </span>
              </div>
              <p className="text-gray-400">
                {settings?.aboutUs || "Authentic Italian dining experience in the heart of the city for over 30 years."}
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#home" className="hover:text-orange-600 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#about" className="hover:text-orange-600 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#menu" className="hover:text-orange-600 transition-colors">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link href="#location" className="hover:text-orange-600 transition-colors">
                    Location
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Contact Info</h3>
              <ul className="space-y-2 text-gray-400">
                <li>{settings?.address || "123 Italian Street"}</li>
                <li>{settings?.city || "New York"}, {settings?.state || "NY"} {settings?.zipCode || "10001"}</li>
                <li>{settings?.phone || "(555) 123-4567"}</li>
                <li>{settings?.email || "info@bellavista.com"}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Hours</h3>
              <ul className="space-y-2 text-gray-400">
                {settings?.hours ? (
                  <>
                    <li>Mon-Fri: {settings.hours.monFri}</li>
                    <li>Sat-Sun: {settings.hours.satSun}</li>
                  </>
                ) : (
                  <>
                    <li>Mon-Thu: 11:30 AM - 10:00 PM</li>
                    <li>Fri-Sat: 11:30 AM - 11:00 PM</li>
                    <li>Sunday: 12:00 PM - 9:00 PM</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} {settings?.restaurantName || "Bella Vista"} Restaurant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
