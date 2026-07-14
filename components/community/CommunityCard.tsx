import React from 'react';
import Link from 'next/link';
import { Send, MessageSquare } from 'lucide-react';

interface CommunityCardProps {
  className?: string;
}

export function CommunityCard({ className = '' }: CommunityCardProps) {
  return (
    <div className={`bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-[var(--radius-xl)] p-5 shadow-[var(--shadow-md)] backdrop-blur-md ${className}`}>
      <p className="text-sm text-[var(--text-color-secondary)] mb-4">
        获取最新片源通知，反馈播放问题，加入我们的大家庭！
      </p>
      
      <div className="space-y-3">
        <Link 
          href="https://t.me/TG_yingsh" 
          target="_blank"
          className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[#2AABEE]/10 hover:bg-[#2AABEE]/20 border border-[#2AABEE]/20 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-[#2AABEE] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
            <Send size={16} className="-ml-0.5" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-color)]">Telegram 频道</div>
            <div className="text-xs text-[var(--text-color-secondary)]">订阅最新发布</div>
          </div>
        </Link>
        
        <Link 
          href="#" 
          target="_blank"
          className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] bg-[#12B7F5]/10 hover:bg-[#12B7F5]/20 border border-[#12B7F5]/20 transition-all group"
          onClick={(e) => {
             e.preventDefault();
             alert('QQ群号：88888888 (示例)');
          }}
        >
          <div className="w-8 h-8 rounded-full bg-[#12B7F5] flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
            <MessageSquare size={16} />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-[var(--text-color)]">官方 QQ 群</div>
            <div className="text-xs text-[var(--text-color-secondary)]">交流与反馈</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
