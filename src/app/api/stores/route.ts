// API route for stores
import { query } from '@/lib/db';
import { NextResponse } from 'next/server';
import { Store } from '@/types';

export async function GET() {
  try {
    const stores = await query<Store>(
      'SELECT * FROM stores WHERE is_active = true ORDER BY created_at DESC'
    );
    return NextResponse.json({ stores });
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
    const body = await request.json();
    const { name, slug, description, ownerId } = body;

    const result = await query<Store>(
      `INSERT INTO stores (name, slug, description, owner_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [name, slug, description, ownerId]
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
