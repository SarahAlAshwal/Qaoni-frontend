import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://www.qaoni.ca';
const API_URL = process.env.VITE_API_URL;
if (!API_URL) throw new Error('VITE_API_URL is not set');

const staticRoutes = [
  { url: '/',            priority: '1.0', changefreq: 'daily'   },
  { url: '/businesses',  priority: '0.9', changefreq: 'daily'   },
  { url: '/categories',  priority: '0.8', changefreq: 'weekly'  },
  { url: '/about',       priority: '0.5', changefreq: 'monthly' },
  { url: '/contact',     priority: '0.5', changefreq: 'monthly' },
];

function toEntry(loc, lastmod, changefreq, priority) {
  const lastmodTag = lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '';
  return `  <url>\n    <loc>${loc}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function generate() {
  console.log('Generating sitemap...');

  const [shopsRes, categoriesRes] = await Promise.all([
    fetch(`${API_URL}/api/shops`),
    fetch(`${API_URL}/api/categories`),
  ]);

  if (!shopsRes.ok) throw new Error(`Failed to fetch shops: ${shopsRes.status}`);
  if (!categoriesRes.ok) throw new Error(`Failed to fetch categories: ${categoriesRes.status}`);

  const shops = await shopsRes.json();
  const categories = await categoriesRes.json();

  const entries = [
    ...staticRoutes.map(({ url, priority, changefreq }) =>
      toEntry(`${SITE_URL}${url}`, undefined, changefreq, priority)
    ),
    ...shops.map((shop) =>
      toEntry(
        `${SITE_URL}/businesses/${shop.slug}`,
        shop.updatedAt ? new Date(shop.updatedAt).toISOString().split('T')[0] : undefined,
        'weekly',
        '0.8'
      )
    ),
    ...categories.map((cat) =>
      toEntry(
        `${SITE_URL}/categories/${cat.slug}`,
        cat.updatedAt ? new Date(cat.updatedAt).toISOString().split('T')[0] : undefined,
        'weekly',
        '0.7'
      )
    ),
  ];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries.join('\n') +
    `\n</urlset>`;

  const outPath = join(__dirname, '../public/sitemap.xml');
  writeFileSync(outPath, xml, 'utf-8');
  console.log(`Sitemap written: ${entries.length} URLs`);
}

generate().catch((err) => {
  console.error('Sitemap generation failed:', err.message);
  process.exit(1);
});
