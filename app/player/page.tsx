import { Metadata } from 'next';
import PlayerClient from './PlayerClient';
import { siteConfig } from '@/lib/config/site-config';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props
): Promise<Metadata> {
  const params = await searchParams;
  const title = params.title as string;
  const videoTitle = title ? decodeURIComponent(title) : '';

  if (videoTitle) {
    return {
      title: `${videoTitle} - 免费在线观看 - ${siteConfig.name}`,
      description: `在 ${siteConfig.name} 免费在线观看《${videoTitle}》。高清画质，免费播放，极速流畅。`,
      openGraph: {
        title: `${videoTitle} - 免费在线观看 - ${siteConfig.name}`,
        description: `在 ${siteConfig.name} 免费在线观看《${videoTitle}》。高清画质，免费播放。`,
        type: 'video.movie',
      },
    };
  }

  return {
    title: `播放器 - ${siteConfig.name}`,
    description: '全网视频聚合搜索，免费高清在线观看。',
  };
}

export default function PlayerPage() {
  return <PlayerClient />;
}
