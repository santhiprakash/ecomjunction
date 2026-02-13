// API route for products list and creation
import { query } from '@/lib/db';
import { syncUserWithDatabase } from '@/lib/auth';
import { Product } from '@/types';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const createProductSchema = z.object({
  storeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().optional(),
  images: z.array(z.string().url()).optional(),
  inventory: z.number().int().min(0).default(0),
  sku: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE status = $1';
    const params: any[] = [status];
    let paramIndex = 2;

    if (storeId) {
      whereClause += ` AND store_id = $${paramIndex}`;
      params.push(storeId);
      paramIndex++;
    }

    const products = await query<Product>(
      `SELECT * FROM products ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM products ${whereClause}`,
      params
    );

    const total = parseInt(countResult[0]?.count || '0');

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validation = createProductSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Verify user owns the store
    const storeCheck = await query<{ owner_id: string }>(
      'SELECT owner_id FROM stores WHERE id = $1',
      [data.storeId]
    );

    if (storeCheck.length === 0) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    if (storeCheck[0].owner_id !== userId) {
      return NextResponse.json(
        { error: 'Forbidden - You do not own this store' },
        { status: 403 }
      );
    }

    // Ensure user exists in database
    await syncUserWithDatabase(userId);

    const result = await query<Product>(
      `INSERT INTO products (store_id, name, description, price, compare_at_price, images, inventory, sku, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        data.storeId,
        data.name,
        data.description || null,
        data.price,
        data.compareAtPrice || null,
        data.images || [],
        data.inventory,
        data.sku || null,
        data.status,
      ]
    );

    return NextResponse.json({ product: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}