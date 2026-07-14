# SYSTEM MEMORY & KNOWLEDGE BASE

**Last Updated:** 2026-02-10
**Status:** Active

This file serves as a persistent record of critical system configurations, network environment details, and deployment procedures. It is intended to preserve context for future development sessions.

---

## 1. Network Environment

### Local Proxy Configuration
- **Address:** `http://127.0.0.1:7890` (Localhost)
- **Context:** This is a local proxy server required for scripts running on the development machine to access external blocked APIs (e.g., Telegram API).
- **Usage Pattern:**
  - **Node.js Scripts:** Use `undici`'s `ProxyAgent` or set `HTTPS_PROXY` environment variable.
  - **Terminal:** `export HTTPS_PROXY=http://127.0.0.1:7890`

---

## 2. Project Constants

| Key | Value | Description |
| :--- | :--- | :--- |
| **Site URL** | `https://tv.srfwq.top` | Production website URL |
| **API Endpoint** | `https://tv.srfwq.top/api/douban/recommend` | Source for hot video data |
| **Telegram Bot** | `@lxzxui_bot` | Bot username |
| **Target Channel** | `@TG_yingsh` | Channel receiving notifications |

---

## 3. Deployment Guides

### Telegram Notification Bot (Cloudflare Workers)

**Source File:** `scripts/worker-notify.js`
**Function:** Periodically checks for new hot movies and pushes them to the Telegram channel.

**Deployment Checklist:**

1.  **Create Worker:**
    *   Name: `kvideo-bot` (or similar)
    *   Platform: Cloudflare Workers

2.  **Code Deployment:**
    *   Copy full content from `scripts/worker-notify.js` to the Worker editor.

3.  **KV Storage Binding (CRITICAL):**
    *   *Why?* Required to store history and prevent duplicate posts.
    *   Go to **Storage & Databases** -> **KV** -> Create Namespace: `KVIDEO_KV`.
    *   Go to Worker **Settings** -> **Variables** -> **KV Namespace Bindings**.
    *   **Variable name:** `KVIDEO_KV` (Must match exactly).
    *   **Namespace:** Select `KVIDEO_KV`.

4.  **Environment Variables:**
    *   Go to Worker **Settings** -> **Variables**.
    *   `TG_BOT_TOKEN`: `7403849410:AAGpKk8dLppGQRTwmDujZ2eeiocVBx-6-Xk`
    *   `TG_CHAT_ID`: `@TG_yingsh`

5.  **Scheduling:**
    *   Go to Worker **Triggers** -> **Cron Triggers**.
    *   Add Trigger: `*/30 * * * *` (Runs every 30 minutes).

### Twitter Automation Bot (Local Script)

**Source File:** `scripts/twitter-bot.js`
**Function:** Automated browser script (Playwright) to post tweets about new content.
**Platform:** **Local Only** (Requires full browser environment, cannot run on Cloudflare).

**Setup Steps:**

1.  **Dependencies:**
    Ensure Playwright is installed:
    ```bash
    npm install playwright
    npx playwright install chromium
    ```

2.  **Configuration:**
    Create/Edit `twitter.env` in the root directory with your credentials:
    ```env
    TWITTER_USERNAME="your_username"
    TWITTER_PASSWORD="your_password"
    HTTPS_PROXY="http://127.0.0.1:7890"
    ```

3.  **Usage:**
    Run the script locally (or on a VPS with Node.js):
    ```bash
    # Load environment variables and run
    export $(cat twitter.env | xargs) && node scripts/twitter-bot.js
    ```

---

## 4. Feature Implementation Notes

### "Way Home" (Release Page)
- **Source:** `public/publish/worker.js`
- **Deployment:** Cloudflare Worker
- **Variable:** `LATEST_URL` (controls redirect destination)

### User Retention (Popup)
- **Component:** `components/community/RetentionPopup.tsx`
- **Logic:** Triggers after 5 minutes (300s) of playback if video is not favorited.
