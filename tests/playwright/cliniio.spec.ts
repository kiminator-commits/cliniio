import { test, expect } from '@playwright/test';

test.describe('Cliniio Application Tests - Fixed', () => {
  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/', { timeout: 60000 }); // Increase timeout to 60s
      await page.waitForLoadState('networkidle'); // Wait for network to be idle
    } catch {
      throw new Error(
        'Application failed to load. Ensure dev server is running with: npm run dev'
      );
    }
  });

  test('should load the main application', async ({ page }) => {
    await expect(page).toHaveTitle(/Cliniio/);
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(
      page.locator('button[type="submit"]:has-text("Login")')
    ).toBeVisible();
  });

  test('should have working navigation sidebar', async ({ page }) => {
    // Fill in login form with test credentials
    await page.fill('#email', 'test@cliniio.com');
    await page.fill('#password', 'Cliniio2025.secure!');
    await page.click('button[type="submit"]');

    // Wait for navigation to home page (login has 1s delay)
    await page.waitForURL('**/home', { timeout: 15000 });
    // Wait for navigation drawer to be fully rendered (handle both open and closed states)
    await page.waitForSelector(
      'nav button[aria-label="Home"], nav button[aria-label="Home page"]',
      { timeout: 10000 }
    );

    const navItems = [
      { name: 'Home', url: '/home' },
      { name: 'Sterilization', url: '/sterilization' },
      { name: 'Inventory', url: '/inventory' },
      { name: 'Environmental Clean', url: '/environmental-clean' },
      { name: 'Knowledge Hub', url: '/knowledge-hub' },
      { name: 'Settings', url: '/settings' },
    ];

    for (const item of navItems) {
      // Handle both open and closed drawer states
      await page.waitForSelector(
        `nav button[aria-label="${item.name}"], nav button[aria-label="${item.name} page"]`,
        {
          timeout: 10000,
        }
      );
      // Click the button (works for both aria-label formats)
      await page.click(
        `nav button[aria-label="${item.name}"], nav button[aria-label="${item.name} page"]`
      );
      await expect(page).toHaveURL(new RegExp(item.url));
    }
  });

  test('should display performance metrics on home page', async ({ page }) => {
    // Fill in login form with test credentials
    await page.fill('#email', 'test@cliniio.com');
    await page.fill('#password', 'Cliniio2025.secure!');
    await page.click('button[type="submit"]');

    // Wait for navigation to home page (login has 1s delay)
    await page.waitForURL('**/home', { timeout: 15000 });
    // Wait for navigation drawer to be fully rendered (handle both open and closed states)
    await page.waitForSelector(
      'nav button[aria-label="Home"], nav button[aria-label="Home page"]',
      { timeout: 10000 }
    );

    // No need to click Home button - we're already on home page
    await expect(page.locator('[data-testid="metrics-section"]')).toBeVisible();
  });

  test('should have responsive design', async ({ page }) => {
    // Fill in login form with test credentials
    await page.fill('#email', 'test@cliniio.com');
    await page.fill('#password', 'Cliniio2025.secure!');
    await page.click('button[type="submit"]', { timeout: 60000 });

    // Wait for navigation to home page (login has 1s delay)
    await page.waitForURL('**/home', { timeout: 15000 });
    // Wait for navigation drawer to be fully rendered (handle both open and closed states)
    await page.waitForSelector(
      'nav button[aria-label="Home"], nav button[aria-label="Home page"]',
      { timeout: 10000 }
    );

    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(
      page.locator(
        'nav button[aria-label="Home"], nav button[aria-label="Home page"]'
      )
    ).toBeVisible();

    await page.setViewportSize({ width: 375, height: 667 });
    const mainNavVisible = await page
      .locator(
        'nav button[aria-label="Home"], nav button[aria-label="Home page"]'
      )
      .isVisible();
    const menuButtonVisible = await page
      .locator(
        'button[aria-label="Collapse navigation menu (Press Enter or Space)"], button[aria-label*="Open main"]'
      )
      .isVisible();
    expect(mainNavVisible || menuButtonVisible).toBeTruthy();
  });

  test('should handle authentication flow', async ({ page }) => {
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(
      page.locator('button[type="submit"]:has-text("Login")')
    ).toBeVisible();
  });
});
