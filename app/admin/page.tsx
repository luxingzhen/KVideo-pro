'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [ads, setAds] = useState({
    overlay: '',
    banner: ''
  });

  // Check authentication on load
  useEffect(() => {
    // Simple check - in a real app, verify token with API
    const storedAuth = sessionStorage.getItem('admin_auth');
    if (storedAuth) {
      setIsAuthenticated(true);
      fetchAds(storedAuth);
    }
  }, []);

  const fetchAds = async (authPwd: string) => {
    try {
      const res = await fetch('/api/admin/ads', {
        headers: { 'x-admin-password': authPwd }
      });
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      } else {
        if (res.status === 401) {
          setIsAuthenticated(false);
          sessionStorage.removeItem('admin_auth');
        }
      }
    } catch (e) {
      console.error('Failed to load ads');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate password by trying to fetch ads
    fetch('/api/admin/ads', {
      headers: { 'x-admin-password': password }
    }).then(res => {
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', password);
        return res.json().then(data => setAds(data));
      } else {
        setError('密码错误');
      }
    }).catch(() => {
      setError('网络错误');
    }).finally(() => {
      setIsLoading(false);
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess('');
    setError('');
    
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-password': password || sessionStorage.getItem('admin_auth') || ''
        },
        body: JSON.stringify(ads)
      });
      
      if (res.ok) {
        setSuccess('广告配置已保存！请刷新首页查看效果。');
      } else {
        setError('保存失败，请检查密码或重试');
      }
    } catch (e) {
      setError('网络错误');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">广告管理后台</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">管理员密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-color)]"
                placeholder="请输入 ACCESS_PASSWORD"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button 
              type="submit" 
              className="w-full py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white rounded-lg font-medium"
              disabled={isLoading}
            >
              {isLoading ? '验证中...' : '进入后台'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-color)] p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">广告位配置</h1>
          <button 
            onClick={() => {
              setIsAuthenticated(false);
              sessionStorage.removeItem('admin_auth');
            }}
            className="text-white/60 hover:text-white"
          >
            退出登录
          </button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/40 text-green-200 rounded-xl animate-in fade-in slide-in-from-top-2">
            {success}
          </div>
        )}

        <div className="grid gap-8">
          {/* Overlay Ad Config */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              播放暂停广告 (Overlay)
            </h2>
            <p className="text-white/40 text-sm mb-4">
              显示在播放器暂停时的弹窗广告。支持 HTML、&lt;script&gt; 标签（如 Google AdSense）。
            </p>
            <textarea
              value={ads.overlay}
              onChange={(e) => setAds({...ads, overlay: e.target.value})}
              className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 focus:outline-none focus:border-[var(--accent-color)]"
              placeholder="<!-- 粘贴广告代码到这里 -->&#10;<div style='...'>...</div>"
            />
          </div>

          {/* Banner Ad Config */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              侧边栏横幅 (Banner)
            </h2>
            <p className="text-white/40 text-sm mb-4">
              显示在视频详情页右侧。建议尺寸: 300x250 或自适应宽度。
            </p>
            <textarea
              value={ads.banner}
              onChange={(e) => setAds({...ads, banner: e.target.value})}
              className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 focus:outline-none focus:border-[var(--accent-color)]"
              placeholder="<!-- 粘贴广告代码到这里 -->"
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              className="px-8 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/80 text-white rounded-xl font-bold shadow-lg shadow-[var(--accent-color)]/20 transition-all hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              {isLoading ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
