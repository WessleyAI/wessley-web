import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Star, MapPin, Truck, Shield, Clock, TrendingUp, Package, ArrowRight, ShoppingCart, MessageSquare, Zap, Cable, Waves, Disc, Droplet, Flame } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

// Placeholder icon - can be replaced with actual Wessley icon later
const wessleyIcon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiA3TDEyIDEyTDIyIDdMMTIgMloiIHN0cm9rZT0iIzlEN0I1MiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0yIDE3TDEyIDIyTDIyIDE3IiBzdHJva2U9IiM5RDdCNTIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8cGF0aCBkPSJNMiAxMkwxMiAxN0wyMiAxMiIgc3Ryb2tlPSIjOUQ3QjUyIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg==';

type UrgencyLevel = 'urgent' | 'soon' | 'optional';

interface RestorationSupply {
  name: string;
  price: number;
  selected?: boolean;
}

interface Seller {
  id: string;
  name: string;
  initials: string;
  rating: number;
  reviews: number;
  distance: string;
  distanceMiles: number;
  price: number;
  stock: number;
  shippingTime: string;
  verified: boolean;
  responseTime: string;
  restorationSupplies?: RestorationSupply[];
}

interface PartDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  partName: string;
  partImage?: string;
  urgency: UrgencyLevel;
  priceRange: string;
  sellers: Seller[];
  aiVerified: boolean;
  onAddToCart: (sellerId: string) => void;
  onCompare: () => void;
  onContactSeller: (sellerId: string) => void;
}

const urgencyConfig = {
  urgent: { color: '#EF4444', label: 'URGENT', dot: '🔴', description: 'Critical - needs immediate attention' },
  soon: { color: '#F59E0B', label: 'SOON', dot: '🟡', description: 'Important - plan to replace within 2 weeks' },
  optional: { color: '#6B7280', label: 'OPTIONAL', dot: '⚪', description: 'Nice to have - not critical for operation' },
};

const getPartIcon = (partName: string) => {
  const name = partName.toLowerCase();
  if (name.includes('alternator')) return Zap;
  if (name.includes('relay') || name.includes('fuel')) return Cable;
  if (name.includes('radiator')) return Waves;
  if (name.includes('brake')) return Disc;
  if (name.includes('oil')) return Droplet;
  if (name.includes('spark')) return Flame;
  return Package;
};

export function PartDetailsDialog({
  isOpen,
  onClose,
  partName,
  partImage,
  urgency,
  priceRange,
  sellers,
  aiVerified,
  onAddToCart,
  onCompare,
  onContactSeller,
}: PartDetailsDialogProps) {
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [selectedSupplies, setSelectedSupplies] = useState<Record<string, Set<number>>>({});

  const PartIcon = getPartIcon(partName);
  const sortedSellers = [...sellers].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedSellers[0]?.price || 0;

  const toggleSupply = (sellerId: string, supplyIndex: number) => {
    setSelectedSupplies(prev => {
      const sellerSupplies = new Set(prev[sellerId] || []);
      if (sellerSupplies.has(supplyIndex)) {
        sellerSupplies.delete(supplyIndex);
      } else {
        sellerSupplies.add(supplyIndex);
      }
      return { ...prev, [sellerId]: sellerSupplies };
    });
  };

  const getSuppliesTotal = (seller: Seller) => {
    if (!seller.restorationSupplies) return 0;
    const selected = selectedSupplies[seller.id] || new Set();
    return seller.restorationSupplies.reduce((sum, supply, idx) => {
      return selected.has(idx) ? sum + supply.price : sum;
    }, 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl bg-gradient-to-br from-[#161616] via-[#121212] to-[#1a1a1a] border-[#808080]/30 text-white p-0 gap-0 max-h-[90vh]">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#808080]/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#161616]/80 backdrop-blur-sm border border-[#808080]/50 rounded-lg p-2">
                  <PartIcon className="w-6 h-6 text-[#8BE196]" />
                </div>
                <div className="flex-1">
                  <DialogTitle className="text-2xl text-white mb-1 font-['DM_Sans']">{partName}</DialogTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className="border-0 flex items-center gap-1.5 text-xs px-2 py-1 font-['DM_Sans']"
                      style={{
                        backgroundColor: `${urgencyConfig[urgency].color}20`,
                        color: urgencyConfig[urgency].color,
                      }}
                    >
                      <span>{urgencyConfig[urgency].dot}</span>
                      <span>{urgencyConfig[urgency].label}</span>
                    </Badge>
                    {aiVerified && (
                      <Badge className="bg-[#8BE196]/20 text-[#8BE196] border-[#8BE196]/30 flex items-center gap-1 text-xs font-['DM_Sans']">
                        <ImageWithFallback src={wessleyIcon} alt="AI" className="w-3 h-3" />
                        AI Verified
                      </Badge>
                    )}
                    <span className="text-[#C4C4C4] text-sm font-['DM_Sans']">{priceRange}</span>
                  </div>
                </div>
              </div>
              <p className="text-[#C4C4C4]/70 text-sm font-['DM_Sans']">{urgencyConfig[urgency].description}</p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 px-6 py-4 max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
            {/* Left Column - Part Image & Info */}
            <div className="lg:col-span-1">
              <Card className="bg-[#1a1a1a]/60 border-[#808080]/50 p-4 mb-4">
                {partImage && (
                  <div className="relative rounded-lg overflow-hidden mb-4 aspect-square bg-[#161616]/40">
                    <ImageWithFallback
                      src={partImage}
                      alt={partName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/80 to-transparent" />
                  </div>
                )}

                <h3 className="text-white text-sm mb-2.5 flex items-center gap-2 font-['DM_Sans']">
                  <TrendingUp className="w-3.5 h-3.5 text-[#8BE196]" />
                  Market Insights
                </h3>
                <div className="space-y-1.5 text-xs font-['DM_Sans']">
                  <div className="flex justify-between">
                    <span className="text-[#C4C4C4]/70">Available Sellers</span>
                    <span className="text-white">{sellers.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C4C4C4]/70">Best Price</span>
                    <span className="text-[#8BE196]">${lowestPrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C4C4C4]/70">Avg. Response</span>
                    <span className="text-white">~2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#C4C4C4]/70">Stock Level</span>
                    <span className="text-[#8BE196]">High</span>
                  </div>
                </div>
              </Card>

              <Button
                onClick={onCompare}
                variant="outline"
                size="sm"
                className="w-full bg-[#8BE196]/10 border-[#8BE196]/30 text-white hover:bg-[#8BE196]/20 hover:text-[#8BE196] h-8 text-xs font-['DM_Sans']"
              >
                Compare All Sellers
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </div>

            {/* Right Column - Sellers List */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white text-sm font-['DM_Sans']">Available from {sellers.length} sellers</h3>
                <div className="flex items-center gap-1.5 text-xs text-[#C4C4C4]/70 font-['DM_Sans']">
                  <MapPin className="w-3 h-3" />
                  Sorted by distance
                </div>
              </div>

              <ScrollArea className="max-h-[calc(90vh-240px)] pr-4">
                <div className="space-y-2.5">
                  {sortedSellers.map((seller, index) => {
                    const suppliesTotal = getSuppliesTotal(seller);
                    const totalPrice = seller.price + suppliesTotal;
                    const savings = seller.price - lowestPrice;

                    return (
                      <motion.div
                        key={seller.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                      <Card
                        className={`bg-gradient-to-br from-[#161616]/80 to-[#1a1a1a]/60 border-[#808080]/50 p-3 hover:border-[#8BE196]/50 transition-all cursor-pointer ${
                          selectedSeller === seller.id ? 'ring-2 ring-[#8BE196] border-[#8BE196]' : ''
                        }`}
                        onClick={() => setSelectedSeller(seller.id)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Seller Info */}
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarFallback className="bg-[#8BE196] text-[#000000] text-xs font-['DM_Sans'] font-semibold">
                              {seller.initials}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div>
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <h4 className="text-white text-sm font-['DM_Sans']">{seller.name}</h4>
                                  {seller.verified && (
                                    <Shield className="w-3 h-3 text-[#8BE196]" />
                                  )}
                                  {index === 0 && (
                                    <Badge className="bg-[#8BE196]/20 text-[#8BE196] border-0 text-[10px] px-1.5 py-0 font-['DM_Sans']">
                                      Best Price
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-[#C4C4C4]/70 font-['DM_Sans']">
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-[#8BE196] text-[#8BE196]" />
                                    {seller.rating.toFixed(1)} ({seller.reviews})
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <MapPin className="w-2.5 h-2.5" />
                                    {seller.distance}
                                  </span>
                                  <span className="flex items-center gap-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    {seller.responseTime}
                                  </span>
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0">
                                <div className="text-lg text-[#8BE196] font-['DM_Sans'] font-semibold">
                                  ${totalPrice.toFixed(0)}
                                </div>
                                {savings > 0 && (
                                  <div className="text-[9px] text-[#EF4444] font-['DM_Sans']">
                                    +${savings.toFixed(0)} vs best
                                  </div>
                                )}
                                {savings === 0 && (
                                  <div className="text-[9px] text-[#8BE196] font-['DM_Sans']">
                                    Lowest price
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-2">
                              <div className="flex items-center gap-1.5 text-[10px] font-['DM_Sans']">
                                <Package className="w-3 h-3 text-[#8BE196]" />
                                <span className="text-[#C4C4C4]/70">
                                  {seller.stock} in stock
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] font-['DM_Sans']">
                                <Truck className="w-3 h-3 text-[#8BE196]" />
                                <span className="text-[#C4C4C4]/70">
                                  {seller.shippingTime}
                                </span>
                              </div>
                              <div className="text-[10px] text-[#C4C4C4]/70 font-['DM_Sans']">
                                {seller.distanceMiles.toFixed(0)} miles away
                              </div>
                            </div>

                            {/* Restoration Supplies */}
                            {seller.restorationSupplies && seller.restorationSupplies.length > 0 && (
                              <div className="bg-[#1a1a1a]/60 backdrop-blur-sm border border-[#808080]/30 rounded-lg p-2 mb-2">
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <Package className="w-3 h-3 text-[#8BE196]" />
                                  <span className="text-[#8BE196] text-[10px] font-['DM_Sans']">
                                    Optional restoration supplies:
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {seller.restorationSupplies.map((supply, idx) => {
                                    const isSelected = selectedSupplies[seller.id]?.has(idx);
                                    return (
                                      <button
                                        key={idx}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleSupply(seller.id, idx);
                                        }}
                                        className={`px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all text-[10px] font-['DM_Sans'] ${
                                          isSelected
                                            ? 'bg-[#8BE196]/20 text-[#8BE196] border-[#8BE196]/40 hover:bg-[#8BE196]/30'
                                            : 'bg-[#161616]/80 text-[#C4C4C4]/50 border-[#808080]/40 hover:bg-[#161616]'
                                        }`}
                                      >
                                        <span className={isSelected ? '' : 'line-through'}>{supply.name}</span>
                                        <span>${supply.price.toFixed(0)}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onAddToCart(seller.id);
                                }}
                                className="flex-1 bg-[#8BE196]/20 text-white hover:bg-[#8BE196]/30 hover:text-[#8BE196] border border-[#8BE196]/30 h-7 text-[10px] font-['DM_Sans']"
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add to Cart
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onContactSeller(seller.id);
                                }}
                                className="bg-[#8BE196]/10 text-white hover:bg-[#8BE196]/20 hover:text-[#8BE196] border-[#8BE196]/30 h-7 text-[10px] px-2 font-['DM_Sans']"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Contact
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
