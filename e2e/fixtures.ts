import { test as base, _electron as electron, ElectronApplication, Page, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ElectronTestFixtures {
  electronApp: ElectronApplication;
  page: Page;
  consoleErrors: string[];
  tmpDir: string;
}

// 扩展基础测试夹具，提供真实的 Electron 隔离测试实例
export const test = base.extend<ElectronTestFixtures>({
  tmpDir: async ({}, use) => {
    // 每一个测试使用独立的系统临时目录，隔离配置与工程缓存
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'slidegrid-e2e-'));
    await use(dir);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch {
      // 忽略临时文件被占用的清理失败
    }
  },

  consoleErrors: async ({}, use) => {
    const errors: string[] = [];
    await use(errors);
  },

  electronApp: async ({ tmpDir, consoleErrors }, use) => {
    const rootDir = path.resolve(__dirname, '..');
    const userDataPath = path.join(tmpDir, 'userData');
    await fs.mkdir(userDataPath, { recursive: true });

    // 启动真实的 Electron 主进程并注入隔离参数
    const app = await electron.launch({
      args: [
        rootDir,
        `--user-data-dir=${userDataPath}`,
        '--no-sandbox',
        '--disable-gpu',
      ],
      env: {
        ...process.env,
        NODE_ENV: 'test',
        DIST: path.join(rootDir, 'dist'),
      },
    });

    await use(app);

    // 优雅关闭应用
    await app.close();
  },

  page: async ({ electronApp, consoleErrors }, use) => {
    // 等待首个应用窗口准备就绪
    const win = await electronApp.firstWindow();

    // 严格监听所有控制台红字报错与未捕获页面异常
    win.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 过滤 Chromium 内部常规提示
        if (!text.includes('Failed to load resource: net::ERR_FILE_NOT_FOUND')) {
          consoleErrors.push(`[Console Error]: ${text}`);
        }
      }
    });

    win.on('pageerror', (err) => {
      consoleErrors.push(`[Page Crash/Error]: ${err.message || String(err)}`);
    });

    await win.waitForLoadState('domcontentloaded');
    await use(win);
  },
});

export { expect };

/** 辅助函数：从工作台快速创建新项目并进入编辑器 */
export async function createNewProjectAndEnterEditor(page: Page): Promise<void> {
  // 点击新建幻灯片按钮
  const newSlideBtn = page.getByRole('button', { name: /New Slide/i });
  await expect(newSlideBtn).toBeVisible({ timeout: 10000 });
  await newSlideBtn.click();

  // 等待路由进入 editor 并出现侧边栏
  await expect(page).toHaveURL(/.*#\/editor\/.*/, { timeout: 15000 });
  await expect(page.getByTitle('Back to Dashboard')).toBeVisible({ timeout: 10000 });

  // 若存在引导模态框（如模板选择弹窗）则关闭，并等待遮罩彻底消失
  const closeBtn = page.locator('button[aria-label="Close"], button:has-text("Close")').first();
  if (await closeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }
}
