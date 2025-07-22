'use client';

import { List, LayoutGrid } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface ViewToggleProps {
  currentView: 'gallery' | 'list';
  onViewChange: (view: 'gallery' | 'list') => void;
}

export function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
  // Ensure that onViewChange is only called when the value is one of the allowed strings.
  const handleValueChange = (value: string) => {
    if (value === 'gallery' || value === 'list') {
      onViewChange(value);
    }
  };

  return (
    <ToggleGroup
      type="single"
      value={currentView}
      onValueChange={handleValueChange}
      aria-label="View mode"
      className="hidden sm:flex"
    >
      <ToggleGroupItem value="gallery" aria-label="Gallery view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
