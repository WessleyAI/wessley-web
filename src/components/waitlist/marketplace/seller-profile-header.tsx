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
      className="bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] border border-[#564B5C]/40 rounded-lg p-2.5 shadow-lg relative overflow-hidden"
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#9D7B52] via-[#B5E4D3] to-[#9D7B52]" />
      
      <div className="flex items-center justify-between">
        {/* Profile Section */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8 border border-[#9D7B52]/30">
            <AvatarImage src="" alt={name} />
            <AvatarFallback className="bg-gradient-to-br from-[#9D7B52] to-[#8A6A48] text-white text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-white">
                Hi {name.split(' ')[0]} 👋
              </span>
              <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#B5E4D3]/10 border border-[#B5E4D3]/30 rounded-full">
                <Star className="w-2.5 h-2.5 text-[#B5E4D3] fill-[#B5E4D3]" />
                <span className="text-[10px] text-[#B5E4D3]">{rating.toFixed(1)}</span>
              </div>
            </div>
            
            {totalRequests > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-[10px] text-[#C5B8CC]/80">
                  <span className="text-[#B5E4D3]">{totalRequests}</span>{' '}
                  new {totalRequests === 1 ? 'request' : 'requests'}
                </p>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Bell className="w-2.5 h-2.5 text-[#9D7B52]" />
                </motion.div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] text-[#C5B8CC]/50 uppercase tracking-wider mb-0.5">
              Total Revenue
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-[#B5E4D3]" />
              <span className="text-sm text-white">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
