'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { BuySection } from '../waitlist/marketplace/buy-section';
import { SellerProfileHeader } from '../waitlist/marketplace/seller-profile-header';
import { DashboardView } from '../waitlist/marketplace/dashboard-view';
import { CarSelector } from '../waitlist/marketplace/car-selector';
import { MarketDemandTable } from '../waitlist/marketplace/market-demand-table';
import { InventoryVehicleCard } from '../waitlist/marketplace/inventory-vehicle-card';
import { SaleRequestsCard } from '../waitlist/marketplace/sale-requests-card';
import { SellerPerformanceCard } from '../waitlist/marketplace/seller-performance-card';
import { AddPartDialog } from '../waitlist/marketplace/add-part-dialog';
import { ComparisonDrawer } from '../waitlist/marketplace/comparison-drawer';

type UrgencyLevel = 'urgent' | 'soon' | 'optional';
type Priority = 'high' | 'medium' | 'low';

interface RestorationSupply {
  name: string;
  price: number;
  selected: boolean;
}

interface Part {
  id: string;
  name: string;
  urgency: UrgencyLevel;
  priority: Priority;
  aiVerified: boolean;
  priceRange: string;
  topPrice: string;
  sellerName: string;
  sellerInitials: string;
  sellerRating: number;
  sellerDistance: string;
  sellerCount: number;
  imageUrl?: string;
  restorationSupplies?: RestorationSupply[];
  partNumber?: string;
  compatibility?: string;
  specifications?: string;
  diagnosis?: string;
  installDifficulty?: 'Easy' | 'Medium' | 'Hard';
  installTime?: string;
  condition?: string;
  warranty?: string;
}

interface CarData {
  id: string;
  name: string;
  imageUrl: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: string;
  partsListed: number;
  partsSold: number;
  totalRevenue: number;
  rating: number;
  pendingRequests: number;
}

export function Marketplace() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [selectedCarId, setSelectedCarId] = useState<string | null>('car-1');
  const [addPartOpen, setAddPartOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string>('');
  const [comparisonSheetOpen, setComparisonSheetOpen] = useState(false);
  const [comparisonPart, setComparisonPart] = useState<string>('');

  const [buyParts, setBuyParts] = useState<Part[]>([
    {
      id: '1',
      name: 'Alternator',
      urgency: 'urgent',
      priority: 'high',
      aiVerified: true,
      priceRange: '$120-$180',
      topPrice: '$145',
      sellerName: 'Auto Parts Pro',
      sellerInitials: 'AP',
      sellerRating: 4.9,
      sellerDistance: '2.3 mi',
      sellerCount: 8,
      imageUrl: 'https://images.unsplash.com/photo-1654166827605-974dd2e9bb1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbHRlcm5hdG9yJTIwYXV0b21vdGl2ZXxlbnwxfHx8fDE3NjIxOTU1NTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      partNumber: 'BOSCH 0-123-520-017',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L V6',
      specifications: '90A 12V • 6-Groove Pulley',
      diagnosis: 'AI detected: Voltage drops to 12.8V at idle, dimming headlights',
      installDifficulty: 'Medium',
      installTime: '1.5-2 hours',
      condition: 'New (OE Quality)',
      warranty: '2 Year / 24,000 mi',
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
      urgency: 'urgent',
      priority: 'medium',
      aiVerified: true,
      priceRange: '$35-$65',
      topPrice: '$42',
      sellerName: 'Mike Chen',
      sellerInitials: 'MC',
      sellerRating: 4.8,
      sellerDistance: '5.1 mi',
      sellerCount: 5,
      imageUrl: 'https://images.unsplash.com/photo-1654611842276-ffe361f5d16b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWxheSUyMGZ1c2UlMjBhdXRvbW90aXZlfGVufDF8fHx8MTc2MjE5NTU1OXww&ixlib=rb-4.1.0&q=80&w=1080',
      partNumber: 'HYUNDAI 95220-3B000',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L',
      specifications: '12V 30A • 4-Pin ISO Micro Relay',
      diagnosis: 'AI detected: Engine cranks but no start',
      installDifficulty: 'Easy',
      installTime: '15-30 minutes',
      condition: 'New (OEM)',
      warranty: '1 Year / 12,000 mi',
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
      urgency: 'soon',
      priority: 'high',
      aiVerified: true,
      priceRange: '$95-$165',
      topPrice: '$125',
      sellerName: 'CarParts Hub',
      sellerInitials: 'CH',
      sellerRating: 5.0,
      sellerDistance: '1.8 mi',
      sellerCount: 12,
      imageUrl: 'https://images.unsplash.com/photo-1760804462141-442810513d4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjByYWRpYXRvciUyMGVuZ2luZXxlbnwxfHx8fDE3NjIxOTUzNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
      partNumber: 'DENSO 221-9211',
      compatibility: 'Fits 2000 Hyundai Galloper 3.0L',
      specifications: '2-Row Aluminum Core',
      diagnosis: 'AI detected: Coolant temp reaching 220°F',
      installDifficulty: 'Hard',
      installTime: '3-4 hours',
      condition: 'New (Aftermarket)',
      warranty: '1 Year / 12,000 mi',
      restorationSupplies: [
        { name: 'Coolant (1 Gal)', price: 22, selected: true },
        { name: 'Hose Set', price: 45, selected: true },
        { name: 'Hose Clamps', price: 12, selected: true },
        { name: 'Cap', price: 18, selected: true },
        { name: 'Thermostat', price: 32, selected: true },
        { name: 'Sealant', price: 14, selected: true },
      ],
    },
  ]);

  const [carsData] = useState<CarData[]>([
    {
      id: '1',
      name: '2000 Hyundai Galloper',
      imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      make: 'Hyundai',
      model: 'Galloper',
      year: 2000,
      vin: 'KMHJN81WPYU034521',
      mileage: '145,200 mi',
      partsListed: 28,
      partsSold: 18,
      totalRevenue: 3450,
      rating: 4.9,
      pendingRequests: 3,
    },
    {
      id: '2',
      name: '2008 Honda Accord LX',
      imageUrl: 'https://images.unsplash.com/photo-1590362891991-f776e747a588?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      make: 'Honda',
      model: 'Accord LX',
      year: 2008,
      vin: '1HGCP26758A084321',
      mileage: '178,000 mi',
      partsListed: 42,
      partsSold: 35,
      totalRevenue: 4920,
      rating: 4.7,
      pendingRequests: 5,
    },
    {
      id: '3',
      name: '2005 Toyota Camry LE',
      imageUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
      make: 'Toyota',
      model: 'Camry LE',
      year: 2005,
      vin: '4T1BE32K25U598437',
      mileage: '215,500 mi',
      partsListed: 35,
      partsSold: 22,
      totalRevenue: 5680,
      rating: 5.0,
      pendingRequests: 2,
    },
  ]);

  const handleToggleCart = (itemId: string) => {
    setCartItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleListPart = (partName: string) => {
    setSelectedPart(partName);
    setAddPartOpen(true);
  };

  const handleCompareOffers = (partName: string) => {
    setComparisonPart(partName);
    setComparisonSheetOpen(true);
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/sections/background-4.svg)',
      }}
    >
      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col px-16 py-16 gap-8">
        {/* Buy/Sell Tabs */}
        <div className="flex justify-center">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')} className="flex-shrink-0">
            <TabsList className="inline-flex bg-[#1a1a1a] border border-[#808080]/30 p-1.5 gap-3 relative">
              <TabsTrigger
                value="buy"
                className="data-[state=active]:bg-[#8BE196] data-[state=active]:text-[#000000] data-[state=active]:shadow-[0_0_15px_rgba(139,225,150,0.4),inset_0_0_10px_rgba(139,225,150,0.2)] transition-all duration-500 px-6 py-2 relative z-10 text-white font-['DM_Sans']"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Buy
              </TabsTrigger>
              <TabsTrigger
                value="sell"
                className="data-[state=active]:bg-[#8BE196] data-[state=active]:text-[#000000] data-[state=active]:shadow-[0_0_15px_rgba(139,225,150,0.4),inset_0_0_10px_rgba(139,225,150,0.2)] transition-all duration-500 px-6 py-2 relative z-10 text-white font-['DM_Sans']"
              >
                <Package className="w-4 h-4 mr-2" />
                Sell
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'buy' && (
            <motion.div
              key="buy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <BuySection
                parts={buyParts}
                onPartsChange={setBuyParts}
                cars={carsData}
                selectedItems={cartItems}
                onToggleItem={handleToggleCart}
              />
            </motion.div>
          )}

          {activeTab === 'sell' && (
            <motion.div
              key="sell"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col gap-4"
            >
              {/* Car Selector */}
              <div className="flex justify-center">
                <CarSelector
                  cars={carsData}
                  selectedCarId={selectedCarId}
                  onSelectCar={setSelectedCarId}
                />
              </div>

              {/* Dashboard View - All Cars */}
              {selectedCarId === null && (
                <DashboardView cars={carsData} />
              )}

              {/* Individual Car View */}
              {selectedCarId !== null && (() => {
                const selectedCar = carsData.find(c => c.id === selectedCarId);
                if (!selectedCar) return null;

                return (
                  <div className="grid lg:grid-cols-[1fr_280px] gap-6">
                    {/* Main Content - Market Demand Table */}
                    <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-6 shadow-xl">
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="text-white mb-1 font-['DM_Sans']">Market Demand Analysis</h3>
                          <p className="text-xs text-[#C4C4C4]/60 font-['DM_Sans']">AI-powered insights for {selectedCar.year} {selectedCar.make} {selectedCar.model}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#8BE196]/10 border border-[#8BE196]/30 rounded-lg">
                          <motion.div
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.2, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-1.5 h-1.5 rounded-full bg-[#8BE196]"
                          />
                          <span className="text-[10px] text-[#8BE196] uppercase tracking-wider font-['DM_Sans']">Live Data</span>
                        </div>
                      </div>
                      <MarketDemandTable onListPart={handleListPart} />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                      {/* Inventory Vehicle Card - Compact */}
                      <InventoryVehicleCard
                        imageUrl={selectedCar.imageUrl}
                        make={selectedCar.make}
                        model={selectedCar.model}
                        year={selectedCar.year}
                        vin={selectedCar.vin}
                        mileage={selectedCar.mileage}
                        partsListed={selectedCar.partsListed}
                        partsSold={selectedCar.partsSold}
                        totalRevenue={selectedCar.totalRevenue}
                        rating={selectedCar.rating}
                        onAddPart={() => setAddPartOpen(true)}
                      />

                      <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-6 shadow-xl">
                        <h3 className="text-white text-sm mb-3 font-['DM_Sans']">Requests ({selectedCar.pendingRequests})</h3>
                        <SaleRequestsCard />
                      </div>
                      <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-6 shadow-xl">
                        <h3 className="text-white text-sm mb-3 font-['DM_Sans']">Performance</h3>
                        <SellerPerformanceCard />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dialogs */}
      <AddPartDialog
        open={addPartOpen}
        onOpenChange={setAddPartOpen}
        partName={selectedPart}
      />
      <ComparisonDrawer
        isOpen={comparisonSheetOpen}
        onClose={() => setComparisonSheetOpen(false)}
        partName={comparisonPart}
      />
    </div>
  );
}
