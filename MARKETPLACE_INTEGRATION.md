# Marketplace Integration Instructions

## Step 1: Add state variables after line 63 in page.tsx

After `const scrollRef = useRef<HTMLDivElement>(null)`, add:

```typescript
  // Marketplace state
  const [cartItems, setCartItems] = useState<Set<string>>(new Set())
  const [hoveredDiagnosis, setHoveredDiagnosis] = useState<string | null>(null)
  const [buyParts, setBuyParts] = useState<Part[]>([
    {
      id: '1',
      name: 'Alternator',
      urgency: 'urgent' as UrgencyLevel,
      priority: 'high' as Priority,
      aiVerified: true,
      priceRange: '$120-$180',
      topPrice: '$145',
      sellerName: 'Auto Parts Pro',
      sellerInitials: 'AP',
      sellerRating: 4.9,
      sellerDistance: '2.3 mi',
      sellerCount: 8,
      imageUrl: 'https://images.unsplash.com/photo-1654166827605-974dd2e9bb1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHRlcm5hdG9yJTIwYXV0b21vdGl2ZXxlbnwxfHx8fDE3NjIxOTU1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      restorationSupplies: [
        { name: 'Brushes Kit', price: 18, selected: true },
        { name: 'Voltage Regulator', price: 35, selected: true },
        { name: 'Bearing Kit', price: 28, selected: true },
        { name: 'Serpentine Belt', price: 42, selected: true },
      ],
    },
    {
      id: '2',
      name: 'Fuel Relay',
      urgency: 'urgent' as UrgencyLevel,
      priority: 'medium' as Priority,
      aiVerified: true,
      priceRange: '$35-$65',
      topPrice: '$42',
      sellerName: 'Mike Chen',
      sellerInitials: 'MC',
      sellerRating: 4.8,
      sellerDistance: '5.1 mi',
      sellerCount: 5,
      imageUrl: 'https://images.unsplash.com/photo-1654611842276-ffe361f5d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWxheSUyMGZ1c2UlMjBhdXRvbW90aXZlfGVufDF8fHx8MTc2MjE5NTU1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      restorationSupplies: [
        { name: 'Socket Connector', price: 8, selected: true },
        { name: 'Contact Cleaner', price: 12, selected: true },
        { name: 'Dielectric Grease', price: 9, selected: true },
        { name: 'Wire Set', price: 15, selected: true },
      ],
    },
    {
      id: '3',
      name: 'Radiator',
      urgency: 'soon' as UrgencyLevel,
      priority: 'high' as Priority,
      aiVerified: true,
      priceRange: '$95-$165',
      topPrice: '$125',
      sellerName: 'CarParts Hub',
      sellerInitials: 'CH',
      sellerRating: 5.0,
      sellerDistance: '1.8 mi',
      sellerCount: 12,
      imageUrl: 'https://images.unsplash.com/photo-1760804462141-442810513d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjByYWRpYXRvciUyMGVuZ2luZXxlbnwxfHx8fDE3NjIxOTUzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      restorationSupplies: [
        { name: 'Coolant (1 Gal)', price: 22, selected: true },
        { name: 'Hose Set', price: 45, selected: true },
        { name: 'Hose Clamps', price: 12, selected: true },
        { name: 'Cap', price: 18, selected: true },
        { name: 'Thermostat', price: 32, selected: true },
        { name: 'Sealant', price: 14, selected: true },
      ],
    },
    {
      id: '4',
      name: 'Brake Pads (Front)',
      urgency: 'soon' as UrgencyLevel,
      priority: 'medium' as Priority,
      aiVerified: false,
      priceRange: '$45-$85',
      topPrice: '$58',
      sellerName: 'James Auto',
      sellerInitials: 'JA',
      sellerRating: 4.7,
      sellerDistance: '8.2 mi',
      sellerCount: 15,
      imageUrl: 'https://images.unsplash.com/photo-1750019487267-47568f388dfa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmFrZSUyMHBhZCUyMGRpc2N8ZW58MXx8fHwxNzYyMTk1NTU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '5',
      name: 'Oil Filter',
      urgency: 'optional' as UrgencyLevel,
      priority: 'low' as Priority,
      aiVerified: false,
      priceRange: '$8-$18',
      topPrice: '$12',
      sellerName: 'QuickParts',
      sellerInitials: 'QP',
      sellerRating: 4.6,
      sellerDistance: '3.4 mi',
      sellerCount: 20,
      imageUrl: 'https://images.unsplash.com/photo-1643151663724-ab51858d5fe1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvaWwlMjBmaWx0ZXIlMjBhdXRvbW90aXZlfGVufDF8fHx8MTc2MjE5NTU1OXww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      id: '6',
      name: 'Spark Plugs (Set)',
      urgency: 'optional' as UrgencyLevel,
      priority: 'low' as Priority,
      aiVerified: false,
      priceRange: '$25-$55',
      topPrice: '$38',
      sellerName: 'Engine Masters',
      sellerInitials: 'EM',
      sellerRating: 4.8,
      sellerDistance: '4.7 mi',
      sellerCount: 18,
      imageUrl: 'https://images.unsplash.com/photo-1759832217256-244b5bc54882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFyayUyMHBsdWclMjBlbmdpbmV8ZW58MXx8fHwxNzYyMTk1NTYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ])

  const [carsData] = useState<CarData[]>([
    {
      id: '1',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Porsche_911_Carrera_RS_2.7_1973_%2815521126459%29.jpg/800px-Porsche_911_Carrera_RS_2.7_1973_%2815521126459%29.jpg',
      make: 'Porsche',
      model: '911 Carrera RS',
      year: 1973,
      vin: 'WP0ZZZ91ZTS458712',
      mileage: 45200,
      partsListed: 28,
      partsSold: 18,
      totalRevenue: 12450,
      rating: 4.9,
      pendingRequests: 3,
    },
    {
      id: '2',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Austin_Mini_Cooper_S_1964.jpg/800px-Austin_Mini_Cooper_S_1964.jpg',
      make: 'Mini',
      model: 'Cooper S',
      year: 1965,
      vin: 'XM2SA9X0000123456',
      mileage: 82000,
      partsListed: 42,
      partsSold: 35,
      totalRevenue: 8920,
      rating: 4.7,
      pendingRequests: 5,
    },
    {
      id: '3',
      imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw1fHxjbGFzc2ljJTIwY2FyfGVufDF8fHx8MTc2MjE5NTU2MHww&ixlib=rb-4.1.0&q=80&w=1080',
      make: 'Mercedes-Benz',
      model: '280SL',
      year: 1971,
      vin: 'WDB11304212345678',
      mileage: 58500,
      partsListed: 35,
      partsSold: 22,
      totalRevenue: 15680,
      rating: 5.0,
      pendingRequests: 2,
    },
  ])

  const handleToggleCart = (itemId: string) => {
    setCartItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const handleCompareOffers = () => {
    console.log('Compare offers clicked')
  }
```

## Step 2: Add marketplace content in section 4

Replace the closing `</div>` on line 547 (after the text content div) with marketplace views:

```typescript
          </div>

          {/* Marketplace Content */}
          <div className="flex-1 min-h-0 mt-6">
            {marketplaceTab === 'buy' && (
              <div className="h-full w-full">
                <PartsMasonryGrid
                  parts={buyParts}
                  onPartsChange={setBuyParts}
                  onCompare={handleCompareOffers}
                  selectedItems={cartItems}
                  onToggleItem={handleToggleCart}
                  hoveredDiagnosis={hoveredDiagnosis}
                />
              </div>
            )}
            {marketplaceTab === 'sell' && (
              <div className="h-full w-full flex flex-col gap-4">
                <SellerProfileHeader
                  name="Sahar Barak"
                  totalRequests={carsData.reduce((sum, car) => sum + car.pendingRequests, 0)}
                  rating={carsData.reduce((sum, car) => sum + car.rating, 0) / carsData.length}
                  totalRevenue={carsData.reduce((sum, car) => sum + car.totalRevenue, 0)}
                />
                <DashboardView cars={carsData} />
              </div>
            )}
          </div>
        </div>
```

## Step 3: Add AnimatePresence import

Change line 4 from:
```typescript
import { motion } from 'framer-motion'
```

To:
```typescript
import { motion, AnimatePresence } from 'framer-motion'
```
