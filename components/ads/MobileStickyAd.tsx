'use client';

import React, { useState, useEffect } from 'react';
import { AdSlot } from './AdSlot';
import { X } from 'lucide-react';

export function MobileStickyAd() {
  const [isVisible, setIsVisible] = useState(true);
  const [hasAdContent, setHasAdContent] = useState(false);

  // Check if ad content is actually loaded/configured before showing container
  useEffect(() => {
    const checkAdConfig = async () => {
      try {
        const res = await fetch('/api/admin/ads');
        if (res.ok) {
          const data = await res.json();
          // Only show if banner ad content exists
          if (data.banner && data.banner.trim().length > 0) {
            setHasAdContent(true);
          }
        }
      } catch (e) {
        // Silent fail
      }
    };
    checkAdConfig();
  }, []);

  if (!isVisible || !hasAdContent) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 pointer-events-none">
      <div className="relative mx-auto max-w-sm w-full bg-black/80 backdrop-blur-md border border-white/10 rounded-xl shadow-lg overflow-hidden pointer-events-auto">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-1 right-1 p-1 text-white/60 hover:text-white bg-black/20 rounded-full z-10"
          aria-label="Close ad"
        >
          <X size={14} />
        </button>
        <div className="flex justify-center items-center min-h-[50px] p-2">
            {/* Reuse existing banner slot but scale it down slightly if needed */}
            <div className="scale-90 origin-bottom">
                <AdSlot type="banner" className="!bg-transparent !border-0 !p-0 !m-0" />
            </div>
        </div>
      </div>
    </div>
  );
}
