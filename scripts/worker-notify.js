// Cloudflare Worker - Telegram 自动发片机器人
// 部署指南：
// 1. 创建一个新的 Worker (例如命名为: kvideo-bot)
// 2. 将此代码复制到 Worker 编辑器中
// 3. 配置环境变量 (Settings -> Variables):
//    - TG_BOT_TOKEN: 您的机器人 Token
//    - TG_CHAT_ID: 目标频道 ID (例如 @TG_yingsh)
// 4. 配置定时任务 (Triggers -> Cron Triggers):
//    - 添加一个 Trigger，例如 "*/30 * * * *" (每30分钟一次)

export default {
  // 1. 定时触发处理
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(env));
  },

  // 2. HTTP 触发处理 (用于测试或手动触发)
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // 安全检查：防止被恶意滥用，建议加上 secret 参数
    // 例如: https://your-worker.workers.dev/?key=YOUR_SECRET_KEY
    if (url.searchParams.get("key") !== env.SECRET_KEY && !env.DEBUG_MODE) {
      // 如果没有设置 SECRET_KEY 且不是调试模式，则允许公开访问 (不推荐)
      if (env.SECRET_KEY) return new Response("Unauthorized", { status: 401 });
    }

    const result = await handleScheduled(env);
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "content-type": "application/json;charset=UTF-8" },
    });
  },
};

// 核心逻辑
async function handleScheduled(env) {
  const CONFIG = {
    SITE_URL: "https://tv.srfwq.top",
    API_URL: "https://tv.srfwq.top/api/douban/recommend?type=movie&limit=10",
    TG_BOT_TOKEN: env.TG_BOT_TOKEN || "7403849410:AAGpKk8dLppGQRTwmDujZ2eeiocVBx-6-Xk",
    TG_CHAT_ID: env.TG_CHAT_ID || "@TG_yingsh",
  };

  const logs = [];
  const log = (msg) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    // 1. 获取热门资源
    log("正在获取热门资源...");
    const response = await fetch(CONFIG.API_URL, {
      headers: {
        "User-Agent": "KVideo-Worker-Bot/1.0"
      }
    });
    
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    const videos = Array.isArray(data.subjects) ? data.subjects : (Array.isArray(data) ? data : []);

    if (videos.length === 0) {
      log("未获取到任何资源");
      return { success: true, logs };
    }

    // 2. 读取已推送记录 (使用 KV 存储)
    // 需要在 Worker 绑定一个 KV Namespace，命名为 "KVIDEO_KV"
    let sentVideos = [];
    if (env.KVIDEO_KV) {
      const stored = await env.KVIDEO_KV.get("sent_videos");
      if (stored) sentVideos = JSON.parse(stored);
    } else {
      log("⚠️ 未绑定 KV 存储，无法记录已推送状态 (将导致重复推送)");
      // 如果没有 KV，我们尝试只推送第一个作为演示，避免刷屏
      // 实际部署必须绑定 KV
    }

    let pushCount = 0;
    const newSentVideos = [...sentVideos];

    // 3. 遍历推送
    for (const video of videos) {
      if (sentVideos.includes(video.id)) {
        continue;
      }

      // 限制每次执行最多推送 3 条，防止超时或刷屏
      if (pushCount >= 3) break;

      const success = await sendTelegramMessage(video, CONFIG, log);
      if (success) {
        newSentVideos.push(video.id);
        pushCount++;
        // 简单的防速率限制延迟
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    // 4. 保存状态到 KV
    if (pushCount > 0 && env.KVIDEO_KV) {
      // 只保留最近 200 条记录
      const toSave = newSentVideos.slice(-200);
      await env.KVIDEO_KV.put("sent_videos", JSON.stringify(toSave));
      log(`保存了 ${toSave.length} 条历史记录`);
    }

    return { 
      success: true, 
      pushed: pushCount, 
      total: videos.length, 
      logs 
    };

  } catch (error) {
    log(`执行出错: ${error.message}`);
    return { success: false, error: error.message, logs };
  }
}

// 辅助函数：转义 Markdown 特殊字符
function escapeMarkdown(text) {
  if (!text) return "";
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}

async function sendTelegramMessage(video, config, log) {
  const title = escapeMarkdown(video.title || "未知影片");
  const rate = video.rate ? escapeMarkdown(video.rate) : "暂无评分";
  const playLink = `${config.SITE_URL}/player?id=${video.id}&title=${encodeURIComponent(video.title || "")}`;
  
  const message = `🎬 *新片速递*\n\n*${title}*\n⭐️ 评分：${rate}\n\n👉 [立即观看](${playLink})`;

  const url = `https://api.telegram.org/bot${config.TG_BOT_TOKEN}/sendMessage`;

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: config.TG_CHAT_ID,
        text: message,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: false
      }),
    });

    const result = await resp.json();
    if (result.ok) {
      log(`✅ 推送成功: ${video.title}`);
      return true;
    } else {
      log(`❌ 推送失败: ${JSON.stringify(result)}`);
      return false;
    }
  } catch (e) {
    log(`❌ 网络请求失败: ${e.message}`);
    return false;
  }
}
