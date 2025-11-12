import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Package, DollarSign, TrendingUp, Plus, ChevronRight, Calendar, Gauge } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

interface InventoryVehicleCardProps {
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
  onAddPart: () => void;
  onViewDetails?: () => void;
}

export function InventoryVehicleCard({
  imageUrl,
  make,
  model,
  year,
  vin,
  mileage,
  partsListed,
  partsSold,
  totalRevenue,
  rating,
  onAddPart,
  onViewDetails,
}: InventoryVehicleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-gradient-to-br from-[#3D3541] to-[#342E3B] border border-[#564B5C]/50 rounded-lg overflow-hidden shadow-lg"
    >
      {/* Header Strip with Gradient */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#9D7B52] via-[#B5E4D3] to-[#9D7B52]" />
      
      <div className="p-2">
        <div className="flex flex-col gap-1.5">
          {/* Vehicle Info with Hover Image */}
          <div>
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <h2 className="text-white text-xs cursor-pointer hover:text-[#B5E4D3] transition-colors">
                  {year} {make} {model}
                </h2>
              </HoverCardTrigger>
              <HoverCardContent 
                side="right" 
                className="w-64 p-0 bg-[#2E3135] border-[#564B5C]"
              >
                <img
                  src={imageUrl}
                  alt={`${make} ${model}`}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </HoverCardContent>
            </HoverCard>
            <Badge variant="outline" className="bg-[#B5E4D3]/10 border-[#B5E4D3]/30 text-[#B5E4D3] text-[8px] mt-0.5 px-1.5 py-0">
              Active
            </Badge>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[#C5B8CC]/70">
            <div>
              <div className="text-[8px] text-[#C5B8CC]/50 uppercase tracking-wider">VIN</div>
              <div className="text-[9px] text-white">{vin}</div>
            </div>
            <div>
              <div className="text-[8px] text-[#C5B8CC]/50 uppercase tracking-wider">Miles</div>
              <div className="text-[9px] text-white">{mileage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B5E4D3]/20 to-transparent" />
    </motion.div>
  );
}
