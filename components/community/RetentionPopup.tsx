import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { UtilityIcons } from '@/components/ui/icons/utility-icons';

interface RetentionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onFavorite: () => void;
}

export function RetentionPopup({ isOpen, onClose }: RetentionPopupProps) {
  if (!isOpen) return null;

  const handleCopyQQ = async () => {
    const qqGroup = "676722260";
    let success = false;
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(qqGroup);
            success = true;
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = qqGroup;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            success = document.execCommand('copy');
            document.body.removeChild(textArea);
        }
    } catch (err) {
        console.error('Copy failed', err);
        success = false;
    }

    if (success) {
        alert(`QQ群号 ${qqGroup} 已复制到剪贴板`);
    } else {
        alert(`QQ群号: ${qqGroup}`);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-xl)] p-6 shadow-2xl max-w-sm w-full transform transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-color-secondary)] hover:text-[var(--text-color)] transition-colors"
        >
          <Icons.X size={20} />
        </button>

        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#12B7F5]/10 rounded-full flex items-center justify-center mx-auto text-[#12B7F5]">
            <UtilityIcons.QQ size={24} className="animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-[var(--text-color)] mb-2">
              加入官方QQ群
            </h3>
            <p className="text-sm text-[var(--text-color-secondary)]">
              群号: <span className="text-[var(--accent-color)] font-bold select-all">676722260</span><br/>
              获取最新资源，交流反馈问题。
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={onClose}
            >
              以后再说
            </Button>
            <Button 
              variant="primary"
              className="flex-1 bg-[#12B7F5] hover:bg-[#12B7F5]/90 text-white border-none shadow-[#12B7F5]/20"
              onClick={handleCopyQQ}
            >
              复制群号
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
