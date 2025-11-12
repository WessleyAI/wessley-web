import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Sparkles, GitFork, ArrowUpRight } from 'lucide-react';
import { AIChatDialog } from './ai-chat-dialog';

interface DemandData {
  id: string;
  part: string;
  category: string;
  demand: 'Low' | 'Medium' | 'High' | 'Very High';
  avgPrice: string;
  priceRange: { min: number; max: number };
  weeklyViews: number;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  compatibility: number; // % compatibility with this vehicle
  partNumber?: string;
  specifications?: string;
  diagnosis?: string;
  installDifficulty?: string;
  installTime?: string;
  condition?: string;
  warranty?: string;
}

const demandConfig = {
  'Low': {
    color: 'text-[#808080]',
    bg: 'bg-[#808080]/20',
    border: 'border-[#808080]/30',
    icon: TrendingDown
  },
  'Medium': {
    color: 'text-[#ffa726]',
    bg: 'bg-[#ffa726]/20',
    border: 'border-[#ffa726]/30',
    icon: Minus
  },
  'High': {
    color: 'text-[#8BE196]',
    bg: 'bg-[#8BE196]/20',
    border: 'border-[#8BE196]/30',
    icon: TrendingUp
  },
  'Very High': {
    color: 'text-[#8BE196]',
    bg: 'bg-[#8BE196]/30',
    border: 'border-[#8BE196]/50',
    icon: ArrowUpRight
  },
};

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-[#8BE196]' },
  down: { icon: TrendingDown, color: 'text-[#ff6b6b]' },
  stable: { icon: Minus, color: 'text-[#808080]' },
};

interface MarketDemandTableProps {
  onListPart?: (part: string) => void;
}

export function MarketDemandTable({ onListPart = () => {} }: MarketDemandTableProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string>('');
  
  const demandData: DemandData[] = [
    {
      id: '1',
      part: 'Alternator',
      category: 'Electrical',
      demand: 'Very High',
      avgPrice: '$150',
      priceRange: { min: 120, max: 180 },
      weeklyViews: 284,
      trend: 'up',
      trendPercent: 12,
      compatibility: 98,
      partNumber: 'BOSCH AL0829X',
      specifications: '90A 12V • CW Rotation • 1-Wire',
      diagnosis: 'AI detected: Strong demand for 2000-2003 models, 284 weekly searches',
      installDifficulty: 'Medium',
      installTime: '1-2 hours',
      condition: 'New (OE Quality)',
      warranty: '2 Years / 24,000 mi',
    },
    {
      id: '2',
      part: 'Fuel Pump',
      category: 'Fuel System',
      demand: 'High',
      avgPrice: '$112',
      priceRange: { min: 85, max: 140 },
      weeklyViews: 197,
      trend: 'up',
      trendPercent: 8,
      compatibility: 95,
      partNumber: 'AIRTEX E2237',
      specifications: 'In-Tank Electric • 40-50 PSI • 38 GPH Flow Rate',
      diagnosis: 'AI detected: High demand, 197 weekly views, common failure part for this model',
      installDifficulty: 'Hard',
      installTime: '2-3 hours',
      condition: 'New (Aftermarket)',
      warranty: '1 Year / 12,000 mi',
    },
    {
      id: '3',
      part: 'Radiator',
      category: 'Cooling',
      demand: 'High',
      avgPrice: '$130',
      priceRange: { min: 95, max: 165 },
      weeklyViews: 156,
      trend: 'stable',
      trendPercent: 0,
      compatibility: 92,
      partNumber: 'DENSO 221-9211',
      specifications: '2-Row Aluminum Core • 13.5" H x 21" W • Plastic Tanks',
      diagnosis: 'AI detected: Consistent demand, 156 weekly views, fits 2000-2003 Galloper 3.0L',
      installDifficulty: 'Hard',
      installTime: '3-4 hours',
      condition: 'New (Aftermarket)',
      warranty: '1 Year / 12,000 mi',
    },
    {
      id: '4',
      part: 'Brake Caliper',
      category: 'Braking',
      demand: 'Medium',
      avgPrice: '$68',
      priceRange: { min: 45, max: 90 },
      weeklyViews: 89,
      trend: 'up',
      trendPercent: 5,
      compatibility: 100,
      partNumber: 'CARDONE 18-4305',
      specifications: 'Front Right • Remanufactured • Single Piston',
      diagnosis: 'AI detected: Growing demand (+5%), 89 weekly views, direct bolt-on fit',
      installDifficulty: 'Medium',
      installTime: '1-1.5 hours',
      condition: 'Remanufactured (OE)',
      warranty: 'Lifetime',
    },
    {
      id: '5',
      part: 'Door Handle',
      category: 'Body',
      demand: 'Medium',
      avgPrice: '$35',
      priceRange: { min: 25, max: 45 },
      weeklyViews: 67,
      trend: 'down',
      trendPercent: -3,
      compatibility: 88,
      partNumber: 'DORMAN 80576',
      specifications: 'Front Left • Exterior • Chrome Finish',
      diagnosis: 'AI detected: Moderate demand, 67 weekly views, minor fitment variance on some trims',
      installDifficulty: 'Easy',
      installTime: '20-30 minutes',
      condition: 'New (Aftermarket)',
      warranty: '90 Days',
    },
    {
      id: '6',
      part: 'Headlight Assembly',
      category: 'Lighting',
      demand: 'Low',
      avgPrice: '$85',
      priceRange: { min: 60, max: 110 },
      weeklyViews: 34,
      trend: 'stable',
      trendPercent: 0,
      compatibility: 75,
      partNumber: 'TYC 20-5726-00',
      specifications: 'Left (Driver) Side • DOT/SAE Compliant • Clear Lens',
      diagnosis: 'AI detected: Lower demand, 34 weekly views, some incompatibility with Euro-spec models',
      installDifficulty: 'Easy',
      installTime: '30-45 minutes',
      condition: 'New (Aftermarket)',
      warranty: '1 Year',
    },
  ];

  const handleAskAI = (partName: string) => {
    setSelectedPart(partName);
    setChatOpen(true);
  };

  return (
    <>
      <div className="rounded-xl border border-[#808080]/30 overflow-hidden bg-[#161616]/50 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#808080]/30 hover:bg-transparent">
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Part</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Category</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider text-center font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Demand</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider text-right font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Market Price</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider text-center font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Weekly Views</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider text-center font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Trend</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider text-center font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Match</TableHead>
              <TableHead className="text-[#C4C4C4]/80 uppercase tracking-wider text-right font-['DM_Sans']" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {demandData.map((item, index) => {
              const config = demandConfig[item.demand];
              const trendStyle = trendConfig[item.trend];
              const TrendIcon = trendStyle.icon;
              
              return (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border-b border-[#808080]/20 hover:bg-[#1a1a1a]/50 transition-colors group"
                >
                  {/* Part Name */}
                  <TableCell className="text-white font-['DM_Sans']" style={{ fontSize: 'clamp(0.8125rem, 0.9vw, 0.875rem)' }}>
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0 rgba(139, 225, 150, 0)',
                            '0 0 8px rgba(139, 225, 150, 0.3)',
                            '0 0 0 rgba(139, 225, 150, 0)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="w-2 h-2 rounded-full bg-[#8BE196]"
                      />
                      <span>{item.part}</span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="text-[#C4C4C4]/70 font-['DM_Sans']" style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.8125rem)' }}>
                    {item.category}
                  </TableCell>

                  {/* Demand Badge */}
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`${config.bg} ${config.color} ${config.border} font-['DM_Sans']`}
                      style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}
                    >
                      {item.demand}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-white font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(0.8125rem, 0.9vw, 0.875rem)' }}>{item.avgPrice}</span>
                      <span className="text-[#C4C4C4]/50 font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>
                        ${item.priceRange.min}-${item.priceRange.max}
                      </span>
                    </div>
                  </TableCell>

                  {/* Weekly Views */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-white font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(0.8125rem, 0.9vw, 0.875rem)' }}>{item.weeklyViews}</span>
                      <span className="text-[#C4C4C4]/50 font-['DM_Sans']" style={{ fontSize: 'clamp(0.625rem, 0.75vw, 0.6875rem)' }}>views</span>
                    </div>
                  </TableCell>

                  {/* Trend */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendIcon className={`w-3.5 h-3.5 ${trendStyle.color}`} />
                      {item.trendPercent !== 0 && (
                        <span className={`${trendStyle.color} font-['DM_Sans'] font-semibold`} style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>
                          {item.trendPercent > 0 ? '+' : ''}{item.trendPercent}%
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Compatibility Match */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 h-1.5 bg-[#808080]/30 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.compatibility}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-[#8BE196]"
                        />
                      </div>
                      <span className="text-[#8BE196] font-['DM_Sans'] font-semibold" style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}>{item.compatibility}%</span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAskAI(item.part)}
                        className="text-[#8BE196] hover:text-white hover:bg-[#8BE196]/20 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ask AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onListPart(item.part)}
                        className="bg-[#8BE196] hover:bg-[#9DF4A8] text-[#000000] h-7 px-3 font-semibold font-['DM_Sans']"
                        style={{ fontSize: 'clamp(0.6875rem, 0.8vw, 0.75rem)' }}
                      >
                        List Part
                      </Button>
                    </div>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* AI Insights Footer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-4 flex items-center gap-2 px-4 py-3 bg-[#161616]/50 backdrop-blur border border-[#808080]/30 rounded-xl"
      >
        <motion.div
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-[#8BE196]" />
        </motion.div>
        <p className="text-[#C4C4C4]/70 font-['DM_Sans']" style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.8125rem)' }}>
          <span className="text-[#8BE196] font-semibold">Wessley analyzed</span> 2,847 recent sales for your {' '}
          <span className="text-white font-semibold">2000 Hyundai Galloper</span>
        </p>
      </motion.div>

      <AIChatDialog 
        open={chatOpen} 
        onOpenChange={setChatOpen}
        partName={selectedPart}
        context="sell"
      />
    </>
  );
}
