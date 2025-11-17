import { motion } from 'framer-motion';
import { TrendingUp, MessageSquare, Star } from 'lucide-react';

export function SellerPerformanceCard() {
  const stats = [
    { label: 'Sales', value: '$1,240', icon: TrendingUp, color: '#8BE196' },
    { label: 'Response', value: '94%', icon: MessageSquare, color: '#8BE196' },
    { label: 'Rating', value: '4.8', icon: Star, color: '#8BE196' },
  ];

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
            className="bg-[#161616] border border-[#808080]/30 rounded-md p-1.5 text-center hover:border-[#8BE196]/50 transition-colors"
          >
            <Icon className="w-3 h-3 mx-auto mb-0.5" style={{ color: stat.color }} />
            <div className="text-white text-xs font-['DM_Sans'] font-semibold">{stat.value}</div>
            <div className="text-[#C4C4C4]/70 text-[9px] font-['DM_Sans']">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
