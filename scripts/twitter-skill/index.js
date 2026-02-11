const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class TwitterBot {
    constructor(config) {
        this.config = {
            headless: config.headless !== 'false' && config.headless !== false && config.headless !== undefined,
            proxy: config.proxy || process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
            username: config.username,
            password: config.password,
            email: config.email,
            authFile: config.authFile || path.join(__dirname, 'auth.json')
        };
        this.browser = null;
        this.context = null;
        this.page = null;
    }

    async init() {
        console.log(`🚀 Starting Twitter Bot (Proxy: ${this.config.proxy || 'None'})...`);
        
        const launchOptions = {
            headless: this.config.headless,
            args: ['--disable-blink-features=AutomationControlled']
        };

        if (this.config.proxy) {
            launchOptions.proxy = { server: this.config.proxy };
        }

        this.browser = await chromium.launch(launchOptions);

        this.context = await this.browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 720 },
            locale: 'zh-CN',
            timezoneId: 'Asia/Shanghai',
            ignoreHTTPSErrors: true
        });

        // Load cookies if available
        if (fs.existsSync(this.config.authFile)) {
            try {
                const cookies = JSON.parse(fs.readFileSync(this.config.authFile, 'utf8'));
                await this.context.addCookies(cookies);
                console.log('🍪 Loaded session cookies');
            } catch (e) {
                console.warn('⚠️ Failed to load cookie file:', e.message);
            }
        }

        this.page = await this.context.newPage();
    }

    async close() {
        if (this.browser) await this.browser.close();
    }

    async login() {
        try {
            console.log('🔗 Navigating to X.com...');
            
            // Retry logic for connection
            for (let i = 0; i < 3; i++) {
                try {
                    await this.page.goto('https://x.com/', { timeout: 60000 });
                    break;
                } catch (e) {
                    console.log(`Connection attempt ${i+1} failed...`);
                    if (i === 2) throw e;
                    await this.page.waitForTimeout(2000);
                }
            }

            // Check if already logged in
            try {
                await this.page.waitForSelector('[data-testid="AppTabBar_Home_Link"]', { timeout: 5000 });
                console.log('✅ Already logged in');
                return true;
            } catch (e) {
                console.log('⚠️ Not logged in, starting login process...');
            }

            // --- Automated Login Attempt ---
            if (this.config.username && this.config.password) {
                try {
                    console.log('🤖 Attempting automated login...');
                    // Go to login page if not on it
                    if (!this.page.url().includes('login')) {
                        await this.page.goto('https://x.com/i/flow/login', { timeout: 30000 });
                    }

                    // Username
                    const userInput = await this.page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
                    await userInput.fill(this.config.username);
                    await this.page.keyboard.press('Enter');

                    // Check for unusual activity (Email verification)
                    try {
                        const emailInput = await this.page.waitForSelector('input[name="text"]', { timeout: 5000 });
                        if (emailInput && this.config.email) {
                            console.log('ℹ️ Email verification requested');
                            await emailInput.fill(this.config.email);
                            await this.page.keyboard.press('Enter');
                        }
                    } catch (e) {}

                    // Password
                    const passwordInput = await this.page.waitForSelector('input[name="password"]', { timeout: 10000 });
                    await passwordInput.fill(this.config.password);
                    await this.page.keyboard.press('Enter');

                    // Wait for success
                    await this.page.waitForSelector('[data-testid="AppTabBar_Home_Link"]', { timeout: 30000 });
                    console.log('✅ Automated login successful');
                    
                    // Save cookies
                    const cookies = await this.context.cookies();
                    fs.writeFileSync(this.config.authFile, JSON.stringify(cookies));
                    console.log('💾 Session saved');
                    return true;
                } catch (e) {
                    console.warn('⚠️ Automated login failed:', e.message);
                }
            }

            // --- Manual Login Fallback ---
            if (!this.config.headless) {
                console.log('\n🔴 [IMPORTANT] Manual login required!');
                console.log('👉 Please log in manually in the browser window.');
                console.log('👉 The script will resume automatically once it detects the home page.\n');
                
                // Wait indefinitely for login success (navigation to home)
                await this.page.waitForURL('**/home', { timeout: 0 }); 
                console.log('✅ Manual login detected!');
                
                // Save cookies
                const cookies = await this.context.cookies();
                fs.writeFileSync(this.config.authFile, JSON.stringify(cookies));
                console.log('💾 Session saved');
                return true;
            } else {
                console.error('❌ Login failed and headless mode is enabled. Cannot perform manual login.');
                return false;
            }

        } catch (error) {
            console.error('❌ Login process error:', error.message);
            await this.page.screenshot({ path: 'login-error.png' });
            return false;
        }
    }

    async tweet(text, imagePath = null) {
        try {
            console.log('✍️ Composing tweet...');
            await this.page.goto('https://x.com/compose/tweet', { timeout: 60000 });
            await this.page.waitForLoadState('domcontentloaded');
            
            // Scope to the compose modal - pick the main dialog specifically
            const modal = this.page.locator('[role="dialog"][aria-modal="true"]');
            await modal.waitFor({ state: 'visible', timeout: 30000 });

            // Wait for input box within modal
            try {
                const editor = modal.locator('[contenteditable="true"]');
                await editor.waitFor({ state: 'visible', timeout: 30000 });
                await editor.click();
                await this.page.waitForTimeout(500);
                await this.page.keyboard.type(text);
                await this.page.waitForTimeout(2000);
            } catch (e) {
                console.log('⚠️ Editor interaction failed, trying brute force...');
                 await this.page.keyboard.press('Tab');
                 await this.page.keyboard.press('Tab');
                 await this.page.keyboard.type(text);
            }

            if (imagePath && fs.existsSync(imagePath)) {
                console.log('🖼️ Uploading image...');
                const fileInput = this.page.locator('input[type="file"]');
                await fileInput.setInputFiles(imagePath);
                // Wait for upload to finish (remove button appears)
                const removeButton = modal.locator('[data-testid="attachments"] [aria-label="Remove"]').first();
                await removeButton.waitFor();
            }

            console.log('🚀 Sending...');
            const sendButton = modal.getByTestId('tweetButton');
            
            // Check if button is enabled
            if (await sendButton.isDisabled()) {
                console.error('❌ Tweet button is disabled! Text might not have been entered correctly.');
                return false;
            }

            console.log('🚀 Sending via keyboard shortcut...');
            await this.page.keyboard.press('Control+Enter');
            await this.page.waitForTimeout(2000);

            // If modal is still open, try clicking
            if (await modal.locator('[data-testid="tweetTextarea_0"]').isVisible()) {
                 console.log('⚠️ Keyboard shortcut didn\'t work, trying force click...');
                 await sendButton.click({ force: true });
            }

            // Wait for success indication (toast or navigation)
            try {
                const toast = this.page.getByText('Your post was sent');
                await toast.waitFor({ state: 'visible', timeout: 10000 });
                console.log('✅ Success toast detected!');
            } catch (e) {
                console.log('⚠️ Success toast not found, checking if modal closed...');
                if (await modal.locator('[data-testid="tweetTextarea_0"]').isVisible()) {
                     console.error('❌ Tweet modal is still open. Sending failed.');
                     await this.page.screenshot({ path: 'tweet-failed-modal-open.png' });
                     return false;
                }
                console.log('✅ Modal closed, assuming success.');
            }

            console.log('✅ Tweet sent successfully!');
            return true;
        } catch (error) {
            console.error('❌ Failed to tweet:', error.message);
            await this.page.screenshot({ path: 'tweet-error.png' });
            return false;
        }
    }
}

// CLI Interface
if (require.main === module) {
    (async () => {
        // Load .env
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            require('dotenv').config({ path: envPath });
        } else {
            // Try loading from project root if not found in skill dir
            const rootEnvPath = path.join(process.cwd(), '.env');
            if (fs.existsSync(rootEnvPath)) {
                require('dotenv').config({ path: rootEnvPath });
            }
        }

        const bot = new TwitterBot({
            username: process.env.TWITTER_USERNAME,
            password: process.env.TWITTER_PASSWORD,
            email: process.env.TWITTER_EMAIL,
            proxy: process.env.HTTPS_PROXY || process.env.HTTP_PROXY,
            headless: process.env.HEADLESS
        });

        await bot.init();
        if (await bot.login()) {
            const message = process.argv[2] || `🤖 Automated status update: ${new Date().toISOString()}`;
            const imagePath = process.argv[3];
            await bot.tweet(message, imagePath);
        }
        await bot.close();
    })();
}

module.exports = TwitterBot;
