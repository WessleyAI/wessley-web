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
      <DialogContent className="bg-[#2E3135] border-[#4A4E52] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle>List a New Part</DialogTitle>
          <DialogDescription className="text-gray-400">
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
            <Label htmlFor="part-name" className="text-gray-300">
              Part Name
            </Label>
            <Input
              id="part-name"
              defaultValue={partName}
              placeholder="e.g., Alternator"
              className="bg-[#3A3E42] border-[#4A4E52] text-white placeholder:text-gray-500"
            />
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-gray-300">
              Condition
            </Label>
            <Select>
              <SelectTrigger className="bg-[#3A3E42] border-[#4A4E52] text-white">
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent className="bg-[#3A3E42] border-[#4A4E52] text-white">
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
            <Label htmlFor="price" className="text-gray-300">
              Price
            </Label>
            <Input
              id="price"
              type="number"
              placeholder="150"
              className="bg-[#3A3E42] border-[#4A4E52] text-white placeholder:text-gray-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the part's condition, mileage, any known issues..."
              className="bg-[#3A3E42] border-[#4A4E52] text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <Label className="text-gray-300">Photos</Label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-dashed border-[#4A4E52] rounded-lg p-8 text-center cursor-pointer hover:border-[#9D7B52] transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">
                Click to upload or drag and drop
              </p>
              <p className="text-gray-500 text-xs mt-1">
                PNG, JPG up to 10MB
              </p>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button className="flex-1 bg-[#B5E4D3] hover:bg-[#A0D4C3] text-[#2E3135]">
              List Part
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
