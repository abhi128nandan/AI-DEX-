require('dotenv').config({ path: '../.env.local' });
const fs = require('fs');
const path = require('path');

// 🧠 10. Data Cleaning Pipeline via AI

const RAW_FILE = path.join(__dirname, 'raw_tools.json');
const CLEAN_FILE = path.join(__dirname, 'clean_tools.json');
const CATEGORIES = ['Writing', 'Image Generation', 'Video', 'Code', 'Audio', 'Productivity', 'Research', 'SEO', 'Marketing', 'Data', 'Design', 'Education', 'Other'];

async function cleanDataWithAI() {
  if (!fs.existsSync(RAW_FILE)) {
    console.error(`Missing ${RAW_FILE}. Run scraper.js first!`);
    return;
  }

  // Load raw tools
  const rawData = JSON.parse(fs.readFileSync(RAW_FILE, 'utf-8'));
  console.log(`Loaded ${rawData.length} raw tools for AI Processing...`);

  const API_KEY = process.env.OPENAI_API_KEY; 
  if (!API_KEY) {
    console.warn('⚠️ No OPENAI_API_KEY found in .env.local. Outputting structured dummy data instead.');
    // Simulated fallback
    const mockCleanData = rawData.map((t, i) => ({
      id: `generated-${i}`,
      name: t.name,
      slug: t.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: `[Cleaned] ${t.raw_description.substring(0, 100)}...`,
      website_url: t.link,
      category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
      tags: ['ai', 'tool', 'generated'],
      views_count: Math.floor(Math.random() * 5000),
      votes_count: Math.floor(Math.random() * 1000)
    }));
    fs.writeFileSync(CLEAN_FILE, JSON.stringify(mockCleanData, null, 2));
    console.log(`✅ Normalized mockup data saved to ${CLEAN_FILE}`);
    return;
  }

  console.log('Valid API Key found. Processing batch...');
  
  const cleanTools = [];
  
  // Real AI processing loop (mocking the structure for safety out of box)
  for (const tool of rawData) {
    try {
      console.log(`🤖 AI cleaning: ${tool.name}...`);
      
      const prompt = `
        You are an expert data indexer. Analyze this AI tool:
        Name: ${tool.name}
        Description: ${tool.raw_description}

        Provide a JSON response with:
        1. A punchy 120-character maximum rewrite of the description.
        2. Assign EXACTLY one category from this list: [${CATEGORIES.join(', ')}]
        3. Provide 3 highly relevant tags (single words).

        JSON format: { "description": "...", "category": "...", "tags": ["...", "..."] }
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'system', content: prompt }],
          temperature: 0.3
        })
      });

      const { choices } = await response.json();
      const aiData = JSON.parse(choices[0].message.content);

      cleanTools.push({
        id: `ai-gen-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        name: tool.name,
        slug: tool.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: aiData.description,
        website_url: tool.link,
        category: aiData.category || 'Other',
        tags: aiData.tags || [],
        views_count: 0,
        votes_count: 0,
        created_at: new Date().toISOString()
      });

      // Avoid rate limits
      await new Promise(r => setTimeout(r, 500));
    } catch(err) {
      console.error(`Error processing ${tool.name}`, err.message);
    }
  }

  fs.writeFileSync(CLEAN_FILE, JSON.stringify(cleanTools, null, 2));
  console.log(`✅ Processed ${cleanTools.length} tools through AI pipeline. Saved to ${CLEAN_FILE}`);
}

cleanDataWithAI();
