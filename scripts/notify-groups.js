// 这是一个示例脚本，用于自动推送最新热门资源到 Telegram/QQ/微信群
// 使用方法: node scripts/notify-groups.js
// 建议配合 crontab 定时执行

const fs = require('fs');
const path = require('path');
const { fetch, ProxyAgent } = require('undici');

// 尝试自动读取系统代理设置
const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.https_proxy || process.env.http_proxy;
let proxyAgent = null;

if (proxyUrl) {
    console.log(`Telegram 将使用代理: ${proxyUrl}`);
    proxyAgent = new ProxyAgent(proxyUrl);
} else {
    // 提示用户如何设置代理
    console.log('提示: 如果连接 Telegram 失败，请设置代理环境变量，例如: export HTTPS_PROXY=http://127.0.0.1:7890');
}

// 配置
const CONFIG = {
    // 你的站点地址
    SITE_URL: 'https://tv.srfwq.top',
    
    // Telegram Bot Token
    TG_BOT_TOKEN: '7403849410:AAGpKk8dLppGQRTwmDujZ2eeiocVBx-6-Xk',
    
    // Telegram Channel ID
    TG_CHAT_ID: '@TG_yingsh',
    
    // Telegram API 地址
    // 默认使用官方地址，但允许覆盖
    TG_API_HOST: 'https://api.telegram.org',

    // 热门资源 API
    API_URL: 'https://tv.srfwq.top/api/douban/recommend?type=movie&limit=5'
};

// 模拟数据库/缓存
const sentVideosFile = path.join(__dirname, 'sent_videos.json');
let sentVideos = [];

try {
    if (fs.existsSync(sentVideosFile)) {
        sentVideos = JSON.parse(fs.readFileSync(sentVideosFile, 'utf8'));
    }
} catch (e) {
    console.error('无法读取已推送记录:', e);
}

// 辅助函数：转义 Markdown 特殊字符
function escapeMarkdown(text) {
    if (!text) return '';
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

async function fetchHotVideos() {
    console.log(`[${new Date().toISOString()}] 正在检查热门资源: ${CONFIG.API_URL}`);
    try {
        // 获取热门资源不使用代理 (直连)
        const response = await fetch(CONFIG.API_URL);
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API error: ${response.status} - ${text.substring(0, 100)}`);
        }
        const data = await response.json();
        
        if (data && Array.isArray(data.subjects)) {
            return data.subjects;
        } else if (Array.isArray(data)) {
            return data;
        }
        
        console.warn('API 返回数据格式不符合预期:', JSON.stringify(data).substring(0, 100));
        return [];
    } catch (error) {
        console.error('获取热门资源失败:', error.message);
        return [];
    }
}

async function sendTelegramMessage(video) {
    const title = escapeMarkdown(video.title || '未知影片');
    const rate = video.rate ? escapeMarkdown(video.rate) : '暂无评分';
    const playLink = `${CONFIG.SITE_URL}/player?id=${video.id}&title=${encodeURIComponent(video.title || '')}`;
    
    const message = `🎬 *新片速递*\n\n*${title}*\n⭐️ 评分：${rate}\n\n👉 [立即观看](${playLink})`;
    
    console.log(`正在推送: ${video.title} 到 ${CONFIG.TG_CHAT_ID}`);

    try {
        const url = `${CONFIG.TG_API_HOST.replace(/\/$/, '')}/bot${CONFIG.TG_BOT_TOKEN}/sendMessage`;
        
        // 仅对 Telegram 请求使用代理
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.TG_CHAT_ID,
                text: message,
                parse_mode: 'MarkdownV2',
                disable_web_page_preview: false
            }),
            dispatcher: proxyAgent // 使用代理 Agent
        });

        const result = await response.json();
        
        if (!result.ok) {
            console.error('Telegram API 错误:', JSON.stringify(result));
            if (result.description && result.description.includes('parse')) {
                console.log('尝试发送纯文本...');
                return await sendPlainText(video, playLink);
            }
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Telegram 网络请求失败:', error.message);
        if (error.cause) console.error('原因:', error.cause);
        return false;
    }
}

async function sendPlainText(video, playLink) {
    try {
        const url = `${CONFIG.TG_API_HOST.replace(/\/$/, '')}/bot${CONFIG.TG_BOT_TOKEN}/sendMessage`;
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CONFIG.TG_CHAT_ID,
                text: `🎬 新片速递\n\n${video.title}\n⭐️ 评分：${video.rate || '暂无'}\n\n👉 立即观看: ${playLink}`
            }),
            dispatcher: proxyAgent // 使用代理 Agent
        });
        return true;
    } catch (e) {
        console.error('纯文本发送也失败了:', e.message);
        return false;
    }
}

async function run() {
    const videos = await fetchHotVideos();
    console.log(`获取到 ${videos.length} 个热门资源`);

    if (videos.length === 0) {
        console.log('没有获取到资源，请检查 API_URL 是否可访问');
        return;
    }
    
    let successCount = 0;

    for (const video of videos) {
        if (!sentVideos.includes(video.id)) {
            const success = await sendTelegramMessage(video);

            if (success) {
                console.log(`✅ 成功推送: ${video.title}`);
                sentVideos.push(video.id);
                successCount++;
            }
            
            // 避免触发 API 速率限制
            await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
            console.log(`⏭️ 已推送过: ${video.title} (ID: ${video.id})`);
        }
    }

    if (successCount > 0) {
        if (sentVideos.length > 100) sentVideos = sentVideos.slice(-100);
        fs.writeFileSync(sentVideosFile, JSON.stringify(sentVideos));
        console.log(`保存了 ${sentVideos.length} 条历史记录`);
    } else {
        console.log('本次没有新推送');
    }
}

run().catch(err => console.error('脚本执行出错:', err));
