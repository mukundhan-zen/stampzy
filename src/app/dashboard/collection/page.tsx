'use client';

import { useState } from 'react';
import { PlusCircle, Search, SlidersHorizontal } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GalleryView } from '@/components/stamps/GalleryView';
import { TableView } from '@/components/stamps/TableView';
import { ViewToggle } from '@/components/stamps/ViewToggle';
import { sampleStamps } from '@/components/stamps/sample-data';

export default function CollectionPage() {
  const [view, setView] = useState<'gallery' | 'list'>('gallery');

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">My Collection</h1>
                <p className="text-muted-foreground">A visual and detailed overview of your stamps.</p>
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Stamp
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search by name, seller..." className="pl-8" />
            </div>
            <Button variant="outline" className="hidden sm:flex">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <ViewToggle currentView={view} onViewChange={setView} />
          </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
        {view === 'gallery' ? (
          <GalleryView stamps={sampleStamps} userTier="paid" />
        ) : (
          <TableView stamps={sampleStamps} />
        )}
      </main>
    </div>
  );
}
