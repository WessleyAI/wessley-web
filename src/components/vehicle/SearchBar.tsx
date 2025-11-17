'use client'

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#C4C4C4]/70 pointer-events-none" />
      <input
        type="text"
        placeholder="Search for restoration projects..."
        className="w-full pl-12 pr-4 py-3 bg-[#161616] text-white rounded-xl border border-[#808080]/30 focus:outline-none focus:ring-2 focus:ring-[#8BE196] transition-all placeholder:text-[#C4C4C4]/50 font-['DM_Sans']"
      />
    </div>
  );
}
