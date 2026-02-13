// API route for stores list and creation
import { query } from '@/lib/db';
import { syncUserWithDatabase } from '@/lib/auth';
import { Store } from '@/types';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

const createStoreSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  logo: z.string().url().optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get('ownerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

    if (ownerId) {
      whereClause += ` AND owner_id = $${paramIndex}`;
      params.push(ownerId);
      paramIndex++;
    }

    const stores = await query<Store>(
      `SELECT * FROM stores ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset]
    );

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM stores ${whereClause}`,
      params
    );

    const total = parseInt(countResult[0]?.count || '0');

    return NextResponse.json({
      stores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
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
    const validation = createStoreSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if slug already exists
    const existingStore = await query<Store>(
      'SELECT id FROM stores WHERE slug = $1',
      [data.slug]
    );

    if (existingStore.length > 0) {
      return NextResponse.json(
        { error: 'A store with this slug already exists' },
        { status: 409 }
      );
    }

    // Ensure user exists in database
    await syncUserWithDatabase(userId);

    const result = await query<Store>(
      `INSERT INTO stores (name, slug, description, logo, owner_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        data.name,
        data.slug,
        data.description || null,
        data.logo || null,
        userId,
      ]
    );

    return NextResponse.json({ store: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating store:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}