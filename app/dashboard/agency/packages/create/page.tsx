"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import ProtectedRoute from "@/components/protected-route"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { createPackage, getUserData } from "@/lib/firebase/firestore"
import { ArrowLeft, Plus, Minus, Save, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const packageTypes = [
	{ value: "umrah", label: "Umrah" },
	{ value: "hajj", label: "Hajj" },
	{ value: "group-umrah", label: "Group Umrah" },
]

const availableServices = [
	{ id: "ticketing", label: "Ticketing", description: "Flight booking and ticketing services" },
	{ id: "visa", label: "Visa", description: "Visa processing and documentation" },
	{ id: "local-transportation", label: "Local Transportation", description: "Transportation within Saudi Arabia" },
	{ id: "accommodation", label: "Accommodation", description: "Hotel bookings in Makkah and Madinah" },
	{ id: "meals", label: "Meals", description: "Daily meals and refreshments" },
	{ id: "ziyaaraat", label: "Ziyaaraat", description: "Visits to historical Islamic sites" },
]

const packageImages = [
	{ id: "01", url: "/images/package/clock-tower.jpg", name: "Clock Tower" },
	{ id: "02", url: "/images/package/hajj-umrah.webp", name: "Tawaaf" },
	{ id: "03", url: "/images/package/hajj-umrah2.webp", name: "Hajj Pilgrimage" },
	{ id: "04", url: "/images/package/haram-gate.jpg", name: "Haram Gate" },
	{ id: "05", url: "/images/package/madinah.jpg", name: "Canopy umbrella" },
	{ id: "06", url: "/images/package/makkah.jpg", name: "Ka'bah" },
	{ id: "07", url: "/images/package/masjid-nabawiy.jpg", name: "Prophet's Mosque" },
	{ id: "08", url: "/images/package/pilgrim.jpg", name: "PIlgrim Supplicating" },
]

export default function CreatePackagePage() {
	const { user } = useAuth()
	const router = useRouter()
	const { toast } = useToast()
	const [loading, setLoading] = useState(false)

	const [packageData, setPackageData] = useState({
		name: "",
		type: "",
		price: "",
		description: "",
		duration: "",
		services: [] as string[],
		selectedImage: "",
		includeItinerary: false,
		itinerary: [{ dayRange: "1-3", title: "", description: "", location: "" }],
		slots: "",
		departureDate: "",
		arrivalDate: "",
		flexibleDates: false,
	})

	const handleInputChange = (field: any, value: any) => {
		setPackageData((prev) => ({
			...prev,
			[field]: value,
		}))
	}

	const handleServiceToggle = (serviceId: any) => {
		setPackageData((prev) => ({
			...prev,
			services: prev.services.includes(serviceId)
				? prev.services.filter((id) => id !== serviceId)
				: [...prev.services, serviceId],
		}))
	}

	const addItineraryPeriod = () => {
		setPackageData((prev) => ({
			...prev,
			itinerary: [
				...prev.itinerary,
				{
					dayRange: "",
					title: "",
					description: "",
					location: "",
				},
			],
		}))
	}

	const removeItineraryPeriod = (index: any) => {
		if (packageData.itinerary.length > 1) {
			setPackageData((prev) => ({
				...prev,
				itinerary: prev.itinerary.filter((_, i) => i !== index),
			}))
		}
	}

	const updateItineraryPeriod = (index: any, field: any, value: any) => {
		setPackageData((prev) => ({
			...prev,
			itinerary: prev.itinerary.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
		}))
	}

	const handleImageSelect = (imageId: any) => {
		setPackageData((prev) => ({
			...prev,
			selectedImage: imageId,
		}))
	}

	const toggleItinerary = () => {
		setPackageData((prev) => ({
			...prev,
			includeItinerary: !prev.includeItinerary,
		}))
	}

	const validateForm = () => {
		if (!packageData.name.trim()) {
			toast({
				title: "Validation Error",
				description: "Package name is required",
				variant: "destructive",
			})
			return false
		}

		if (!packageData.type) {
			toast({
				title: "Validation Error",
				description: "Package type is required",
				variant: "destructive",
			})
			return false
		}

		if (!packageData.price || isNaN(Number(packageData.price)) || Number(packageData.price) <= 0) {
			toast({
				title: "Validation Error",
				description: "Valid price is required",
				variant: "destructive",
			})
			return false
		}

		if (packageData.services.length === 0) {
			toast({
				title: "Validation Error",
				description: "At least one service must be selected",
				variant: "destructive",
			})
			return false
		}

		if (!packageData.slots || isNaN(Number(packageData.slots)) || Number(packageData.slots) < 1) {
			toast({
				title: "Validation Error",
				description: "Please enter a valid number of slots (at least 1)",
				variant: "destructive",
			})
			return false
		}

		if (
			packageData.includeItinerary &&
			packageData.itinerary.some((period) => !period.title.trim() || !period.dayRange.trim())
		) {
			toast({
				title: "Validation Error",
				description: "All itinerary periods must have a title and day range",
				variant: "destructive",
			})
			return false
		}

		return true
	}

	if (!user) {
        // Optionally redirect or show a loading spinner if ProtectedRoute isn't immediate
        // Though ProtectedRoute should handle this for you.
        return null; // Or a loading component, or router.push('/login');
    }

	const handleSubmit = async (status = "draft") => {
		if (!validateForm()) return

		setLoading(true)
		try {
			// Get user profile data for handler information
			const userProfile = await getUserData(user.uid)

			const selectedServices = availableServices.filter((service) => packageData.services.includes(service.id))
			const selectedImageData = packageImages.find((img) => img.id === packageData.selectedImage)

			const packagePayload = {
				title: packageData.name,
				type: packageData.type,
				price: Number(packageData.price),
				description:
					packageData.description || `${packageData.type} package with ${selectedServices.length} services included`,
				duration: Number(packageData.duration) || 7,
				agencyId: user.uid,
				agencyName: user.agencyName || user.displayName || user.email, // <-- updated line
				// handlerFirstName: userProfile?.handlerFirstName || "",
				// handlerLastName: userProfile?.handlerLastName || "",
				// handlerFullName:
				// 	userProfile?.handlerFirstName && userProfile?.handlerLastName
				// 		? `${userProfile.handlerFirstName} ${userProfile.handlerLastName}`
				// 		: "",
				status: status,
				services: selectedServices,
				itinerary: packageData.includeItinerary ? packageData.itinerary : [],
				inclusions: selectedServices.map((s) => s.label),
				exclusions: availableServices
					.filter((service) => !packageData.services.includes(service.id))
					.map((s) => s.label),
				groupSize: Number(packageData.slots), // <-- Use slots as groupSize
				accommodationType: "Hotel",
				transportation: packageData.services.includes("local-transportation") ? "Included" : "Not Included",
				meals: packageData.services.includes("meals") ? "Included" : "Not Included",
				imageUrl: selectedImageData?.url || "",
				imageName: selectedImageData?.name || "",
				slots: Number(packageData.slots), // <-- Save slots explicitly too
			}

			const result = await createPackage(packagePayload)

			toast({
				title: status === "active" ? "Package Published" : "Package Saved",
				description:
					status === "active"
						? "Your package has been published and is now visible to pilgrims"
						: "Your package has been saved as a draft",
				variant: "default",
			})

			router.push("/dashboard/agency/offerings")
		} catch (error) {
			console.error("Error creating package:", error)
			toast({
				title: "Error",
				description: "Failed to create package. Please try again.",
				variant: "destructive",
			})
		} finally {
			setLoading(false)
		}
	}

	const getSelectedServices = () => {
		return availableServices.filter((service) => packageData.services.includes(service.id))
	}

	return (
		<ProtectedRoute allowedRoles={["agency"]}>
			<DashboardLayout userType="agency">
				<div className="space-y-6">
					{/* Header */}
					<div className="flex items-center gap-4">
						<Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/agency/offerings")}>
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<div>
							<h1 className="text-2xl font-bold">Create New Package</h1>
							<p className="text-muted-foreground">Design your Hajj or Umrah package for pilgrims</p>
							<p className="text-xs text-primary font-semibold mt-1">
								* Note: A 3% agency fee will be charged for every booking made on the Al-mutamir platform.
							</p>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{/* Main Form */}
						<div className="lg:col-span-2 space-y-6">
							{/* Basic Information */}
							<Card>
								<CardHeader>
									<CardTitle>Basic Information</CardTitle>
									<CardDescription>Enter the basic details of your package</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="name">Package Name *</Label>
											<Input
												id="name"
												placeholder="e.g., Premium Umrah Package"
												value={packageData.name}
												onChange={(e) => handleInputChange("name", e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="type">Package Type *</Label>
											<Select value={packageData.type} onValueChange={(value) => handleInputChange("type", value)}>
												<SelectTrigger>
													<SelectValue placeholder="Select package type" />
												</SelectTrigger>
												<SelectContent>
													{packageTypes.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="price">Price (₦) *</Label>
											<Input
												id="price"
												type="number"
												placeholder="e.g., 850000"
												value={packageData.price}
												onChange={(e) => handleInputChange("price", e.target.value)}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="duration">Duration (days)</Label>
											<Input
												id="duration"
												type="number"
												placeholder="e.g., 14"
												value={packageData.duration}
												onChange={(e) => handleInputChange("duration", e.target.value)}
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="description">Description (Optional)</Label>
										<Textarea
											id="description"
											placeholder="Describe your package in detail..."
											value={packageData.description}
											onChange={(e) => handleInputChange("description", e.target.value)}
											rows={3}
										/>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="slots">Number of Slots *</Label>
											<Input
												id="slots"
												type="number"
												min={1}
												placeholder="e.g., 50"
												value={packageData.slots}
												onChange={(e) => handleInputChange("slots", e.target.value)}
											/>
											<p className="text-xs text-muted-foreground">
												Maximum number of pilgrims that can book this package.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Package Image */}
							<Card>
								<CardHeader>
									<CardTitle>Package Image</CardTitle>
									<CardDescription>Choose an image that represents your package</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{packageImages.map((image) => (
											<div
												key={image.id}
												className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
													packageData.selectedImage === image.id
														? "border-primary ring-2 ring-primary/20"
														: "border-muted hover:border-primary/50"
												}`}
												onClick={() => handleImageSelect(image.id)}
											>
												<div className="aspect-square bg-muted flex items-center justify-center">
													<img
														src={image.url || "/placeholder.svg"}
														alt={image.name}
														className="w-full h-full object-cover"
														onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
													const targetImg = e.target as HTMLImageElement;
            										targetImg.style.display = "none";
													const nextSiblingElement = targetImg.nextSibling as HTMLElement;
            										if (nextSiblingElement) {
                									nextSiblingElement.style.display = "flex";
            										}			
												}}
													/>
													<div className="hidden w-full h-full items-center justify-center bg-muted text-muted-foreground text-sm">
														{image.name}
													</div>
												</div>
												<div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
												{packageData.selectedImage === image.id && (
													<div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
														<svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
															<path
																fillRule="evenodd"
																d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
																clipRule="evenodd"
															/>
														</svg>
													</div>
												)}
											</div>
										))}
									</div>
									<p className="text-sm text-muted-foreground mt-2">
										{packageData.selectedImage
											? `Selected: ${packageImages.find((img) => img.id === packageData.selectedImage)?.name}`
											: "No image selected"}
									</p>
								</CardContent>
							</Card>

							{/* Services Offered */}
							<Card>
								<CardHeader>
									<CardTitle>Services Offered *</CardTitle>
									<CardDescription>Select all services included in your package</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										{availableServices.map((service) => (
											<div
												key={service.id}
												className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50"
											>
												<Checkbox
													id={service.id}
													checked={packageData.services.includes(service.id)}
													onCheckedChange={() => handleServiceToggle(service.id)}
												/>
												<div className="flex-1">
													<Label htmlFor={service.id} className="font-medium cursor-pointer">
														{service.label}
													</Label>
													<p className="text-sm text-muted-foreground">{service.description}</p>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>

							{/* Itinerary (Optional) */}
							<Card>
								<CardHeader>
									<div className="flex items-center justify-between">
										<div>
											<CardTitle className="flex items-center gap-2">
												Itinerary
												<Checkbox checked={packageData.includeItinerary} onCheckedChange={toggleItinerary} />
											</CardTitle>
											<CardDescription>
												{packageData.includeItinerary
													? "Plan the activities by day ranges for your package"
													: "Check to add a detailed itinerary to your package"}
											</CardDescription>
										</div>
										{packageData.includeItinerary && (
											<Button type="button" variant="outline" size="sm" onClick={addItineraryPeriod}>
												<Plus className="h-4 w-4 mr-1" />
												Add Period
											</Button>
										)}
									</div>
								</CardHeader>
								{packageData.includeItinerary && (
									<CardContent className="space-y-4">
										{packageData.itinerary.map((period, index) => (
											<div key={index} className="border rounded-lg p-4 space-y-3">
												<div className="flex items-center justify-between">
													<h4 className="font-medium">Period {index + 1}</h4>
													{packageData.itinerary.length > 1 && (
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => removeItineraryPeriod(index)}
														>
															<Minus className="h-4 w-4" />
														</Button>
													)}
												</div>

												<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
													<div className="space-y-2">
														<Label>Day Range *</Label>
														<Input
															placeholder="e.g., 1-3 or 4-7"
															value={period.dayRange}
															onChange={(e) => updateItineraryPeriod(index, "dayRange", e.target.value)}
														/>
													</div>
													<div className="space-y-2">
														<Label>Title *</Label>
														<Input
															placeholder="e.g., Arrival in Makkah"
															value={period.title}
															onChange={(e) => updateItineraryPeriod(index, "title", e.target.value)}
														/>
													</div>
													<div className="space-y-2">
														<Label>Location</Label>
														<Input
															placeholder="e.g., Makkah"
															value={period.location}
															onChange={(e) => updateItineraryPeriod(index, "location", e.target.value)}
														/>
													</div>
												</div>

												<div className="space-y-2">
													<Label>Description</Label>
													<Textarea
														placeholder="Describe the activities for this period..."
														value={period.description}
														onChange={(e) => updateItineraryPeriod(index, "description", e.target.value)}
														rows={2}
													/>
												</div>
											</div>
										))}
									</CardContent>
								)}
							</Card>

							{/* Travel Dates */}
							<Card>
								<CardHeader>
									<CardTitle>Travel Dates</CardTitle>
									<CardDescription>Specify the travel dates for your package</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="departureDate">Departure Date</Label>
											<Input
												id="departureDate"
												type="date"
												value={packageData.departureDate}
												onChange={(e) => handleInputChange("departureDate", e.target.value)}
												disabled={packageData.flexibleDates}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="arrivalDate">Arrival Date</Label>
											<Input
												id="arrivalDate"
												type="date"
												value={packageData.arrivalDate}
												onChange={(e) => handleInputChange("arrivalDate", e.target.value)}
												disabled={packageData.flexibleDates}
											/>
										</div>
									</div>
									<div className="flex items-center space-x-2 mt-2">
										<Checkbox
											id="flexibleDates"
											checked={packageData.flexibleDates}
											onCheckedChange={(checked) => handleInputChange("flexibleDates", checked)}
										/>
										<Label htmlFor="flexibleDates">Flexible Dates</Label>
									</div>
								</CardContent>
							</Card>

							{/* Action Buttons */}
							<div className="flex justify-end gap-3">
								<Button variant="outline" onClick={() => router.push("/dashboard/agency/offerings")} disabled={loading}>
									Cancel
								</Button>
								<Button variant="secondary" onClick={() => handleSubmit("draft")} disabled={loading}>
									<Save className="h-4 w-4 mr-2" />
									Save as Draft
								</Button>
								<Button onClick={() => handleSubmit("active")} disabled={loading}>
									<Eye className="h-4 w-4 mr-2" />
									Publish Package
								</Button>
							</div>
						</div>

						{/* Preview Sidebar */}
						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle>Package Preview</CardTitle>
									<CardDescription>
										How your package will appear to pilgrims
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{packageData.selectedImage && (
										<div className="aspect-video rounded-lg overflow-hidden bg-muted">
											<img
												src={
													packageImages.find((img) => img.id === packageData.selectedImage)?.url || "/placeholder.svg"
												}
												alt="Package preview"
												className="w-full h-full object-cover"
												onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
													const targetImg = e.target as HTMLImageElement;
            										targetImg.style.display = "none";
													const nextSiblingElement = targetImg.nextSibling as HTMLElement;
            										if (nextSiblingElement) {
                									nextSiblingElement.style.display = "flex";
            										}			
												}}
											/>
											<div className="hidden w-full h-full items-center justify-center bg-muted text-muted-foreground">
												Package Image
											</div>
										</div>
									)}

									<div>
										<h3 className="font-semibold text-lg">{packageData.name || "Package Name"}</h3>
										{packageData.type && (
											<Badge variant="secondary" className="mt-1">
												{packageTypes.find((t) => t.value === packageData.type)?.label}
											</Badge>
										)}
									</div>

									{packageData.price && (
										<div>
											<p className="text-2xl font-bold text-primary">₦{Number(packageData.price).toLocaleString()}</p>
											{packageData.duration && (
												<p className="text-sm text-muted-foreground">{packageData.duration} days</p>
											)}
										</div>
									)}

									{packageData.description && (
										<div>
											<h4 className="font-medium mb-2">Description</h4>
											<p className="text-sm text-muted-foreground">{packageData.description}</p>
										</div>
									)}

									{packageData.services.length > 0 && (
										<div>
											<h4 className="font-medium mb-2">Services Included</h4>
											<div className="space-y-1">
												{packageData.services.map((serviceId) => {
													const service = availableServices.find((s) => s.id === serviceId)
													return (
														<div key={serviceId} className="flex items-center text-sm">
															<div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
															{service?.label}
														</div>
													)
												})}
											</div>
										</div>
									)}

									{packageData.includeItinerary && packageData.itinerary.some((period) => period.title) && (
										<div>
											<h4 className="font-medium mb-2">Itinerary Highlights</h4>
											<div className="space-y-2">
												{packageData.itinerary
													.filter((period) => period.title)
													.slice(0, 3)
													.map((period, index) => (
														<div key={index} className="text-sm">
															<span className="font-medium">Days {period.dayRange}:</span> {period.title}
															{period.location && <span className="text-muted-foreground"> ({period.location})</span>}
														</div>
													))}
												{packageData.itinerary.filter((period) => period.title).length > 3 && (
													<p className="text-sm text-muted-foreground">
														+{packageData.itinerary.filter((period) => period.title).length - 3} more periods
													</p>
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</DashboardLayout>
		</ProtectedRoute>
	)
}
