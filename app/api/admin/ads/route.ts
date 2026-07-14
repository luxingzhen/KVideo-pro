import { NextResponse } from 'next/server';

export const runtime = 'edge';

const getAds = () => {
  return {
    banner: process.env.NEXT_PUBLIC_AD_BANNER || '',
    playerTop: process.env.NEXT_PUBLIC_AD_PLAYER_TOP || ''
  };
};

export async function GET(request: Request) {
  // Cloudflare Edge Runtime does not support 'fs' module.
  // We use Environment Variables for configuration.
  return NextResponse.json(getAds());
}

export async function POST(request: Request) {
  // On Cloudflare Pages, we cannot write to files.
  // This endpoint is effectively read-only unless we use KV.
  // The Admin UI has been updated to instruct the user to set Env Vars.
  
  return NextResponse.json({ 
    success: true, 
    message: "Cloudflare 环境下请在控制台设置环境变量: NEXT_PUBLIC_AD_BANNER, NEXT_PUBLIC_AD_PLAYER_TOP" 
  });
}
