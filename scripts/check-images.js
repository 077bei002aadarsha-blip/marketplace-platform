require('dotenv').config({ path: '.env.local' });
const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query('SELECT name, image_urls FROM products ORDER BY created_at LIMIT 8')
  .then(r => {
    console.log('Products with images:\n');
    r.rows.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name}`);
      console.log(`   Images: ${p.image_urls.length > 0 ? p.image_urls.length + ' images' : 'No images'}`);
      if (p.image_urls.length > 0) {
        p.image_urls.forEach((url, j) => {
          console.log(`   ${j + 1}. ${url.substring(0, 60)}...`);
        });
      }
      console.log('');
    });
    pool.end();
  })
  .catch(e => {
    console.error('Error:', e.message);
    pool.end();
  });
