"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Phone, Mail, Send, MessageCircle, Star, Users, Award, Loader2 } from "lucide-react"
import { Header } from "../../components/header"
import { useAppDispatch, useAppSelector } from "@/redux/hooks"
import { getSettings } from "@/redux/slices/settingsSlice"
import { submitContactForm, clearContactState } from "@/redux/slices/contactSlice"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function ContactPage() {  const dispatch = useAppDispatch();
  const { settings } = useAppSelector((state) => state.settings);
  const { isLoading, success, error, message } = useAppSelector((state) => state.contact);
  const { toast } = useToast();

  // Check if restaurant is open (simple implementation)
  const isOpen = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const hours = now.getHours();
    
    // Simplified check - can be expanded based on actual hours format
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    if (isWeekend) {
      // Weekend hours (typical restaurant hours 11am-11pm)
      return hours >= 11 && hours < 23;
    } else {
      // Weekday hours (typical restaurant hours 11:30am-10pm)
      return hours >= 11 && hours < 22;
    }
  }

  // Contact form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    dispatch(submitContactForm(formData));
  };

  // Load settings when component mounts
  useEffect(() => {
    dispatch(getSettings());
  }, [dispatch]);
  // Handle success or error messages
  useEffect(() => {
    if (success) {
      toast({
        title: "Message Sent",
        description: message || `Your message has been sent to ${settings?.restaurantName || "us"} successfully!`,
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
      
      // Clear contact state
      setTimeout(() => {
        dispatch(clearContactState());
      }, 1000);
    }
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      
      // Clear contact state
      setTimeout(() => {
        dispatch(clearContactState());
      }, 1000);
    }
  }, [success, error, message, toast, dispatch]);
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-800 dark:to-orange-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">              <Badge className="mb-4 bg-white/20 text-white border-white/30">Get In Touch</Badge>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Contact {settings?.restaurantName || "Us"}</h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-100 max-w-2xl mx-auto">
                We'd love to hear from you. Send us a message and we'll respond as soon as possible.
              </p>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Star className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">4.9/5</div>
                  <div className="text-orange-100">Customer Rating</div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-orange-100">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                    <Award className="h-8 w-8" />
                  </div>
                  <div className="text-2xl font-bold">30+</div>
                  <div className="text-orange-100">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12 max-w-7xl mx-auto">
              {/* Contact Information Cards */}
              <div className="lg:col-span-1 space-y-6">                <div>
                  <h2 className="text-3xl font-bold mb-6 text-gray-900">Get In Touch</h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Have questions about {settings?.restaurantName ? `${settings.restaurantName}'s` : "our"} menu, want to make a reservation, or need catering services? We're here to
                    help make your dining experience exceptional.
                  </p>
                </div>

                {/* Contact Cards */}
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-orange-100 rounded-full p-3">
                        <MapPin className="h-6 w-6 text-orange-600" />
                      </div>
                      <div className="flex-1">                        <h3 className="font-semibold text-lg mb-2 text-gray-900">Visit Our Restaurant</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {settings?.address || "123 Italian Street"}
                          <br />
                          {settings?.city || "Downtown District"}
                          <br />
                          {settings?.state || "New York"}, {settings?.zipCode || "10001"}
                        </p>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent(
                          `${settings?.address}, ${settings?.city}, ${settings?.state} ${settings?.zipCode}`
                        )}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="link" className="p-0 h-auto text-orange-600 hover:text-orange-700 mt-2">
                            Get Directions →
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-blue-100 rounded-full p-3">
                        <Phone className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">                        <h3 className="font-semibold text-lg mb-2 text-gray-900">Call Us</h3>
                        <p className="text-gray-600 mb-2">{settings?.phone || "(555) 123-4567"}</p>
                        <p className="text-sm text-gray-500">
                          Available during business hours for reservations and inquiries
                        </p>
                        <a href={`tel:${settings?.phone?.replace(/[^0-9]/g, '') || "5551234567"}`}>
                          <Button variant="link" className="p-0 h-auto text-blue-600 hover:text-blue-700 mt-2">
                            Call Now →
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 rounded-full p-3">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">                        <h3 className="font-semibold text-lg mb-2 text-gray-900">Email Us</h3>
                        <p className="text-gray-600 mb-2">{settings?.email || "info@bellavista.com"}</p>
                        <p className="text-sm text-gray-500">We'll respond within 24 hours</p>
                        <a href={`mailto:${settings?.email || "info@bellavista.com"}`}>
                          <Button variant="link" className="p-0 h-auto text-green-600 hover:text-green-700 mt-2">
                            Send Email →
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-purple-100 rounded-full p-3">
                        <Clock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">                        <h3 className="font-semibold text-lg mb-2 text-gray-900">Business Hours</h3>
                        <div className="space-y-1 text-gray-600">
                          {settings?.hours ? (
                            <>
                              <div className="flex justify-between">
                                <span>Mon - Fri</span>
                                <span className="font-medium">{settings.hours.monFri}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sat - Sun</span>
                                <span className="font-medium">{settings.hours.satSun}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex justify-between">
                                <span>Mon - Thu</span>
                                <span className="font-medium">11:30 AM - 10:00 PM</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Fri - Sat</span>
                                <span className="font-medium">11:30 AM - 11:00 PM</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Sunday</span>
                                <span className="font-medium">12:00 PM - 9:00 PM</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <div className="lg:col-span-2">
                <Card className="border-0 shadow-2xl bg-white">
                  <CardHeader className="text-center pb-8">
                    <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="h-8 w-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-gray-900">Send us a Message</CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                      Fill out the form below and we'll get back to you as soon as possible
                    </CardDescription>
                  </CardHeader>                  <CardContent className="p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">First Name *</label>
                          <Input
                            placeholder="John"
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            required
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Last Name *</label>
                          <Input
                            placeholder="Doe"
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            required
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Contact Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                          <Input
                            type="email"
                            placeholder="john@example.com"
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                          <Input
                            placeholder="(555) 123-4567"
                            className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Subject *</label>
                        <Input
                          placeholder="How can we help you?"
                          className="h-12 border-gray-200 focus:border-orange-500 focus:ring-orange-500"
                          required
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Message *</label>
                        <Textarea
                          placeholder="Tell us more about your inquiry, reservation request, or feedback..."
                          rows={6}
                          className="border-gray-200 focus:border-orange-500 focus:ring-orange-500 resize-none"
                          required
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          disabled={isLoading}
                        />
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Send className="h-5 w-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Privacy Note */}
                      <p className="text-sm text-gray-500 text-center">
                        By submitting this form, you agree to our privacy policy. We'll never share your information.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Find Us</h2>
                <p className="text-xl text-gray-600">
                  Located in {settings?.city ? `the heart of ${settings.city}` : "the heart of downtown"}, {settings?.restaurantName || "we're"} easy to find and even easier to love
                </p>
              </div>

              <Card className="border-0 shadow-2xl overflow-hidden">
                <div className="grid lg:grid-cols-3">
                  {/* Map Placeholder */}
                  <div className="lg:col-span-2 h-96 lg:h-auto bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-600 font-medium">Interactive Map</p>
                      <p className="text-gray-500 text-sm">Google Maps Integration</p>
                    </div>                    {/* Overlay with restaurant info */}
                    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                        <span className="font-semibold text-gray-900">{settings?.restaurantName || "Bella Vista"}</span>                      </div>
                      <p className="text-sm text-gray-600">{settings?.address || "123 Italian Street"}</p>
                      <p className="text-sm text-gray-600">{settings?.city || "Downtown District"}</p>
                      <Badge className="mt-2 bg-green-100 text-green-800">{isOpen() ? "Open Now" : "Closed"}</Badge>
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="p-8 bg-white">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900">Location Details</h3>

                    <div className="space-y-6">                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Address</h4>
                        <p className="text-gray-600">
                          {settings?.address || "123 Italian Street"}
                          <br />
                          {settings?.city || "Downtown District"}
                          <br />
                          {settings?.state || "New York"}, {settings?.zipCode || "10001"}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Parking</h4>
                        <p className="text-gray-600">
                          Street parking available
                          <br />
                          Valet service on weekends
                          <br />
                          Public garage 2 blocks away
                        </p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Public Transport</h4>
                        <p className="text-gray-600">
                          Metro Station: 5 min walk
                          <br />
                          Bus Stop: 2 min walk
                          <br />
                          Taxi/Uber friendly location
                        </p>
                      </div>                      <Button className="w-full bg-orange-600 hover:bg-orange-700">
                        <MapPin className="h-4 w-4 mr-2" />
                        <a 
                          href={`https://maps.google.com/?q=${encodeURIComponent(
                            `${settings?.address}, ${settings?.city}, ${settings?.state} ${settings?.zipCode}`
                          )}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-white"
                        >
                          Get Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-600">Quick answers to common questions about dining at {settings?.restaurantName || "our restaurant"}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Do you take reservations?</h3>
                    <p className="text-gray-600">
                      Yes! We highly recommend making reservations, especially for dinner and weekends. You can call us
                      or use our online reservation system.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">Do you offer catering?</h3>
                    <p className="text-gray-600">
                      We provide catering services for events of all sizes. Contact us for a custom quote and menu
                      planning.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">What's your dress code?</h3>
                    <p className="text-gray-600">
                      We welcome smart casual attire. While we don't have a strict dress code, we appreciate when guests
                      dress nicely for the dining experience.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-900">
                      Do you accommodate dietary restrictions?
                    </h3>
                    <p className="text-gray-600">
                      Yes! We're happy to accommodate vegetarian, vegan, gluten-free, and other dietary needs. Please
                      inform us when making your reservation.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
