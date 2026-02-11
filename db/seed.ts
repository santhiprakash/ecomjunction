// Seed script for development
import { query } from '../src/lib/db';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create a test user
    const userResult = await query(
      `INSERT INTO users (email, name, role) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING 
       RETURNING *`,
      ['admin@ecomjunction.com', 'Admin User', 'admin']
    );
    console.log('✅ User created:', userResult[0]?.email || 'Already exists');

    // Create a test store
    if (userResult[0]) {
      const storeResult = await query(
        `INSERT INTO stores (name, slug, description, owner_id) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (slug) DO NOTHING 
         RETURNING *`,
        ['Demo Store', 'demo-store', 'A demo store for testing', userResult[0].id]
      );
      console.log('✅ Store created:', storeResult[0]?.name || 'Already exists');

      // Create test products
      if (storeResult[0]) {
        const products = [
          { name: 'Test Product 1', price: 29.99, inventory: 100 },
          { name: 'Test Product 2', price: 49.99, inventory: 50 },
          { name: 'Test Product 3', price: 99.99, inventory: 25 },
        ];

        for (const product of products) {
          await query(
            `INSERT INTO products (store_id, name, description, price, inventory, status) 
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT DO NOTHING`,
            [storeResult[0].id, product.name, `Description for ${product.name}`, product.price, product.inventory, 'active']
          );
        }
        console.log('✅ Products created');
      }
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
