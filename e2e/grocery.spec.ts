import { test, expect } from '@playwright/test';

test.describe('Farmart Grocery Store E2E Regression Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and cookies before each test for isolation
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    // Clear cookies by context
    await page.context().clearCookies();
    // Navigate to homepage
    await page.goto('/');
  });

  test('Homepage elements render correctly', async ({ page }) => {
    // 1. Verify Page Title
    await expect(page).toHaveTitle(/Farmart — Fresh Grocery Online/);

    // 2. Verify Navbar elements
    const logo = page.locator('header').getByRole('link', { name: /farmart/i });
    await expect(logo).toBeVisible();

    const searchInput = page.locator('header input[type="search"]');
    await expect(searchInput).toBeVisible();

    // 3. Verify main content sections are present
    const categorySection = page.getByRole('heading', { name: 'เลือกซื้อตามหมวดหมู่' });
    await expect(categorySection).toBeVisible();

    const brandSection = page.getByRole('heading', { name: 'แบรนด์แนะนำ' });
    await expect(brandSection).toBeVisible();

    const bestSellerSection = page.getByRole('heading', { name: 'สินค้าขายดี' });
    await expect(bestSellerSection).toBeVisible();

    // 4. Verify footer is present
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    await expect(footer.getByText('© 2025 Farmart. สงวนลิขสิทธิ์')).toBeVisible();
  });

  test('Category page navigation and breadcrumbs', async ({ page, isMobile }) => {
    // 1. Click Category in Navbar
    if (isMobile) {
      const mobileMenuBtn = page.locator('header button[aria-label="เปิด/ปิดเมนู"]');
      await mobileMenuBtn.click();
    }

    const vegetableLink = page.locator('header a', { hasText: 'ผัก & ผลไม้' }).filter({ visible: true }).first();
    await expect(vegetableLink).toBeVisible();
    await vegetableLink.click();

    // 2. Verify navigation and heading
    await expect(page).toHaveURL(/\/category\/vegetables/);
    const categoryHeading = page.locator('h1', { hasText: 'ผัก' });
    await expect(categoryHeading).toBeVisible();

    // 3. Verify breadcrumbs are present and work
    const breadcrumbHome = page.locator('nav[aria-label="breadcrumb"] a', { hasText: 'หน้าแรก' });
    await expect(breadcrumbHome).toBeVisible();
    await breadcrumbHome.click();

    // 4. Verify we are back on the homepage
    await expect(page).toHaveURL(/\/$/);
  });

  test('Add to Cart, quantity modification, and item removal flow', async ({ page }) => {
    // 1. Locate product card for "นมสดโฮลมิลค์ 1L"
    const productCard = page.locator('article', { has: page.locator('h3', { hasText: 'นมสดโฮลมิลค์ 1L' }) }).first();
    await expect(productCard).toBeVisible();

    // 2. Add product to cart
    const addToCartButton = productCard.locator('button', { hasText: 'เพิ่มในตะกร้า' });
    await addToCartButton.click();

    // 3. Verify Cart Drawer is opened and displays the product
    const cartDrawer = page.locator('aside[role="dialog"]', { hasText: 'ตะกร้าสินค้า' });
    // Assert transition state
    await expect(cartDrawer).toHaveClass(/translate-x-0/);
    // Wait for the slide-in transition to settle to avoid pointer interception during movement
    await page.waitForTimeout(350);

    const cartItem = cartDrawer.locator('li', { hasText: 'นมสดโฮลมิลค์ 1L' });
    await expect(cartItem).toBeVisible();
    await expect(cartItem.getByText('/ ชิ้น')).toBeVisible();

    // 4. Verify total and Navbar cart badge
    const subtotalText = cartDrawer.locator('strong', { hasText: '฿' });
    await expect(subtotalText).toHaveText('฿59');

    const navbarCartBtn = page.locator('header').getByRole('button').filter({ hasText: /ตะกร้า|฿/ }).first();
    await expect(navbarCartBtn).toHaveText(/฿59/);

    // 5. Increase quantity in Cart Drawer
    const plusButton = cartItem.locator('button', { hasText: '+' });
    await plusButton.click();
    
    // Verify updated quantity and total price
    await expect(cartItem.locator('span.font-semibold')).toHaveText('2');
    await expect(subtotalText).toHaveText('฿118');
    await expect(navbarCartBtn).toHaveText(/฿118/);

    // 6. Decrease quantity in Cart Drawer
    const minusButton = cartItem.locator('button', { hasText: '-' });
    await minusButton.click();

    // Verify updated quantity and total price
    await expect(cartItem.locator('span.font-semibold')).toHaveText('1');
    await expect(subtotalText).toHaveText('฿59');
    await expect(navbarCartBtn).toHaveText(/฿59/);

    // 7. Remove item from cart
    const deleteButton = cartItem.locator('button[aria-label^="ลบ"]');
    // Using force: true to avoid pointer interception on smaller/mobile layouts
    await deleteButton.click({ force: true });

    // Verify cart is empty
    await expect(cartDrawer.getByText('ตะกร้าของคุณว่างเปล่า')).toBeVisible();
    await expect(navbarCartBtn).toHaveText(/ตะกร้า/);
  });

  test('Membership signup and 15% discount application', async ({ page }) => {
    // 1. Add product "นมสดโฮลมิลค์ 1L" (฿59) to cart
    const productCard = page.locator('article', { has: page.locator('h3', { hasText: 'นมสดโฮลมิลค์ 1L' }) }).first();
    await productCard.locator('button', { hasText: 'เพิ่มในตะกร้า' }).click();

    // 2. Verify Cart Drawer is open, and close it to fill membership
    const cartDrawer = page.locator('aside[role="dialog"]', { hasText: 'ตะกร้าสินค้า' });
    await expect(cartDrawer).toHaveClass(/translate-x-0/);
    await page.waitForTimeout(350); // wait for open animation
    
    await page.getByLabel('ปิดตะกร้า').click();
    await expect(cartDrawer).toHaveClass(/translate-x-full/);
    await page.waitForTimeout(350); // wait for close animation

    // 3. Fill in membership registration
    const uniqueEmail = `test-e2e-${Date.now()}@example.com`;
    await page.locator('aside', { hasText: 'สมัครสมาชิก' }).locator('input[type="email"]').fill(uniqueEmail);
    await page.locator('aside', { hasText: 'สมัครสมาชิก' }).locator('input[type="password"]').fill('password123');
    await page.locator('aside', { hasText: 'สมัครสมาชิก' }).locator('button[type="submit"]').click();

    // 4. Verify success state (it immediately changes UI to show "คุณเป็นสมาชิกแล้ว!" panel)
    const apiError = page.locator('aside p.text-red-300');
    const successMsg = page.locator('aside', { hasText: 'คุณเป็นสมาชิกแล้ว!' });

    // Wait for either success message or error message to appear
    await Promise.race([
      successMsg.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {}),
      apiError.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    ]);

    if (await apiError.isVisible()) {
      const errorText = await apiError.textContent();
      throw new Error(`Membership registration failed with API Error: ${errorText}`);
    }

    await expect(successMsg).toBeVisible();

    // 5. Open Cart Drawer again and check for discount
    const navbarCartBtn = page.locator('header').getByRole('button').filter({ hasText: /ตะกร้า|฿/ }).first();
    await navbarCartBtn.click();
    await expect(cartDrawer).toHaveClass(/translate-x-0/);
    await page.waitForTimeout(350); // wait for open animation

    // Verify discount is calculated: 15% of 59 = 8.85, rounded to 9. Grand Total = 50.
    const discountRow = cartDrawer.locator('div.text-success', { hasText: 'ส่วนลดสมาชิก 15%' });
    await expect(discountRow).toBeVisible();
    await expect(discountRow.getByText('-฿9')).toBeVisible();

    const grandTotal = cartDrawer.locator('strong', { hasText: '฿' });
    await expect(grandTotal).toHaveText('฿50');

    // Close the drawer before reloading to reset drawer open persistence state
    await page.getByLabel('ปิดตะกร้า').click();
    await expect(cartDrawer).toHaveClass(/translate-x-full/);
    await page.waitForTimeout(350); // wait for close animation

    // 6. Reload page and verify state persistence (Zustand + session cookie)
    await page.reload();
    
    // Verify member section shows "คุณเป็นสมาชิกแล้ว!"
    const memberPanel = page.locator('aside', { hasText: 'คุณเป็นสมาชิกแล้ว!' });
    await expect(memberPanel).toBeVisible();

    // Open Cart and verify items and discounts are preserved
    await page.locator('header').getByRole('button').filter({ hasText: /ตะกร้า|฿/ }).first().click();
    await expect(cartDrawer).toHaveClass(/translate-x-0/);
    await page.waitForTimeout(350); // wait for open animation
    
    await expect(cartDrawer.locator('li', { hasText: 'นมสดโฮลมิลค์ 1L' })).toBeVisible();
    await expect(cartDrawer.locator('div.text-success', { hasText: 'ส่วนลดสมาชิก 15%' })).toBeVisible();
    await expect(cartDrawer.locator('strong', { hasText: '฿' })).toHaveText('฿50');
  });

  test('Responsive Layout (Mobile Viewport)', async ({ page, isMobile }) => {
    // This test is specifically targeting mobile layout.
    if (!isMobile) {
      await page.setViewportSize({ width: 375, height: 667 });
    }
    
    await page.goto('/');

    // 1. Check that desktop menu is hidden and mobile menu button is visible
    const mobileMenuBtn = page.locator('header button[aria-label="เปิด/ปิดเมนู"]');
    await expect(mobileMenuBtn).toBeVisible();

    // 2. Open mobile dropdown menu
    await mobileMenuBtn.click();
    const dropdownMenu = page.locator('header ul.md\\:hidden');
    await expect(dropdownMenu).toBeVisible();

    // 3. Navigate to a category from mobile menu
    const meatLink = dropdownMenu.getByRole('link', { name: 'เนื้อสัตว์' });
    await expect(meatLink).toBeVisible();
    await meatLink.click();

    // 4. Verify navigation and header
    await expect(page).toHaveURL(/\/category\/meat/);
    const categoryHeading = page.locator('h1', { hasText: 'เนื้อสัตว์' });
    await expect(categoryHeading).toBeVisible();
  });

});
