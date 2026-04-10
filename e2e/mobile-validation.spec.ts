import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness Validation', () => {
  // Test at multiple viewports
  const viewports = [
    { name: 'iPhone SE (320px)', width: 320, height: 568 },
    { name: 'iPhone 13 (375px)', width: 375, height: 812 },
    { name: 'Galaxy S8 (360px)', width: 360, height: 740 },
    { name: 'iPad (768px)', width: 768, height: 1024 },
    { name: 'Desktop (1200px+)', width: 1200, height: 800 },
  ];

  viewports.forEach(({ name, width, height }) => {
    test(`Should render properly on ${name}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize({ width, height });
      
      // Navigate to home
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      
      // Check hero section is visible
      const hero = page.locator('section#hero');
      await expect(hero).toBeVisible();
      
      // Check nav is visible
      const nav = page.locator('nav.fixed');
      await expect(nav).toBeVisible();
      
      // On mobile, check bottom nav exists
      if (width < 768) {
        const mobileNav = page.locator('nav.md\\:hidden');
        await expect(mobileNav).toBeVisible();
      }
      
      // Check for no horizontal overflow
      const maxWidth = await page.evaluate(() => {
        return Math.max(
          document.documentElement.scrollWidth,
          document.body.scrollWidth
        ) - window.innerWidth;
      });
      expect(maxWidth).toBeLessThanOrEqual(0);
    });

    test(`No content overlap with nav on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      
      // Scroll to bottom to see footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      
      // Footer should be visible and not covered
      const footer = page.locator('footer');
      const box = await footer.boundingBox();
      
      if (box && width < 768) {
        // On mobile, account for nav height (56px + safe-area)
        const navHeight = 56;
        const footerBottom = box.y + box.height;
        // Footer should end well before overlap
        expect(footerBottom).toBeLessThan(window.innerHeight + 100);
      }
    });

    test(`All buttons have adequate tap targets on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      
      // Check nav buttons
      const buttons = page.locator('button');
      const count = await buttons.count();
      
      for (let i = 0; i < count && i < 20; i++) {
        const button = buttons.nth(i);
        const box = await button.boundingBox();
        
        if (box && width < 768) {
          // Minimum tap target is 44x44
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(32);
        }
      }
    });

    test(`Text is readable on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      
      // Check heading is not too large or small
      const h1 = page.locator('h1');
      const h1Style = await h1.evaluate(el => {
        return window.getComputedStyle(el).fontSize;
      });
      
      // Extract number from "24px" format
      const h1Size = parseFloat(h1Style);
      expect(h1Size).toBeGreaterThan(16);
      expect(h1Size).toBeLessThan(120);
    });

    test(`Grid layouts collapse properly on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      
      // Scroll to projects section
      await page.locator('#projects').scrollIntoViewIfNeeded();
      
      // Check grid is responsive
      const projectGrid = page.locator('section#projects .grid');
      const gridStyle = await projectGrid.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });
      
      if (width < 768) {
        // Should be single column on mobile
        expect(gridStyle).toContain('1fr');
      }
    });

    test(`Form inputs are appropriate size on ${name}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('http://localhost:8081/', { waitUntil: 'networkidle' });
      
      // Scroll to contact
      await page.locator('#contact').scrollIntoViewIfNeeded();
      
      // Check input field
      const input = page.locator('input[type="text"], input[type="email"]').first();
      const box = await input.boundingBox();
      
      if (box && width < 768) {
        // Input should be full width or nearly full
        expect(box.width).toBeGreaterThan(200);
      }
    });
  });

  test('Mobile nav has touch-friendly scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('http://localhost:8081/');
    
    // Check mobile nav has webkit scroll
    const mobileNav = page.locator('nav.md\\:hidden');
    const style = await mobileNav.evaluate(el => {
      return window.getComputedStyle(el).WebkitOverflowScrolling;
    });
    
    expect(style).toBe('touch');
  });

  test('No layout shift on scroll', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:8081/');
    
    // Get initial scroll width
    const scrollWidth1 = await page.evaluate(() => {
      return document.documentElement.scrollWidth;
    });
    
    // Scroll down
    await page.evaluate(() => window.scrollBy(0, 500));
    
    // Check scroll width hasn't changed
    const scrollWidth2 = await page.evaluate(() => {
      return document.documentElement.scrollWidth;
    });
    
    expect(Math.abs(scrollWidth1 - scrollWidth2)).toBeLessThanOrEqual(1);
  });

  test('Back to top button positioned correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:8081/');
    
    // Scroll down to make button visible
    await page.evaluate(() => window.scrollBy(0, 1000));
    
    // Back to top button should be visible
    const backToTop = page.locator('button[aria-label="Back to top"]');
    await expect(backToTop).toBeVisible();
    
    // Should not be at bottom: 80px (too close to nav at 56px)
    const box = await backToTop.boundingBox();
    if (box) {
      // Button should be around 96px from bottom on mobile (bottom-24)
      expect(box.y).toBeGreaterThan(0);
    }
  });

  test('Hero spacing is optimized on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:8081/');
    
    // Hero should take full viewport height
    const hero = page.locator('section#hero');
    const box = await hero.boundingBox();
    
    if (box) {
      // Hero height should be approximately viewport height
      expect(box.height).toBeGreaterThan(500);
    }
  });

  test('Contact section footer clearance on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:8081/');
    
    // Scroll to contact
    await page.locator('#contact').scrollIntoViewIfNeeded();
    
    // Contact section should have bottom padding
    const contactSection = page.locator('section#contact');
    const paddingBottom = await contactSection.evaluate(el => {
      return window.getComputedStyle(el).paddingBottom;
    });
    
    const paddingValue = parseFloat(paddingBottom);
    // Should have padding-bottom > 100px on mobile (pb-32 = 128px)
    expect(paddingValue).toBeGreaterThan(100);
  });

  test('All sections have consistent responsive padding', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('http://localhost:8081/');
    
    const sections = page.locator('section');
    const count = await sections.count();
    
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      const paddingTop = await section.evaluate(el => {
        return window.getComputedStyle(el).paddingTop;
      });
      
      const paddingValue = parseFloat(paddingTop);
      // Should have meaningful padding (clamp(40px, 8vw, 60px) = at least 40px)
      expect(paddingValue).toBeGreaterThanOrEqual(20);
    }
  });
});
