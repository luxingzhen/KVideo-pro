'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdSlotProps {
  type: 'banner' | 'overlay' | 'player-top';
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
          if (type === 'overlay') setAdContent(data.overlay);
          else if (type === 'banner') setAdContent(data.banner);
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

  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && adContent) {
      try {
        const container = containerRef.current;
        // Reset container
        container.innerHTML = '';
        
        // Create a temp div to parse the HTML string
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = adContent;
        
        // Move all child nodes to the container
        // Handle scripts specially to ensure execution
        Array.from(tempDiv.childNodes).forEach((node) => {
          if (node.nodeName === 'SCRIPT') {
            const oldScript = node as HTMLScriptElement;
            const newScript = document.createElement('script');
            
            // Copy attributes
            Array.from(oldScript.attributes).forEach(attr => {
              newScript.setAttribute(attr.name, attr.value);
            });
            
            // Copy content
            if (oldScript.innerHTML) {
              newScript.innerHTML = oldScript.innerHTML;
            }
            
            // Append to container
            container.appendChild(newScript);
          } else {
            // Clone non-script nodes
            container.appendChild(node.cloneNode(true));
          }
        });
      } catch (e) {
        console.error('Error executing ad scripts:', e);
        // Fallback to dangerouslySetInnerHTML if manual parsing fails
        if (containerRef.current) {
          containerRef.current.innerHTML = adContent;
        }
      }
    }
  }, [adContent]);

  if (!isVisible) return null;
  
  // Define showPlaceholder based on loaded content
  const showPlaceholder = !adContent;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    onClose?.();
  };

  if (type === 'overlay') {
    return (
      <div 
        className={`absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 ${className}`}
        onClick={(e) => e.stopPropagation()} // Prevent click from pausing/playing video
      >
        <div className="relative bg-white/10 border border-white/20 p-4 rounded-xl shadow-2xl max-w-md w-full mx-4">
          <button 
            onClick={handleClose}
            className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-transform hover:scale-110"
          >
            <X size={20} />
          </button>
          
          <div className="text-center">
            <p className="text-white/60 text-xs mb-2">广告 / Ad</p>
            {/* Ad Content Placeholder */}
            {showPlaceholder ? (
              <div className="bg-gray-800/50 rounded-lg h-60 flex items-center justify-center border border-white/10">
                <div className="text-center p-4">
                  <p className="text-white font-medium mb-2">此处展示贴片广告</p>
                  <p className="text-white/40 text-sm">支持 Google AdSense 或自定义图片</p>
                  <button className="mt-4 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm hover:opacity-90 transition-opacity">
                    了解详情
                  </button>
                </div>
              </div>
            ) : (
              <div ref={containerRef} className="min-h-[200px] flex items-center justify-center" />
            )}
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-center min-h-[90px]">
          {showPlaceholder ? (
            <div className="h-24 w-full bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg flex items-center justify-center border border-white/5">
              <p className="text-white/80 font-medium">播放器上方横幅 (建议 728x90)</p>
            </div>
          ) : (
            <div ref={containerRef} className="w-full flex justify-center" />
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
        <div ref={containerRef} className="w-full flex justify-center" />
      )}
    </div>
  );
}
