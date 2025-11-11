import { motion } from 'framer-motion';
import { Package, DollarSign, TrendingUp, Star, Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MarketDemandTable } from './market-demand-table';
import { CarData } from './car-selector';
import { Badge } from '@/components/ui/badge';
import Masonry from 'react-responsive-masonry';

interface DashboardViewProps {
  cars: CarData[];
}

export function DashboardView({ cars }: DashboardViewProps) {
  // Calculate consolidated stats from car data
  const totalPartsListed = cars.reduce((sum, car) => sum + car.partsListed, 0);
  const totalPartsSold = cars.reduce((sum, car) => sum + car.partsSold, 0);
  const totalRevenue = cars.reduce((sum, car) => sum + car.totalRevenue, 0);
  const averageRating = cars.reduce((sum, car) => sum + car.rating, 0) / cars.length;

  return (
    <div className="flex gap-6">
      {/* Left Column: Stats + Market Demand */}
      <div className="flex-1 space-y-6 max-w-2xl">
        {/* Consolidated Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] backdrop-blur border border-[#564B5C]/40 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#9D7B52]/10 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Car className="w-3 h-3 text-[#9D7B52]" />
                <span className="text-[9px] text-[#C5B8CC]/60 uppercase tracking-wider">Vehicles</span>
              </div>
              <div className="text-xl text-white mb-0.5">{cars.length}</div>
              <div className="text-[9px] text-[#C5B8CC]/50">in inventory</div>
            </div>
          </motion.div>

          {/* Total Parts Listed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] backdrop-blur border border-[#564B5C]/40 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#564B5C]/10 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3 h-3 text-[#9D7B52]" />
                <span className="text-[9px] text-[#C5B8CC]/60 uppercase tracking-wider">Parts Listed</span>
              </div>
              <div className="text-xl text-white mb-0.5">{totalPartsListed}</div>
              <div className="text-[9px] text-[#C5B8CC]/50">across all vehicles</div>
            </div>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] backdrop-blur border border-[#564B5C]/40 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#9D7B52]/10 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3 h-3 text-[#B5E4D3]" />
                <span className="text-[9px] text-[#C5B8CC]/60 uppercase tracking-wider">Total Revenue</span>
              </div>
              <div className="text-xl text-[#B5E4D3] mb-0.5">${totalRevenue.toLocaleString()}</div>
              <div className="text-[9px] text-[#C5B8CC]/50">lifetime earnings</div>
            </div>
          </motion.div>

          {/* Average Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            whileHover={{ y: -2 }}
            className="bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] backdrop-blur border border-[#564B5C]/40 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#9D7B52]/10 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3 h-3 text-[#9D7B52] fill-[#9D7B52]" />
                <span className="text-[9px] text-[#C5B8CC]/60 uppercase tracking-wider">Avg Rating</span>
              </div>
              <div className="text-xl text-white mb-0.5">{averageRating}</div>
              <div className="text-[9px] text-[#C5B8CC]/50">seller rating</div>
            </div>
          </motion.div>
        </div>

        {/* Market Demand Analysis - Consolidated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="mb-3">
            <h3 className="text-white text-sm mb-1">Market Demand Analysis</h3>
            <p className="text-[11px] text-[#C5B8CC]/60">Consolidated demand insights across all inventory</p>
          </div>
          <MarketDemandTable />
        </motion.div>
      </div>

      {/* Right Column: Vehicle Breakdown Masonry */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
        className="flex-1"
      >
        <div className="mb-3">
          <h3 className="text-white text-sm mb-1">Vehicle Performance Breakdown</h3>
          <p className="text-[11px] text-[#C5B8CC]/60">Individual stats per vehicle</p>
        </div>

        <Masonry columnsCount={2} gutter="12px">
          {cars.map((car) => {
            const partsListed = car.partsListed;
            const partsSold = car.partsSold;
            const revenue = car.totalRevenue;
            const rating = car.rating;
            const requests = car.pendingRequests;

            return (
              <Card
                key={car.id}
                className="bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] border-[#564B5C] shadow-lg hover:border-[#9D7B52]/50 transition-all"
              >
                <div className="p-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-[#564B5C]/50">
                      <img
                        src={car.imageUrl}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-white text-sm">
                          {car.year} {car.make} {car.model}
                        </h4>
                        {requests > 0 && (
                          <Badge variant="outline" className="bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] text-[8px] px-1.5 py-0">
                            {requests} requests
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] text-[#C5B8CC]/60">
                        <span>VIN: {car.vin}</span>
                        <span>•</span>
                        <span>{car.mileage} mi</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#2B2730]/60 border border-[#564B5C]/30 rounded-md p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Package className="w-2.5 h-2.5 text-[#9D7B52]" />
                          <span className="text-[8px] text-[#C5B8CC]/60 uppercase">Listed</span>
                        </div>
                        <div className="text-base text-white">{partsListed}</div>
                        <div className="text-[8px] text-[#C5B8CC]/50">parts</div>
                      </div>

                      <div className="bg-[#2B2730]/60 border border-[#564B5C]/30 rounded-md p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <TrendingUp className="w-2.5 h-2.5 text-[#B5E4D3]" />
                          <span className="text-[8px] text-[#C5B8CC]/60 uppercase">Sold</span>
                        </div>
                        <div className="text-base text-[#B5E4D3]">{partsSold}</div>
                        <div className="text-[8px] text-[#C5B8CC]/50">parts</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#2B2730]/60 border border-[#564B5C]/30 rounded-md p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <DollarSign className="w-2.5 h-2.5 text-[#9D7B52]" />
                          <span className="text-[8px] text-[#C5B8CC]/60 uppercase">Revenue</span>
                        </div>
                        <div className="text-base text-white">${revenue}</div>
                        <div className="text-[8px] text-[#C5B8CC]/50">total</div>
                      </div>

                      <div className="bg-[#2B2730]/60 border border-[#564B5C]/30 rounded-md p-2">
                        <div className="flex items-center gap-1 mb-0.5">
                          <Star className="w-2.5 h-2.5 text-[#9D7B52] fill-[#9D7B52]" />
                          <span className="text-[8px] text-[#C5B8CC]/60 uppercase">Rating</span>
                        </div>
                        <div className="text-base text-white">{rating}</div>
                        <div className="text-[8px] text-[#C5B8CC]/50">avg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </Masonry>
      </motion.div>
    </div>
  );
}
