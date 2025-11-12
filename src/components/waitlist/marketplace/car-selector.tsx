import { motion } from 'framer-motion';
import { ChevronDown, LayoutDashboard, Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface CarData {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vin: string;
  mileage: string;
  pendingRequests: number;
  imageUrl: string;
  partsListed: number;
  partsSold: number;
  totalRevenue: number;
  rating: number;
}

interface CarSelectorProps {
  cars: CarData[];
  selectedCarId: string | null; // null means "Dashboard"
  onSelectCar: (carId: string | null) => void;
}

export function CarSelector({ cars, selectedCarId, onSelectCar }: CarSelectorProps) {
  const selectedCar = selectedCarId ? cars.find(c => c.id === selectedCarId) : null;
  const totalRequests = cars.reduce((sum, car) => sum + car.pendingRequests, 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 bg-[#2E3135] hover:bg-[#3D3541] border border-[#564B5C] rounded-xl px-4 py-2.5 transition-all shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center gap-3 min-w-0">
            {selectedCarId ? (
              <>
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#564B5C]/50">
                  <img
                    src={selectedCar?.imageUrl}
                    alt={selectedCar?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white truncate">
                      {selectedCar?.year} {selectedCar?.make} {selectedCar?.model}
                    </p>
                    {selectedCar && selectedCar.pendingRequests > 0 && (
                      <div className="relative">
                        <Bell className="w-3.5 h-3.5 text-[#9D7B52]" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#EF4444] rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white">{selectedCar.pendingRequests}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#C5B8CC]/60">{selectedCar?.name}</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#564B5C]/50 bg-[#3D3541] flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-[#9D7B52]" />
                </div>
                <div className="text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white">All Vehicles</p>
                    {totalRequests > 0 && (
                      <div className="relative">
                        <Bell className="w-3.5 h-3.5 text-[#9D7B52]" />
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#EF4444] rounded-full flex items-center justify-center">
                          <span className="text-[8px] text-white">{totalRequests}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-[#C5B8CC]/60">Dashboard View</p>
                </div>
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-[#C5B8CC] flex-shrink-0" />
        </motion.button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-72 bg-[#2E3135] border-[#564B5C] shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => onSelectCar(null)}
          className={`cursor-pointer ${
            !selectedCarId ? 'bg-[#3D3541]' : ''
          } hover:bg-[#3D3541] focus:bg-[#3D3541]`}
        >
          <div className="flex items-center gap-3 w-full py-1">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#564B5C]/50 bg-[#3D3541] flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-[#9D7B52]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm text-white">All Vehicles Dashboard</p>
                {totalRequests > 0 && (
                  <Badge variant="outline" className="bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] text-[9px] px-1.5">
                    {totalRequests}
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-[#C5B8CC]/60">Consolidated view</p>
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#564B5C]/30" />

        {cars.map((car) => (
          <DropdownMenuItem
            key={car.id}
            onClick={() => onSelectCar(car.id)}
            className={`cursor-pointer ${
              selectedCarId === car.id ? 'bg-[#3D3541]' : ''
            } hover:bg-[#3D3541] focus:bg-[#3D3541]`}
          >
            <div className="flex items-center gap-3 w-full py-1">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-[#564B5C]/50">
                <img
                  src={car.imageUrl}
                  alt={car.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white truncate">
                    {car.year} {car.make} {car.model}
                  </p>
                  {car.pendingRequests > 0 && (
                    <Badge variant="outline" className="bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444] text-[9px] px-1.5">
                      {car.pendingRequests}
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-[#C5B8CC]/60">{car.name}</p>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
