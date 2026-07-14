/**
 * Site Configuration
 * Handles environment variables for site branding and customization
 */

export interface SiteConfig {
  title: string;
  description: string;
  name: string;
}

/**
 * Site configuration object
 * Uses environment variables with fallback to default values
 * Note: NEXT_PUBLIC_ environment variables are statically embedded at build time
 */
export const siteConfig: SiteConfig = {
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "KVideo - 免费视频聚合 | 在线高清播放",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "全网最纯净的视频聚合平台，免费高清在线观看。聚合多源资源，无需安装App，手机电脑多端同步，提供极致的追剧体验。",
  name: process.env.NEXT_PUBLIC_SITE_NAME || "KVideo",
};