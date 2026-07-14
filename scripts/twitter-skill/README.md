# Twitter Bot Skill

Automated Twitter/X posting tool built with Playwright. Designed for both automated environments and local usage with manual login fallback.

## Features

- **Robust Login**:
    - **Automated**: Tries to log in using credentials from `.env`.
    - **Manual Fallback**: If automated login fails (e.g., CAPTCHA), pauses and lets you log in manually (when `HEADLESS=false`).
    - **Session Persistence**: Saves cookies to `auth.json` to skip login on subsequent runs.
- **Proxy Support**: Essential for running in restricted network environments.
- **Image Upload**: Supports attaching an image to tweets.
- **Smart Retries**: Handles network glitches and transient errors.

## Installation

1. Navigate to the skill directory:
   ```bash
   cd scripts/twitter-skill
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

4. Configure environment:
   Create a `.env` file in this directory (or use the project root `.env`).
   ```env
   TWITTER_USERNAME=your_username
   TWITTER_PASSWORD=your_password
   TWITTER_EMAIL=your_email_for_verification
   HTTPS_PROXY=http://127.0.0.1:7890
   HEADLESS=false  # Set to true for server/CI environments
   ```

## Usage

### Direct CLI

**Basic Tweet:**
```bash
node index.js "Hello world from KVideo!"
```

**Tweet with Image:**
```bash
node index.js "Check out this poster!" "/path/to/image.jpg"
```

### As a Library

```javascript
const TwitterBot = require('./scripts/twitter-skill');

const bot = new TwitterBot({
    username: '...',
    password: '...',
    // proxy: '...' // Optional
});

await bot.init();
const isLoggedIn = await bot.login();

if (isLoggedIn) {
    await bot.tweet('New movie released!', '/path/to/poster.jpg');
}

await bot.close();
```

## Troubleshooting

- **Login Fails**: Ensure `HEADLESS=false` in your `.env` and run the script locally. It will open a browser window. Log in manually. The script will detect the login and save your session cookies for future headless runs.
- **Proxy Errors**: Check your `HTTPS_PROXY` setting.
