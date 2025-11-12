// Temporary file with types to copy

type UrgencyLevel = 'urgent' | 'soon' | 'optional'
type Priority = 'high' | 'medium' | 'low'

interface RestorationSupply {
  name: string
  price: number
  selected: boolean
}

interface Part {
  id: string
  name: string
  urgency: UrgencyLevel
  priority: Priority
  aiVerified: boolean
  priceRange: string
  topPrice: string
  sellerName: string
  sellerInitials: string
  sellerRating: number
  sellerDistance: string
  sellerCount: number
  imageUrl: string
  restorationSupplies?: RestorationSupply[]
}

interface CarData {
  id: string
  imageUrl: string
  make: string
  model: string
  year: number
  vin: string
  mileage: number
  partsListed: number
  partsSold: number
  totalRevenue: number
  rating: number
  pendingRequests: number
}
