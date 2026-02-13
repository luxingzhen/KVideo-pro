'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
// @ts-ignore
import postscribe from 'postscribe';

interface AdSlotProps {
  type: 'banner' | 'player-top';
  className?: string;
  onClose?: () => void;
  // In a real app, you might pass an ad unit ID here
  adUnitId?: string;
}

export function AdSlot({ type, className = '', onClose }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [adContent, setAdContent] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await fetch('/api/admin/ads');
        if (res.ok) {
          const data = await res.json();
          if (type === 'banner') setAdContent(data.banner);
          else if (type === 'player-top') setAdContent(data.playerTop);
        }
      } catch (e) {
        console.error('Failed to load ad');
      } finally {
        setIsLoaded(true);
      }
    };
    
    fetchAd();
  }, [type]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && adContent) {
      try {
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        // Use postscribe to safely inject ad content (supports document.write)
        postscribe(containerRef.current, adContent, {
          done: () => {
            // Optional: callback when scripts finish loading
          }
        });
      } catch (e) {
        console.error('Error executing ad scripts with postscribe:', e);
        // Fallback
        if (containerRef.current) {
          containerRef.current.innerHTML = adContent;
        }
      }
    }
  }, [adContent]);

  if (!isVisible || !isLoaded) return null;
  
  // Define showPlaceholder based on loaded content
  const showPlaceholder = !adContent;
  
  // If no content and not a placeholder (e.g. production mode without ads), hide completely
  if (!adContent) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    onClose?.();
  };


  if (type === 'player-top') {
    return (
      <div className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6 ${className}`}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-white/40">赞助商内容</span>
          {onClose && (
            <button onClick={handleClose} className="text-white/40 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex items-center justify-center min-h-[90px] overflow-hidden">
          {showPlaceholder ? (
            <div className="h-24 w-full bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-white/5">
              <p className="text-white/80 font-medium">播放器上方横幅 (建议 728x90)</p>
            </div>
          ) : (
            <div ref={containerRef} className="w-full flex justify-center h-[90px] relative" />
          )}
        </div>
      </div>
    );
  }

  // Fallback for default banner style
  return (
    <div className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 my-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-white/40">赞助商内容</span>
        {onClose && (
          <button onClick={handleClose} className="text-white/40 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>
      {/* Banner Ad Content */}
      {showPlaceholder ? (
        <div className="h-24 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-white/5">
          <p className="text-white/80 font-medium">侧边栏广告位 (300x250)</p>
        </div>
      ) : (
        <div ref={containerRef} className="w-full flex justify-center h-[250px] relative" />
      )}
    </div>
  );
}
