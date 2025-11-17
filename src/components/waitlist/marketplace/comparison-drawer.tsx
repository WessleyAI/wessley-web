import { motion } from 'framer-motion';
import { X, Star, MapPin, CheckCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Seller {
  id: string;
  name: string;
  initials: string;
  price: number;
  rating: number;
  distance: string;
  condition: 'New' | 'Like New' | 'Used';
  fit: 'Perfect' | 'Compatible';
  aiPreferred?: boolean;
  reviews: number;
}

interface ComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  partName: string;
}

export function ComparisonDrawer({ isOpen, onClose, partName }: ComparisonDrawerProps) {
  const sellers: Seller[] = [
    {
      id: '1',
      name: 'Auto Parts Pro',
      initials: 'AP',
      price: 145,
      rating: 4.9,
      distance: '2.3 mi',
      condition: 'New',
      fit: 'Perfect',
      aiPreferred: true,
      reviews: 234,
    },
    {
      id: '2',
      name: 'Mike Chen',
      initials: 'MC',
      price: 135,
      rating: 4.8,
      distance: '5.1 mi',
      condition: 'Like New',
      fit: 'Perfect',
      reviews: 142,
    },
    {
      id: '3',
      name: 'CarParts Hub',
      initials: 'CH',
      price: 165,
      rating: 5.0,
      distance: '1.8 mi',
      condition: 'New',
      fit: 'Compatible',
      reviews: 456,
    },
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="bg-[#1a1a1a] rounded-t-2xl w-full max-w-6xl max-h-[80vh] overflow-hidden shadow-2xl border-t border-[#8BE196]/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#808080]/30 flex items-center justify-between bg-[#161616]">
          <div>
            <h3 className="text-white font-['DM_Sans']">Compare Sellers</h3>
            <p className="text-[#C4C4C4]/70 text-sm mt-0.5 font-['DM_Sans']">
              {partName} • {sellers.length} matches • {sellers.reduce((sum, s) => sum + s.reviews, 0)} total reviews
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[#C4C4C4] hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-6">
          <div className="space-y-3">
            {sellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-[#161616] rounded-xl p-4 border transition-all hover:border-[#8BE196]/50 ${
                  seller.aiPreferred ? 'border-[#8BE196]/30 shadow-[0_0_20px_rgba(139,225,150,0.15)]' : 'border-[#808080]/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Seller Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[#8BE196] text-[#000000] font-['DM_Sans'] font-semibold">
                        {seller.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-['DM_Sans']">{seller.name}</span>
                        {seller.aiPreferred && (
                          <Badge className="bg-[#8BE196]/20 text-[#8BE196] border-0 text-xs font-['DM_Sans']">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            AI Preferred
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-[#C4C4C4]/70 font-['DM_Sans']">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-[#8BE196] text-[#8BE196]" />
                          {seller.rating} ({seller.reviews})
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {seller.distance}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex items-center gap-4 md:gap-6 flex-wrap md:flex-nowrap flex-shrink-0">
                    <div className="text-center">
                      <div className="text-xs text-[#C4C4C4]/70 mb-1 font-['DM_Sans']">Condition</div>
                      <Badge variant="outline" className="border-[#808080]/30 text-[#C4C4C4] font-['DM_Sans']">
                        {seller.condition}
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#C4C4C4]/70 mb-1 font-['DM_Sans']">Fit</div>
                      <Badge
                        variant="outline"
                        className={seller.fit === 'Perfect' ? 'border-[#8BE196]/50 text-[#8BE196] font-[\'DM_Sans\']' : 'border-[#808080]/30 text-[#C4C4C4] font-[\'DM_Sans\']'}
                      >
                        {seller.fit}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#C4C4C4]/70 mb-1 font-['DM_Sans']">Price</div>
                      <div className="text-[#8BE196] text-xl font-['DM_Sans'] font-semibold">${seller.price}</div>
                    </div>
                    <Button className="bg-[#8BE196] hover:bg-[#9DF4A8] text-[#000000] whitespace-nowrap font-['DM_Sans'] font-semibold">
                      Buy from This Seller
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Button variant="ghost" className="text-[#8BE196] hover:text-white hover:bg-[#8BE196]/10 font-['DM_Sans']">
              <TrendingUp className="w-4 h-4 mr-2" />
              Compare More Sellers
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
