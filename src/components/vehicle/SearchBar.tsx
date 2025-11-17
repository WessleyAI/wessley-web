'use client'

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="relative w-full max-w-2xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 app-text-muted pointer-events-none" />
      <input
        type="text"
        placeholder="Search for restoration projects..."
        className="w-full pl-12 pr-4 py-3 app-bg-secondary app-text-primary rounded-xl transition-all app-body"
        style={{
          border: '1px solid var(--app-border)',
          caretColor: 'var(--app-accent)'
        }}
        onFocus={(e) => {
          e.currentTarget.style.outline = 'none'
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--app-accent-subtle)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </div>
  );
}
