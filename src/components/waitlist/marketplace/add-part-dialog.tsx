import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload } from 'lucide-react';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partName?: string;
}

export function AddPartDialog({ open, onOpenChange, partName }: AddPartDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1a1a1a] border-[#808080]/30 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>List a New Part</DialogTitle>
          <DialogDescription className="text-[#C4C4C4]/70">
            Add photos and details to list your part for sale
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4 mt-4"
        >
          {/* Part Name */}
          <div className="space-y-2">
            <Label htmlFor="part-name" className="text-[#C4C4C4] font-['DM_Sans']">
              Part Name
            </Label>
            <Input
              id="part-name"
              defaultValue={partName}
              placeholder="e.g., Alternator"
              className="bg-[#161616] border-[#808080]/30 text-white placeholder:text-gray-500 font-['DM_Sans']"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-[#C4C4C4] font-['DM_Sans']">
              Condition
            </Label>
            <Select>
              <SelectTrigger className="bg-[#161616] border-[#808080]/30 text-white font-['DM_Sans']">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent className="bg-[#161616] border-[#808080]/30 text-white font-['DM_Sans']">
                <SelectItem value="excellent">Excellent</SelectItem>
                <SelectItem value="very-good">Very Good</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="fair">Fair</SelectItem>
                <SelectItem value="salvage">Salvage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-[#C4C4C4] font-['DM_Sans']">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="150"
              className="bg-[#161616] border-[#808080]/30 text-white placeholder:text-gray-500 font-['DM_Sans']"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#C4C4C4] font-['DM_Sans']">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the part's condition, mileage, any known issues..."
              className="bg-[#161616] border-[#808080]/30 text-white placeholder:text-gray-500 min-h-[100px] font-['DM_Sans']"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-[#C4C4C4] font-['DM_Sans']">Photos</Label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-[#808080]/30 rounded-lg p-8 text-center cursor-pointer hover:border-[#8BE196] transition-colors"
            >
              <Upload className="w-8 h-8 text-[#C4C4C4]/70 mx-auto mb-2" />
              <p className="text-[#C4C4C4]/70 text-sm font-['DM_Sans']">
                Click to upload or drag and drop
              </p>
              <p className="text-[#C4C4C4]/50 text-xs mt-1 font-['DM_Sans']">
                PNG, JPG up to 10MB
              </p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#808080]/30 text-[#C4C4C4] hover:bg-[#161616] font-['DM_Sans']"
            >
              Cancel
            </Button>
            <Button className="flex-1 bg-[#8BE196] hover:bg-[#9DF4A8] text-[#000000] font-['DM_Sans'] font-semibold">
              List Part
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
