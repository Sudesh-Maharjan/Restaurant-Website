"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Clock, Phone, Mail, Star, ChefHat, Users, Award, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Header } from "./components/header"
import { MenuSection } from "./components/menu-section"
import { useAppDispatch, useAppSelector } from "./redux/hooks"
import { useEffect, useState } from "react"
import { getSettings } from "./redux/slices/settingsSlice"
import { Calendar as CalendarIcon } from "./components/ui/calendar"
import { useToast } from "./hooks/use-toast"
import api from "./services/api"
import { createReservation } from "./redux/slices/reservationSlice"

export default function RestaurantLanding() {
  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const { toast } = useToast();

  // Reservation form state
  const [reservationForm, setReservationForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    partySize: '',
    date: '',
    time: '',
    seatingPreference: '',
    occasion: '',
    specialRequests: '',
    termsAccepted: false
  });

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReservationForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setReservationForm(prev => ({ ...prev, [name]: checked }));
  };

  // Handle form submission
  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!reservationForm.firstName || !reservationForm.lastName || !reservationForm.email || 
        !reservationForm.phone || !reservationForm.partySize || !reservationForm.date || 
        !reservationForm.time || !reservationForm.termsAccepted) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and accept the terms.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format the data for the API
      const reservationData = {
        name: `${reservationForm.firstName} ${reservationForm.lastName}`,
        email: reservationForm.email,
        phone: reservationForm.phone,
        partySize: parseInt(reservationForm.partySize),
        date: reservationForm.date,
        time: reservationForm.time,
        specialRequests: `${reservationForm.seatingPreference ? 'Seating: ' + reservationForm.seatingPreference + '. ' : ''}${reservationForm.occasion ? 'Occasion: ' + reservationForm.occasion + '. ' : ''}${reservationForm.specialRequests}`
      };

      // Submit to API using Redux
      const result = await dispatch(createReservation(reservationData)).unwrap();
      
      toast({
        title: "Reservation Requested",
        description: "We've received your reservation request. You'll receive a confirmation soon!",
        variant: "default"
      });

      // Reset form
      setReservationForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        partySize: '',
        date: '',
        time: '',
        seatingPreference: '',
        occasion: '',
        specialRequests: '',
        termsAccepted: false
      });
    } catch (error) {
      console.error('Reservation error:', error);
      toast({
        title: "Reservation Failed",
        description: "There was a problem submitting your reservation. Please try again or contact us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                  className="text-black border-white hover:bg-gray-200 hover:text-black text-lg px-8 py-3"
                >
                  Make Reservation
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50 dark:bg-gray-900 px-4">
          <div className="flex justify-center">
            <div className="flex gap-10 xs:flex-col sm:flex-row items-center">        
                    <div className="">
                <h2 className="text-4xl font-bold mb-6">Our Story</h2>
                <p className="text-lg text-gray-600 mb-6 md:w-[650px]">
                  {settings?.aboutUs || "For over 30 years, we have been serving authentic Italian cuisine in the heart of the city. Our family recipes, passed down through generations, bring the true taste of Italy to your table."}
                </p>
                <p className="text-lg text-gray-600 mb-8 md:w-[650px]">
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
              <div className="relative xs:visibility: hidden md:block">
                <Image
                  src="https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?q=80&w=2070&auto=format&fit=crop"
                  alt="Chef preparing food"
                  width={600}
                  height={700}
                  className="rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Menu Section */}
        <MenuSection />

        {/* Location & Hours Section */}
        <section id="location" className="py-20 bg-orange-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Visit Us</h2>
            <div className="h-1 w-24 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px] bg-white dark:bg-gray-800 order-2 md:order-1">
              <div className="h-full w-full relative">
                <Image
                  src="https://images.unsplash.com/photo-1524282540044-f50dafd5b8f9?q=80&w=1400&auto=format&fit=crop"
                  alt="Restaurant Location"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h3 className="font-bold text-xl mb-2">Find Us</h3>
                    <p className="text-sm">
                      {settings?.address}, {settings?.city}, {settings?.state} {settings?.zipCode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Hours */}
            <div className="space-y-4 md:space-y-8 order-1 md:order-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mr-3 md:mr-4 flex-shrink-0">
                    <MapPin className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-1 md:mb-2 text-gray-900 dark:text-white">Our Location</h3>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                      {settings?.address}<br />
                      {settings?.city}, {settings?.state} {settings?.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mr-3 md:mr-4 flex-shrink-0">
                    <Clock className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-1 md:mb-2 text-gray-900 dark:text-white">Opening Hours</h3>
                    {settings?.hours ? (
                      <div className="space-y-1 text-sm md:text-base text-gray-700 dark:text-gray-300">
                        {Object.entries(settings.hours).map(([day, hours]) => (
                          <p key={day}>
                            <span className="font-medium">{day}:</span> {hours}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                        {settings?.openingHours || "Monday-Friday: 8am-10pm\nSaturday-Sunday: 9am-11pm"}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 shadow-lg">
                <div className="flex items-start">
                  <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mr-3 md:mr-4 flex-shrink-0">
                    <Phone className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg md:text-xl mb-1 md:mb-2 text-gray-900 dark:text-white">Contact</h3>
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                      Phone: {settings?.phone || "(555) 123-4567"}<br />
                      Email: {settings?.email || "info@bellavista.com"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> {/* Reservation Section */}
        <section id="reserve-table" className="py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-gray-800 rounded-full mb-6">
                  <ChefHat className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">Reserve Your Table</h2>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Secure your spot for an unforgettable Italian dining experience. Our team will confirm your
                  reservation within 2 hours.
                </p>
              </div>

              <div className="grid lg:grid-cols-5 gap-12 items-start">
                {/* Reservation Benefits */}                <div className="lg:col-span-2 space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Why Reserve With Us?</h3>

                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-green-100 dark:bg-green-900/40 rounded-full p-2 mt-1">
                          <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Priority Seating</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Skip the wait with guaranteed table availability</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-2 mt-1">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Perfect Table</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">We'll select the best table for your party size</p>
                        </div>
                      </div>                      <div className="flex items-start space-x-4">
                        <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-2 mt-1">
                          <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Special Occasions</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Let us know about birthdays, anniversaries, or celebrations
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="bg-orange-100 dark:bg-orange-900/40 rounded-full p-2 mt-1">
                          <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Flexible Timing</h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            Easy rescheduling up to 2 hours before your reservation
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>                  {/* Popular Times */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Popular Reservation Times</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Lunch (12:00 - 2:00 PM)</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Early Dinner (5:00 - 6:30 PM)</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-yellow-400 dark:bg-yellow-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Prime Dinner (7:00 - 9:00 PM)</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-400 dark:bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-red-400 dark:bg-red-500 rounded-full"></div>
                          <div className="w-2 h-2 bg-red-400 dark:bg-red-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">🟢 Available • 🟡 Limited • 🔴 High Demand</p>
                  </div>
                </div>                {/* Reservation Form */}
                <div className="lg:col-span-3">
                  <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-2xl font-bold">Book Your Table</h3>
                          <p className="text-orange-100 mt-1">Confirmation within 2 hours</p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                          <Calendar className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    <CardContent className="p-8">
                      <form className="space-y-6" onSubmit={handleReservation}>
                        {/* Guest Information */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900 text-lg">Guest Information</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">First Name *</label>
                              <Input
                                placeholder="John"
                                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                required
                                name="firstName"
                                value={reservationForm.firstName}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Last Name *</label>
                              <Input
                                placeholder="Doe"
                                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                required
                                name="lastName"
                                value={reservationForm.lastName}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Email Address *</label>
                              <Input
                                type="email"
                                placeholder="john@example.com"
                                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                required
                                name="email"
                                value={reservationForm.email}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                              <Input
                                placeholder="(555) 123-4567"
                                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                required
                                name="phone"
                                value={reservationForm.phone}
                                onChange={handleInputChange}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Reservation Details */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                          <h4 className="font-semibold text-gray-900 text-lg">Reservation Details</h4>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Party Size *</label>
                              <select
                                className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
                                name="partySize"
                                value={reservationForm.partySize}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Select guests</option>
                                <option value="1">1 Guest</option>
                                <option value="2">2 Guests</option>
                                <option value="3">3 Guests</option>
                                <option value="4">4 Guests</option>
                                <option value="5">5 Guests</option>
                                <option value="6">6 Guests</option>
                                <option value="7">7 Guests</option>
                                <option value="8">8 Guests</option>
                                <option value="9+">9+ Guests (Call Us)</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Date *</label>
                              <Input
                                type="date"
                                className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                                min={new Date().toISOString().split("T")[0]}
                                required
                                name="date"
                                value={reservationForm.date}
                                onChange={handleInputChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Preferred Time *</label>
                              <select
                                className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
                                name="time"
                                value={reservationForm.time}
                                onChange={handleInputChange}
                                required
                              >
                                <option value="">Select time</option>
                                <option value="11:30">11:30 AM</option>
                                <option value="12:00">12:00 PM</option>
                                <option value="12:30">12:30 PM</option>
                                <option value="1:00">1:00 PM</option>
                                <option value="1:30">1:30 PM</option>
                                <option value="2:00">2:00 PM</option>
                                <option value="5:00">5:00 PM</option>
                                <option value="5:30">5:30 PM</option>
                                <option value="6:00">6:00 PM</option>
                                <option value="6:30">6:30 PM</option>
                                <option value="7:00">7:00 PM</option>
                                <option value="7:30">7:30 PM</option>
                                <option value="8:00">8:00 PM</option>
                                <option value="8:30">8:30 PM</option>
                                <option value="9:00">9:00 PM</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Special Preferences */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                          <h4 className="font-semibold text-gray-900 text-lg">Special Preferences</h4>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Seating Preference</label>
                              <select
                                className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
                                name="seatingPreference"
                                value={reservationForm.seatingPreference}
                                onChange={handleInputChange}
                              >
                                <option value="">No preference</option>
                                <option value="window">Window table</option>
                                <option value="booth">Booth seating</option>
                                <option value="patio">Outdoor patio</option>
                                <option value="quiet">Quiet area</option>
                                <option value="bar">Bar seating</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-700">Occasion</label>
                              <select
                                className="w-full h-12 px-3 border border-gray-200 rounded-md focus:border-orange-500 focus:ring-orange-500 bg-white"
                                name="occasion"
                                value={reservationForm.occasion}
                                onChange={handleInputChange}
                              >
                                <option value="">Regular dining</option>
                                <option value="birthday">Birthday</option>
                                <option value="anniversary">Anniversary</option>
                                <option value="date">Date night</option>
                                <option value="business">Business dinner</option>
                                <option value="celebration">Celebration</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                              Special Requests or Dietary Requirements
                            </label>
                            <Textarea
                              placeholder="Please let us know about any allergies, dietary restrictions, accessibility needs, or special requests..."
                              rows={4}
                              className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
                              name="specialRequests"
                              value={reservationForm.specialRequests}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>

                        {/* Terms and Submit */}
                        <div className="space-y-6 pt-6 border-t border-gray-100">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id="terms"
                              name="termsAccepted"
                              className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                              required
                              checked={reservationForm.termsAccepted}
                              onChange={handleCheckboxChange}
                            />
                            <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                              I agree to the{" "}
                              <a href="#" className="text-orange-600 hover:text-orange-700 underline">
                                cancellation policy
                              </a>{" "}
                              and understand that I can modify or cancel my reservation up to 2 hours before the
                              scheduled time.
                            </label>
                          </div>

                          <Button
                            type="submit"
                            className="w-full h-14 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <>
                                <span className="animate-spin mr-2">⏳</span>
                                Requesting...
                              </>
                            ) : (
                              <>
                                <Calendar className="h-5 w-5 mr-2" />
                                Request Reservation
                              </>
                            )}
                          </Button>

                          <div className="text-center space-y-2">
                            <p className="text-sm text-gray-600">
                              🕐 <strong>Quick Response:</strong> We'll confirm within 2 hours
                            </p>
                            <p className="text-xs text-gray-500">
                              For immediate assistance or large parties (9+), please call us at (555) 123-4567
                            </p>
                          </div>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>
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
                {/* <li>{settings?.city }, {settings?.state || "NY"} {settings?.zipCode || "10001"}</li> */}
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
