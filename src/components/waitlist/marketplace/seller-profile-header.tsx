import { motion } from 'framer-motion';
import { Bell, TrendingUp, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SellerProfileHeaderProps {
  name: string;
  totalRequests: number;
  rating: number;
  totalRevenue: number;
}

export function SellerProfileHeader({
  name,
  totalRequests,
  rating,
  totalRevenue,
}: SellerProfileHeaderProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1a1a1a] border border-[#808080]/30 rounded-lg shadow-lg relative overflow-hidden"
    >
      {/* Decorative gradient - desktop only */}
      <div className="hidden md:block absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8BE196]/50 via-[#8BE196] to-[#8BE196]/50" />

      {/* Mobile Simplified View */}
      <div className="block md:hidden p-3">
        <div className="text-center space-y-2.5">
          <Avatar className="w-10 h-10 mx-auto border border-[#808080]/30">
            <AvatarImage src="" alt={name} />
            <AvatarFallback className="bg-[#161616] text-[#8BE196] font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-white font-semibold mb-1" style={{ fontSize: 'clamp(0.875rem, 3.5vw, 1rem)' }}>Seller Dashboard</h4>
            <div className="flex items-center justify-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#8BE196] fill-[#8BE196]" />
              <span className="text-[#8BE196] font-medium" style={{ fontSize: 'clamp(0.8125rem, 2.75vw, 0.9375rem)' }}>{rating.toFixed(2)} rating</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-[#8BE196]" />
            <span className="text-white font-semibold" style={{ fontSize: 'clamp(0.9375rem, 3.75vw, 1.0625rem)' }}>
              ${totalRevenue.toLocaleString()}
            </span>
          </div>
          {totalRequests > 0 && (
            <div className="bg-[#8BE196]/10 border border-[#8BE196]/30 rounded-lg py-1.5 px-3">
              <p className="text-[#8BE196] font-medium" style={{ fontSize: 'clamp(0.75rem, 2.5vw, 0.875rem)' }}>
                <span className="font-semibold">{totalRequests}</span> new {totalRequests === 1 ? 'request' : 'requests'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Full View */}
      <div className="hidden md:flex md:items-center md:justify-between p-2.5">
        {/* Profile Section */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border border-[#808080]/30">
            <AvatarImage src="" alt={name} />
            <AvatarFallback className="bg-[#161616] text-[#8BE196] text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-['DM_Sans']" style={{ fontSize: 'clamp(0.8125rem, 0.95vw, 0.9375rem)' }}>
                Hi {name.split(' ')[0]} 👋
              </span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#8BE196]/10 border border-[#8BE196]/30 rounded-full">
                <Star className="w-2.5 h-2.5 text-[#8BE196] fill-[#8BE196]" />
                <span className="text-[#8BE196] font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>{rating.toFixed(2)}</span>
              </div>
            </div>

            {totalRequests > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[#C4C4C4]/80 font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>
                  <span className="text-[#8BE196] font-semibold">{totalRequests}</span>{' '}
                  new {totalRequests === 1 ? 'request' : 'requests'}
                </p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-2.5 h-2.5 text-[#8BE196]" />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[#C4C4C4]/50 uppercase tracking-wider mb-0.5 font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
              Total Revenue
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#8BE196]" />
              <span className="text-white font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(0.875rem, 1vw, 0.9375rem)' }}>
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
