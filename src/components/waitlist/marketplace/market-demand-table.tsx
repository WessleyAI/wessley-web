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
}

const demandConfig = {
  'Low': { 
    color: 'text-gray-400', 
    bg: 'bg-gray-600/20', 
    border: 'border-gray-600/30',
    icon: TrendingDown 
  },
  'Medium': { 
    color: 'text-amber-400', 
    bg: 'bg-amber-600/20', 
    border: 'border-amber-600/30',
    icon: Minus 
  },
  'High': { 
    color: 'text-[#B5E4D3]', 
    bg: 'bg-[#B5E4D3]/20', 
    border: 'border-[#B5E4D3]/30',
    icon: TrendingUp 
  },
  'Very High': { 
    color: 'text-[#B5E4D3]', 
    bg: 'bg-[#B5E4D3]/30', 
    border: 'border-[#B5E4D3]/50',
    icon: ArrowUpRight 
  },
};

const trendConfig = {
  up: { icon: TrendingUp, color: 'text-[#B5E4D3]' },
  down: { icon: TrendingDown, color: 'text-red-400' },
  stable: { icon: Minus, color: 'text-gray-400' },
};

interface MarketDemandTableProps {
  onListPart: (part: string) => void;
}

export function MarketDemandTable({ onListPart }: MarketDemandTableProps) {
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
    },
  ];

  const handleAskAI = (partName: string) => {
    setSelectedPart(partName);
    setChatOpen(true);
  };

  return (
    <>
      <div className="rounded-xl border border-[#564B5C]/50 overflow-hidden bg-[#2B2730]/50 backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-[#564B5C]/50 hover:bg-transparent">
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider">Part</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider text-center">Demand</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider text-right">Market Price</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider text-center">Weekly Views</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider text-center">Trend</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider text-center">Match</TableHead>
              <TableHead className="text-[#C5B8CC]/80 text-xs uppercase tracking-wider text-right">Actions</TableHead>
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
                  className="border-b border-[#564B5C]/30 hover:bg-[#3D3541]/50 transition-colors group"
                >
                  {/* Part Name */}
                  <TableCell className="text-white">
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0 rgba(181, 228, 211, 0)',
                            '0 0 8px rgba(181, 228, 211, 0.3)',
                            '0 0 0 rgba(181, 228, 211, 0)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                        className="w-2 h-2 rounded-full bg-[#B5E4D3]"
                      />
                      <span>{item.part}</span>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="text-[#C5B8CC]/70 text-sm">
                    {item.category}
                  </TableCell>

                  {/* Demand Badge */}
                  <TableCell className="text-center">
                    <Badge 
                      variant="outline" 
                      className={`${config.bg} ${config.color} ${config.border} text-xs`}
                    >
                      {item.demand}
                    </Badge>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-white">{item.avgPrice}</span>
                      <span className="text-[10px] text-[#C5B8CC]/50">
                        ${item.priceRange.min}-${item.priceRange.max}
                      </span>
                    </div>
                  </TableCell>

                  {/* Weekly Views */}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-white">{item.weeklyViews}</span>
                      <span className="text-[10px] text-[#C5B8CC]/50">views</span>
                    </div>
                  </TableCell>

                  {/* Trend */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TrendIcon className={`w-3.5 h-3.5 ${trendStyle.color}`} />
                      {item.trendPercent !== 0 && (
                        <span className={`text-xs ${trendStyle.color}`}>
                          {item.trendPercent > 0 ? '+' : ''}{item.trendPercent}%
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Compatibility Match */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-12 h-1.5 bg-[#564B5C]/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.compatibility}%` }}
                          transition={{ duration: 0.8, delay: index * 0.1 }}
                          className="h-full bg-gradient-to-r from-[#9D7B52] to-[#B5E4D3]"
                        />
                      </div>
                      <span className="text-xs text-[#B5E4D3]">{item.compatibility}%</span>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAskAI(item.part)}
                        className="text-[#B5E4D3] hover:text-white hover:bg-[#B5E4D3]/20 h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Ask AI"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => onListPart(item.part)}
                        className="bg-[#9D7B52] hover:bg-[#8A6A48] text-white text-xs h-7 px-3"
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
        className="mt-4 flex items-center gap-2 px-4 py-3 bg-[#3D3541]/50 backdrop-blur border border-[#564B5C]/30 rounded-xl"
      >
        <motion.div
          animate={{ 
            opacity: [0.5, 1, 0.5],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-[#B5E4D3]" />
        </motion.div>
        <p className="text-xs text-[#C5B8CC]/70">
          <span className="text-[#B5E4D3]">Wessley analyzed</span> 2,847 recent sales for your {' '}
          <span className="text-white">2000 Hyundai Galloper</span>
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
