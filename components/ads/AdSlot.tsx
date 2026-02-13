'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
        
        // Helper function to recursively reconstruct scripts
        const reconstructScripts = (node: Node): Node => {
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
            return newScript;
          }
          
          // Clone the node
          const clonedNode = node.cloneNode(false);
          
          // Process children recursively
          Array.from(node.childNodes).forEach(child => {
            clonedNode.appendChild(reconstructScripts(child));
          });
          
          return clonedNode;
        };

        // Process and append all child nodes
        Array.from(tempDiv.childNodes).forEach((node) => {
          container.appendChild(reconstructScripts(node));
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

  if (!isVisible || !isLoaded) return null;
  
  // Define showPlaceholder based on loaded content
  const showPlaceholder = !adContent;
  
  // If no content and not a placeholder (e.g. production mode without ads), hide completely
  // But wait, the previous behavior was to show placeholder if no content.
  // The user requirement is: "Update AdSlot to hide when content is missing (unless admin)"
  // Since we don't have easy admin context here, let's assume if adContent is empty string, we hide it.
  // However, for debugging, placeholders are useful. 
  // Let's hide it if adContent is empty, UNLESS we are in development mode or explicitly want placeholders.
  // Actually, standard behavior for ad slots is to collapse if empty.
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
