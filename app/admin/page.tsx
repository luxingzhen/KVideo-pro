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
    banner: '',
    playerTop: ''
  });

  // Check authentication on load
  useEffect(() => {
    const storedAuth = sessionStorage.getItem('admin_auth');
    if (storedAuth) {
      setIsAuthenticated(true);
      fetchAds(storedAuth);
    }
  }, []);

  const fetchAds = async (authPwd?: string) => {
    try {
      // In generator mode (Cloudflare), the API is public read-only for current env vars
      // We don't strictly need the password in headers if the API doesn't check it
      const res = await fetch('/api/admin/ads');
      if (res.ok) {
        const data = await res.json();
        setAds(data);
      }
    } catch (e) {
      console.error('Failed to load ads');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', password);
        fetchAds(password);
      } else {
        const data = await res.json();
        setError(data.error || '密码错误');
      }
    } catch (e) {
      setError('验证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setSuccess(`已复制 ${label} 到剪贴板`);
    setTimeout(() => setSuccess(''), 2000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black/90 p-4">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 w-full max-w-md">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">广告管理后台</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">后台管理密码</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--accent-color)]"
                placeholder="请输入 ADMIN_PASSWORD"
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
          <div className="fixed top-4 right-4 z-50 p-4 bg-green-500 text-white rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2">
            {success}
          </div>
        )}

        <div className="mb-8 p-4 bg-blue-500/20 border border-blue-500/40 text-blue-200 rounded-xl">
          <p className="font-bold mb-2">⚠️ Cloudflare Pages 特别说明：</p>
          <p className="text-sm opacity-80">
            Cloudflare Pages 是无服务器环境，不支持在线修改文件。
            <br />
            请将下方的广告代码复制，并前往 <strong>Cloudflare 控制台 -&gt; Settings -&gt; Environment variables</strong> 添加。
          </p>
        </div>

        <div className="grid gap-8">
          {/* Overlay Ad Config */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">
              1. 播放暂停广告 (Overlay)
            </h2>
            <div className="mb-4">
              <label className="text-xs text-white/40 block mb-1">变量名 (Key)</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-black/40 p-2 rounded text-green-400 font-mono">NEXT_PUBLIC_AD_OVERLAY</code>
                <Button onClick={() => copyToClipboard('NEXT_PUBLIC_AD_OVERLAY', '变量名')} className="text-xs">复制</Button>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-white/40 block mb-1">当前值 (Value)</label>
              <div className="relative">
                <textarea
                  value={ads.overlay}
                  onChange={(e) => setAds({...ads, overlay: e.target.value})}
                  className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 focus:outline-none focus:border-[var(--accent-color)]"
                  placeholder="<div>在此输入 HTML 代码...</div>"
                />
                <Button 
                  onClick={() => copyToClipboard(ads.overlay, '广告代码')} 
                  className="absolute bottom-4 right-4 text-xs bg-[var(--accent-color)]"
                >
                  复制内容
                </Button>
              </div>
            </div>
          </div>

          {/* Banner Ad Config */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4 text-purple-400">
              2. 侧边栏横幅 (Banner)
            </h2>
            <div className="mb-4">
              <label className="text-xs text-white/40 block mb-1">变量名 (Key)</label>
              <div className="flex gap-2">
                <code className="flex-1 bg-black/40 p-2 rounded text-green-400 font-mono">NEXT_PUBLIC_AD_BANNER</code>
                <Button onClick={() => copyToClipboard('NEXT_PUBLIC_AD_BANNER', '变量名')} className="text-xs">复制</Button>
              </div>
            </div>
            <div className="mb-4">
              <label className="text-xs text-white/40 block mb-1">当前值 (Value)</label>
              <div className="relative">
                <textarea
                  value={ads.banner}
                  onChange={(e) => setAds({...ads, banner: e.target.value})}
                  className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-sm font-mono text-white/80 focus:outline-none focus:border-[var(--accent-color)]"
                  placeholder="<div>在此输入 HTML 代码...</div>"
                />
                <Button 
                  onClick={() => copyToClipboard(ads.banner, '广告代码')} 
                  className="absolute bottom-4 right-4 text-xs bg-[var(--accent-color)]"
                >
                  复制内容
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
