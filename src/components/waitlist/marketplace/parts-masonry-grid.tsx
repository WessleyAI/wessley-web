import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Star, MapPin, ArrowRight, GitFork, Zap, Cable, Waves, Disc, Droplet, Flame, ShoppingCart, Package, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PartDetailsDialog } from './part-details-dialog';
import { toast } from 'sonner';
import Image from 'next/image';

type UrgencyLevel = 'urgent' | 'soon' | 'optional';
type Priority = 'high' | 'medium' | 'low';

interface RestorationSupply {
  name: string;
  price: number;
  selected?: boolean;
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
}

interface PartsMasonryGridProps {
  parts: Part[];
  onPartsChange: (parts: Part[]) => void;
  onCompare: (partName: string) => void;
  selectedItems?: Set<string>;
  onToggleItem?: (itemId: string) => void;
  hoveredDiagnosis?: string | null;
}

// Part Card Component with Drag
function PartCard({ part, isSelected, onSelect, onCompare, urgencyConfig, getPartIcon, getGridClass, isDragging, onToggleSupply, onAddToCart, isHighlighted, isDimmed }: any) {
  const PartIcon = getPartIcon(part.name);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  
  // Calculate supplies total
  const suppliesTotal = part.restorationSupplies?.reduce((sum: number, supply: RestorationSupply) => {
    return supply.selected !== false ? sum + supply.price : sum;
  }, 0) || 0;

  const handleCardClick = () => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // First click - wait to see if there's a second click
      clickTimerRef.current = setTimeout(() => {
        // Single click - add to cart
        onAddToCart(part.id);
        clickCountRef.current = 0;
      }, 250);
    } else if (clickCountRef.current === 2) {
      // Second click detected - this is a double click
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
      onSelect(); // Open dialog
      clickCountRef.current = 0;
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }
    };
  }, []);

  return (
    <Reorder.Item
      value={part}
      id={part.id}
      className={`${getGridClass(part.priority)} cursor-grab active:cursor-grabbing w-full`}
      drag
      dragListener={true}
      dragControls={undefined}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 3,
        zIndex: 50,
        boxShadow: '0 0 40px rgba(181, 228, 211, 0.6)',
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        duration: 0.3
      }}
      layout
    >
      <motion.div
        whileHover={{ 
          scale: 1.02,
        }}
        transition={{ duration: 0.2 }}
        className="h-full w-full"
        onClick={handleCardClick}
        onPointerDown={(e) => {
          // Check if clicking on a button
          const target = e.target as HTMLElement;
          if (target.closest('button')) {
            e.stopPropagation();
          }
        }}
      >
        <Card className={`h-full w-full bg-gradient-to-br from-[#3D3541] via-[#39333D] to-[#2E3135] border-[#564B5C] shadow-lg hover:border-[#B5E4D3]/50 hover:shadow-[0_0_20px_rgba(181,228,211,0.3)] transition-all overflow-hidden relative rounded-xl ${
          isSelected ? 'ring-2 ring-[#B5E4D3] shadow-[0_0_20px_rgba(181,228,211,0.5)]' : ''
        } ${
          isHighlighted ? 'ring-2 ring-[#9D7B52] shadow-[0_0_30px_rgba(157,123,82,0.6)] scale-[1.02] z-20' : ''
        } ${
          isDimmed ? 'opacity-30' : ''
        }`}>
          {/* Subtle texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L3N2Zz4=')]" />
          
          {/* Accent gradient glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9D7B52]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#B5E4D3]/5 rounded-full blur-2xl" />
          
          {/* Part Image Background */}
          {part.imageUrl && (
            <div className="absolute inset-0 opacity-15">
              <img
                src={part.imageUrl}
                alt={part.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#3D3541]/95 via-[#3D3541]/85 to-[#2E3135]/90" />
            </div>
          )}
          
          <div className={`p-2 h-full flex flex-col relative z-10 ${part.priority === 'high' ? 'p-2.5' : ''}`}>
            {/* Part Icon - Top Right */}
            <div className="absolute top-2 right-2 z-20">
              <div className="bg-[#3D3541]/80 backdrop-blur-sm border border-[#564B5C]/50 rounded-lg p-1">
                <PartIcon className={`${part.priority === 'high' ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-[#9D7B52]`} />
              </div>
            </div>

            {/* Header Section */}
            <div className="flex flex-col gap-1 mb-1.5 pr-9">
              {/* Urgency Badge */}
              <Badge 
                variant="outline"
                className={`w-fit border-0 flex items-center gap-1 opacity-90 ${
                  part.priority === 'high' ? 'text-[9px] px-1.5 py-0.5' : 'text-[8px] px-1 py-0.5'
                }`}
                style={{ 
                  backgroundColor: `${urgencyConfig[part.urgency].color}20`,
                  color: urgencyConfig[part.urgency].color,
                }}
              >
                <span>{urgencyConfig[part.urgency].dot}</span>
                <span className="tracking-wider">{urgencyConfig[part.urgency].label}</span>
              </Badge>

              {/* Part Name */}
              <div className="flex items-start gap-1.5 flex-wrap">
                <h3 className={`text-white break-words flex-1 min-w-0 ${part.priority === 'high' ? 'text-sm' : 'text-xs'}`}>
                  {part.name}
                </h3>
              </div>

              {/* Price Range */}
              <p className={`text-[#C5B8CC] opacity-60 ${part.priority === 'high' ? 'text-[10px]' : 'text-[9px]'}`}>
                {part.priceRange}
              </p>
            </div>

            {/* Seller Section */}
            <div className={`flex items-start gap-1.5 mb-1.5 ${part.priority === 'high' && !part.restorationSupplies ? 'flex-1' : ''}`}>
              <Avatar className={`flex-shrink-0 ${part.priority === 'high' ? 'h-7 w-7' : 'h-6 w-6'}`}>
                <AvatarFallback className={`bg-[#9D7B52] text-white ${part.priority === 'high' ? 'text-[10px]' : 'text-[9px]'}`}>
                  {part.sellerInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className={`text-[#C5B8CC] opacity-85 break-words leading-tight ${part.priority === 'high' ? 'text-xs' : 'text-[10px]'}`}>
                  {part.sellerName}
                </p>
                <div className={`flex items-center gap-1 text-[#C5B8CC] opacity-70 flex-wrap mt-0.5 ${part.priority === 'high' ? 'text-[10px]' : 'text-[9px]'}`}>
                  <span className="flex items-center gap-0.5 whitespace-nowrap">
                    <Star className={`${part.priority === 'high' ? 'w-2.5 h-2.5' : 'w-2 h-2'} fill-[#9D7B52] text-[#9D7B52] flex-shrink-0`} />
                    {part.sellerRating}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 whitespace-nowrap">
                    <MapPin className={`${part.priority === 'high' ? 'w-2.5 h-2.5' : 'w-2 h-2'} flex-shrink-0`} />
                    {part.sellerDistance}
                  </span>
                </div>
              </div>
            </div>

            {/* Restoration Supplies Section */}
            {part.restorationSupplies && part.restorationSupplies.length > 0 && (
              <div className={`mb-1.5 ${part.priority === 'high' ? 'flex-1' : ''}`}>
                <div className="bg-[#2E3135]/60 backdrop-blur-sm border border-[#564B5C]/30 rounded-lg p-1.5">
                  <div className="flex items-center gap-1 mb-1">
                    <Package className={`${part.priority === 'high' ? 'w-3 h-3' : 'w-2.5 h-2.5'} text-[#B5E4D3] flex-shrink-0`} />
                    <span className={`text-[#B5E4D3] ${part.priority === 'high' ? 'text-[9px]' : 'text-[8px]'}`}>
                      including restoration supplies:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-0.5">
                    {part.restorationSupplies.map((supply: RestorationSupply, idx: number) => {
                      const isSelected = supply.selected !== false;
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSupply(part.id, idx);
                          }}
                          className={`px-1 py-0.5 rounded border flex items-center gap-0.5 transition-all cursor-pointer ${
                            part.priority === 'high' ? 'text-[8px]' : 'text-[7px]'
                          } ${
                            isSelected
                              ? 'bg-[#B5E4D3]/20 text-[#B5E4D3] border-[#B5E4D3]/40 hover:bg-[#B5E4D3]/30'
                              : 'bg-[#3D3541]/80 text-[#C5B8CC]/50 border-[#564B5C]/40 hover:bg-[#3D3541]'
                          }`}
                        >
                          <span className={isSelected ? '' : 'line-through'}>{supply.name}</span>
                          <span className={isSelected ? 'text-[#B5E4D3]' : 'text-[#C5B8CC]/50'}>${supply.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Action Section */}
            <div className={`flex items-center justify-between gap-1.5 pt-1.5 border-t border-[#564B5C] mt-auto ${part.priority === 'high' ? 'pt-2' : ''}`}>
              <div className={`flex-shrink-0 ${part.priority === 'high' ? 'text-base' : 'text-xs'}`}>
                <span className="text-[#B5E4D3]">{part.topPrice}</span>
                {suppliesTotal > 0 && (
                  <span className="text-[#C5B8CC] opacity-70 ml-1">
                    + ${suppliesTotal}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`text-white bg-[#B5E4D3]/20 hover:text-[#B5E4D3] hover:bg-transparent p-0 flex-shrink-0 cursor-pointer ${
                    part.priority === 'high' 
                      ? 'h-6 w-6' 
                      : 'h-5 w-5'
                  }`}
                >
                  <GitFork className={`${part.priority === 'high' ? 'w-3 h-3' : 'w-2.5 h-2.5'} rotate-90`} />
                </Button>
                <Button
                  size="sm"
                  variant={part.priority === 'high' ? 'outline' : 'ghost'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCompare(part.name);
                  }}
                  className={`text-white bg-[#B5E4D3]/10 hover:text-[#B5E4D3] hover:bg-transparent whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    part.priority === 'high' 
                      ? 'border-[#B5E4D3]/30 h-7 px-2.5 text-[10px]' 
                      : 'h-5 px-1.5 text-[9px]'
                  }`}
                >
                  {part.priority === 'high' ? 'Compare' : `+${part.sellerCount - 1}`}
                  {part.priority === 'high' && <ArrowRight className="w-2.5 h-2.5 ml-0.5 flex-shrink-0" />}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Reorder.Item>
  );
}

export function PartsMasonryGrid({ 
  parts,
  onPartsChange,
  onCompare,
  selectedItems = new Set(),
  onToggleItem,
  hoveredDiagnosis = null,
}: PartsMasonryGridProps) {
  const [selectedPartForDetails, setSelectedPartForDetails] = useState<Part | null>(null);
  const [showScrollTip, setShowScrollTip] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Map diagnosis to part IDs
  const diagnosisToPartIds: { [key: string]: string[] } = {
    'overheating': ['3'], // Radiator
    'charging issues': ['1'], // Alternator
    'brake wear': ['4'], // Brake Pads
    'stuff you asked to add': ['2', '5', '6'], // Fuel Relay, Oil Filter, Spark Plugs
  };

  const urgencyConfig = {
    urgent: { color: '#EF4444', label: 'URGENT', dot: '🔴' },
    soon: { color: '#F59E0B', label: 'SOON', dot: '🟡' },
    optional: { color: '#6B7280', label: 'OPTIONAL', dot: '⚪' },
  };

  const togglePartSelection = (partId: string) => {
    if (onToggleItem) {
      onToggleItem(partId);
    }
  };

  // Generate mock sellers for a part
  const generateSellersForPart = (part: Part) => {
    const basePrice = parseFloat(part.topPrice.replace('$', ''));
    const sellerNames = [
      { name: part.sellerName, initials: part.sellerInitials },
      { name: 'AutoParts Pro', initials: 'AP' },
      { name: 'Classic Car Supply', initials: 'CS' },
      { name: 'Restoration Depot', initials: 'RD' },
      { name: 'Vintage Motors', initials: 'VM' },
    ];

    return sellerNames.map((seller, idx) => ({
      id: `seller-${idx}`,
      name: seller.name,
      initials: seller.initials,
      rating: idx === 0 ? part.sellerRating : (4.2 + Math.random() * 0.7),
      reviews: Math.floor(Math.random() * 200) + 50,
      distance: idx === 0 ? part.sellerDistance : `${Math.floor(Math.random() * 100) + 10} mi`,
      distanceMiles: idx === 0 ? parseFloat(part.sellerDistance) : Math.floor(Math.random() * 100) + 10,
      price: idx === 0 ? basePrice : basePrice + (Math.random() * 50 - 10),
      stock: Math.floor(Math.random() * 10) + 1,
      shippingTime: idx < 2 ? '1-2 days' : '3-5 days',
      verified: idx < 3,
      responseTime: idx === 0 ? '< 1 hour' : `${Math.floor(Math.random() * 5) + 1} hours`,
      restorationSupplies: idx === 0 && part.restorationSupplies ? part.restorationSupplies : undefined,
    }));
  };

  const handlePartClick = (part: Part) => {
    setSelectedPartForDetails(part);
  };

  const handleAddToCart = (sellerId: string) => {
    toast.success('Added to cart', {
      description: 'Part has been added to your cart',
    });
  };

  const handleContactSeller = (sellerId: string) => {
    toast.success('Opening chat', {
      description: 'Starting conversation with seller',
    });
  };

  const toggleSupplySelection = (partId: string, supplyIndex: number) => {
    const updatedParts = parts.map(part => {
      if (part.id === partId && part.restorationSupplies) {
        const updatedSupplies = [...part.restorationSupplies];
        updatedSupplies[supplyIndex] = {
          ...updatedSupplies[supplyIndex],
          selected: !updatedSupplies[supplyIndex].selected
        };
        return { ...part, restorationSupplies: updatedSupplies };
      }
      return part;
    });
    onPartsChange(updatedParts);
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

  const getGridClass = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return 'col-span-2 row-span-2 min-h-[240px]'; // Medium-large: 2x2
      case 'medium':
        return 'col-span-1 row-span-2 min-h-[240px]'; // Tall: 1x2
      default:
        return 'col-span-1 row-span-1 min-h-[150px]'; // Small: 1x1
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    if (target.scrollTop > 10 && !hasScrolled) {
      setHasScrolled(true);
      setShowScrollTip(false);
    }
  };

  // Auto-hide scroll tip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowScrollTip(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative h-full flex flex-col overflow-visible">
      <ScrollArea className="flex-1 h-full" onScrollCapture={handleScroll}>
        <div className="px-8 pb-8 pt-6">
          <Reorder.Group 
            axis="x" 
            values={parts} 
            onReorder={onPartsChange}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 auto-rows-[120px] gap-6"
            style={{ overflow: 'visible' }}
          >
          {parts.map((part) => {
            const relatedPartIds = hoveredDiagnosis ? diagnosisToPartIds[hoveredDiagnosis] || [] : [];
            const isHighlighted = hoveredDiagnosis && relatedPartIds.includes(part.id);
            const isDimmed = hoveredDiagnosis && !relatedPartIds.includes(part.id);
            
            return (
              <PartCard
                key={part.id}
                part={part}
                isSelected={selectedItems.has(part.id)}
                onSelect={() => handlePartClick(part)}
                onCompare={onCompare}
                onToggleSupply={toggleSupplySelection}
                onAddToCart={(partId: string) => {
                  if (onToggleItem) {
                    onToggleItem(partId);
                    toast.success('Added to cart', {
                      description: `${part.name} added to your cart`,
                    });
                  }
                }}
                urgencyConfig={urgencyConfig}
                getPartIcon={getPartIcon}
                getGridClass={getGridClass}
                isHighlighted={isHighlighted}
                isDimmed={isDimmed}
              />
            );
          })}
          </Reorder.Group>
        </div>
      </ScrollArea>

      {/* Scroll Tip */}
      <AnimatePresence>
        {showScrollTip && parts.length > 4 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none"
          >
            <div className="bg-[#3D3541]/95 backdrop-blur-sm border border-[#B5E4D3]/30 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2">
              <span className="text-[10px] text-[#B5E4D3]">Scroll for more parts</span>
              <motion.div
                animate={{ y: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-3 h-3 text-[#B5E4D3]" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Part Details Dialog */}
      {selectedPartForDetails && (
        <PartDetailsDialog
          isOpen={true}
          onClose={() => setSelectedPartForDetails(null)}
          partName={selectedPartForDetails.name}
          partImage={selectedPartForDetails.imageUrl}
          urgency={selectedPartForDetails.urgency}
          priceRange={selectedPartForDetails.priceRange}
          sellers={generateSellersForPart(selectedPartForDetails)}
          aiVerified={selectedPartForDetails.aiVerified}
          onAddToCart={handleAddToCart}
          onCompare={() => onCompare(selectedPartForDetails.name)}
          onContactSeller={handleContactSeller}
        />
      )}
    </div>
  );
}
