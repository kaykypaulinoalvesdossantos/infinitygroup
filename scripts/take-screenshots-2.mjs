import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sites = [
  { id: 'noble-smoke', url: 'https://noblesmoke.vercel.app/' },
  { id: 'union-du-pain', url: 'https://uniondupain.vercel.app/' },
  { id: 'terapia-do-bolo', url: 'https://terapiadobolo-seven.vercel.app/' },
  { id: 'agd', url: 'https://agdsite.vercel.app/' },
  { id: 'arte-formatti', url: 'https://arte-formatti.vercel.app/' },
  { id: 'grippa-spa', url: 'https://grippaspa.vercel.app/' },
  { id: 'masa-viva', url: 'https://masaviva.vercel.app/' },
  { id: 'jaco-academia', url: 'https://jacoacademia.vercel.app/' },
  { id: 'marcenaria-ee', url: 'https://marcenaria-e-e.vercel.app/' }
];

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshots() {
  console.log('Iniciando captura de screenshots lote 2...');
  
  const browser = await puppeteer.launch({
    headless: "new",
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseDir = path.join(__dirname, '..', 'public', 'images', 'portfolio');

  for (const site of sites) {
    console.log(`Processando: ${site.id} (${site.url})`);
    const page = await browser.newPage();
    
    try {
      const siteDir = path.join(baseDir, site.id);
      if (!fs.existsSync(siteDir)) {
        fs.mkdirSync(siteDir, { recursive: true });
      }

      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 60000 });
      console.log(`Aguardando animações no site ${site.id}...`);
      await sleep(10000); 

      await page.screenshot({ 
        path: path.join(siteDir, 'Projeto01.png'),
        fullPage: false 
      });
      console.log(`✅ ${site.id} - Projeto01.png (Topo)`);

      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(3000);
      await page.screenshot({ 
        path: path.join(siteDir, 'Projeto02.png'),
        fullPage: false 
      });
      console.log(`✅ ${site.id} - Projeto02.png (Meio)`);

      await page.evaluate(() => window.scrollBy(0, window.innerHeight));
      await sleep(3000);
      await page.screenshot({ 
        path: path.join(siteDir, 'Projeto03.png'),
        fullPage: false 
      });
      console.log(`✅ ${site.id} - Projeto03.png (Baixo)`);

    } catch (error) {
      console.error(`❌ Erro no site ${site.id}:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('Captura de screenshots finalizada!');
}

takeScreenshots();
