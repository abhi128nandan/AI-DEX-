/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-require-imports, react/no-unescaped-entities, react-hooks/exhaustive-deps, prefer-const, react-hooks/set-state-in-effect */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ⚙️ 9. Data Pipeline - Puppeteer Scraper

const TARGET_URL = 'https://theresanaiforthat.com/'; // Example directory
const OUTPUT_FILE = path.join(__dirname, 'raw_tools.json');

async function scrapeTools() {
  console.log(`Starting scrape of ${TARGET_URL}...`);
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // Set viewport and user agent to avoid basic blocks
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Scroll down to load dynamic content
    console.log("Scrolling page to load tools...");
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        let distance = 500;
        let timer = setInterval(() => {
          let scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight || totalHeight > 10000) {
            clearInterval(timer);
            resolve();
          }
        }, 300);
      });
    });

    // Wait for network idle assuming images/cards are loaded
    await new Promise(r => setTimeout(r, 2000));

    // Extract tool data (Selectors act as an example, adjust per target site)
    console.log("Extracting raw tool metadata...");
    const rawTools = await page.evaluate(() => {
      // NOTE: These selectors are generic examples. 
      // You must map them to HTML tags inside your target directory.
      const toolCards = Array.from(document.querySelectorAll('.tool-card-class-example, .li-item, article'));
      
      return toolCards.slice(0, 50).map(card => {
        const name = card.querySelector('h2, h3, .title')?.innerText || '';
        const link = card.querySelector('a')?.href || '';
        const description = card.querySelector('p, .description')?.innerText || '';
        
        return { name, link, raw_description: description };
      }).filter(t => t.name && t.link); // Prune empty rows
    });

    console.log(`Scraped ${rawTools.length} raw tools.`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(rawTools, null, 2));
    console.log(`✅ Results saved to ${OUTPUT_FILE}`);

  } catch (error) {
    console.error("Scraping failed:", error);
  } finally {
    await browser.close();
  }
}

scrapeTools();

