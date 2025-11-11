import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Check, X } from 'lucide-react';

interface SaleRequest {
  id: string;
  partName: string;
  buyerName: string;
  buyerInitials: string;
  offerPrice: string;
}

export function SaleRequestsCard() {
  const requests: SaleRequest[] = [
    { id: '1', partName: 'Alternator', buyerName: 'Mike C.', buyerInitials: 'MC', offerPrice: '$165' },
    { id: '2', partName: 'Fuel Pump', buyerName: 'Sarah W.', buyerInitials: 'SW', offerPrice: '$125' },
    { id: '3', partName: 'Door Handle', buyerName: 'James R.', buyerInitials: 'JR', offerPrice: '$35' },
  ];

  return (
    <div className="space-y-2">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ x: -2 }}
          className="bg-[#3D3541] border border-[#564B5C] rounded-lg p-2.5 hover:border-[#9D7B52]/50 transition-all"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarFallback className="bg-[#9D7B52] text-white text-xs">
                {request.buyerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-white text-sm truncate">{request.buyerName}</div>
              <div className="text-gray-400 text-xs truncate">{request.partName}</div>
            </div>
            <div className="text-[#B5E4D3] text-sm flex-shrink-0">{request.offerPrice}</div>
            <div className="flex gap-1 flex-shrink-0">
              <button className="p-1 rounded hover:bg-[#B5E4D3]/20 text-[#B5E4D3] transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-red-500/20 text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
