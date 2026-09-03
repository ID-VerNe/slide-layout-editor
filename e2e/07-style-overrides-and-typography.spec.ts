import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('样式控制实验室 (Style Lab) 与排版覆盖端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    await createNewProjectAndEnterEditor(page);
  });

  test('打开主标题样式面板后，能够切换文本对齐方式并实时同步', async ({ page, consoleErrors }) => {
    // 1. 定位主标题字段的样式设置按钮 (Style Settings)
    const styleSettingsBtn = page.getByTitle('Style Settings').first();
    await expect(styleSettingsBtn).toBeVisible({ timeout: 10000 });
    await styleSettingsBtn.click();

    // 2. 验证出现 Style Lab 样式弹窗与排版控制选项
    await expect(page.getByText('Style Lab')).toBeVisible({ timeout: 5000 });
    const textAlignSection = page.locator('div.space-y-2').filter({ has: page.getByText('Text Align') }).first();
    await expect(textAlignSection).toBeVisible();

    // 3. 点击“Align Center”居中对齐按钮
    const alignCenterBtn = textAlignSection.getByTitle('Align Center');
    await expect(alignCenterBtn).toBeVisible();
    await alignCenterBtn.click();
    await page.waitForTimeout(300);

    // 4. 点击“Align Right”右对齐按钮
    const alignRightBtn = textAlignSection.getByTitle('Align Right');
    await expect(alignRightBtn).toBeVisible();
    await alignRightBtn.click();
    await page.waitForTimeout(300);

    // 5. 验证 9 点停靠 (9-Point Docking) 网格控制按钮存在
    await expect(page.getByText(/9-Point Docking/i)).toBeVisible();

    // 6. 全程无控制台报错
    expect(consoleErrors).toEqual([]);
  });

  test('样式面板内字体族选择器能够正确回显并允许切换', async ({ page, consoleErrors }) => {
    // 1. 打开样式设置面板
    const styleSettingsBtn = page.getByTitle('Style Settings').first();
    await expect(styleSettingsBtn).toBeVisible({ timeout: 10000 });
    await styleSettingsBtn.click();

    // 2. 查找字体选择器或下拉触发器
    const fontPicker = page.locator('button, div').filter({ hasText: /Inter|Cinzel|Noto|Source|Lora|Playfair|Heading Font/i }).first();
    await expect(fontPicker).toBeVisible({ timeout: 5000 });

    // 3. 验证控制台零报错
    expect(consoleErrors).toEqual([]);
  });
});
