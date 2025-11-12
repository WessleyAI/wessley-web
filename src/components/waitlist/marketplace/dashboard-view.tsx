import { motion } from 'framer-motion';
import { Package, DollarSign, Star, Car } from 'lucide-react';
import { MarketDemandTable } from './market-demand-table';
import { CarData } from './car-selector';

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
      {/* Mobile Simplified View - Direct and Actionable */}
      <div className="block md:hidden w-full">
        <div className="bg-[#1a1a1a] border border-[#808080]/30 rounded-xl p-4">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start gap-2">
              <Package className="w-5 h-5 text-[#8BE196] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1" style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}>
                  Your marketplace is active
                </h4>
                <p className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                  You have <span className="text-[#8BE196] font-medium">{totalPartsListed} parts listed</span> from {cars.length} {cars.length === 1 ? 'vehicle' : 'vehicles'}:
                </p>
              </div>
            </div>

            {/* Vehicle Listings */}
            <div className="space-y-2">
              {cars.map((car) => (
                <div key={car.id} className="bg-[#161616] border border-[#808080]/20 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-white font-medium" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                      {car.year} {car.make} {car.model}
                    </span>
                    {car.pendingRequests > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-[#8BE196]/20 text-[#8BE196]" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>
                        {car.pendingRequests} new {car.pendingRequests === 1 ? 'request' : 'requests'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.6875rem, 2.25vw, 0.75rem)' }}>
                      <span className="text-[#8BE196] font-medium">{car.partsListed}</span> parts · <span className="text-[#8BE196] font-medium">{car.partsSold}</span> sold · <span className="text-[#8BE196] font-medium">${car.totalRevenue.toLocaleString()}</span> revenue
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#8BE196] fill-[#8BE196]" />
                      <span className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>
                        {car.rating.toFixed(1)} rating
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Summary */}
            <div className="bg-[#161616] border border-[#808080]/20 rounded-lg p-2.5">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-white font-semibold" style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>{totalPartsSold}</div>
                  <div className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>Sold</div>
                </div>
                <div>
                  <div className="text-[#8BE196] font-semibold" style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>${totalRevenue.toLocaleString()}</div>
                  <div className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>Revenue</div>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-0.5">
                    <Star className="w-3 h-3 text-[#8BE196] fill-[#8BE196]" />
                    <span className="text-white font-semibold" style={{ fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>{averageRating.toFixed(2)}</span>
                  </div>
                  <div className="text-[#C4C4C4]" style={{ fontSize: 'clamp(0.625rem, 2vw, 0.6875rem)' }}>Rating</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <motion.button
              className="w-full bg-[#8BE196] hover:bg-[#9DF4A8] text-[#000000] font-semibold rounded-lg py-2.5 px-4 transition-colors"
              style={{ fontSize: 'clamp(0.8125rem, 2.75vw, 0.9375rem)' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Manage Your Listings
            </motion.button>

            {/* Pending requests notice */}
            {cars.reduce((sum, car) => sum + car.pendingRequests, 0) > 0 && (
              <p className="text-center text-[#8BE196]" style={{ fontSize: 'clamp(0.6875rem, 2.25vw, 0.8125rem)' }}>
                {cars.reduce((sum, car) => sum + car.pendingRequests, 0)} pending {cars.reduce((sum, car) => sum + car.pendingRequests, 0) === 1 ? 'request' : 'requests'} waiting for your response
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Full View */}
      <div className="hidden md:flex md:flex-1 md:gap-6">
      {/* Stats + Market Demand */}
      <div className="flex-1 space-y-6">
        {/* Consolidated Stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#808080]/30 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8BE196]/5 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Car className="w-3 h-3 text-[#8BE196]" />
                <span className="text-[#C4C4C4]/60 uppercase tracking-wider font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>Vehicles</span>
              </div>
              <div className="text-white mb-0.5 font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)' }}>{cars.length}</div>
              <div className="text-[#C4C4C4]/50 font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>in inventory</div>
            </div>
          </motion.div>

          {/* Total Parts Listed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#808080]/30 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8BE196]/5 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3 h-3 text-[#8BE196]" />
                <span className="text-[#C4C4C4]/60 uppercase tracking-wider font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>Parts Listed</span>
              </div>
              <div className="text-white mb-0.5 font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)' }}>{totalPartsListed}</div>
              <div className="text-[#C4C4C4]/50 font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>across all vehicles</div>
            </div>
          </motion.div>

          {/* Total Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#808080]/30 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8BE196]/5 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="w-3 h-3 text-[#8BE196]" />
                <span className="text-[#C4C4C4]/60 uppercase tracking-wider font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>Total Revenue</span>
              </div>
              <div className="text-[#8BE196] mb-0.5 font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)' }}>${totalRevenue.toLocaleString()}</div>
              <div className="text-[#C4C4C4]/50 font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>lifetime earnings</div>
            </div>
          </motion.div>

          {/* Average Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] border border-[#808080]/30 rounded-lg p-2.5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#8BE196]/5 rounded-full -mr-8 -mt-8" />
            <div className="relative">
              <div className="flex items-center gap-1.5 mb-1">
                <Star className="w-3 h-3 text-[#8BE196] fill-[#8BE196]" />
                <span className="text-[#C4C4C4]/60 uppercase tracking-wider font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>Avg Rating</span>
              </div>
              <div className="text-white mb-0.5 font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(1.125rem, 1.5vw, 1.375rem)' }}>{averageRating.toFixed(2)}</div>
              <div className="text-[#C4C4C4]/50 font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>seller rating</div>
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
            <h3 className="text-white mb-1 font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(0.9375rem, 1.1vw, 1rem)' }}>Market Demand Analysis</h3>
            <p className="text-[#C4C4C4]/60 font-['DM_Sans']" style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.8125rem)' }}>Consolidated demand insights across all inventory</p>
          </div>
          <MarketDemandTable />
        </motion.div>
      </div>
      </div>
    </div>
  );
}
