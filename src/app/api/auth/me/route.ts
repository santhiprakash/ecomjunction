// Get current user profile (works with both Clerk and JWT)
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserFromToken } from '@/lib/jwt';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { User } from '@/types';

export async function GET(request: Request) {
  try {
    // Try Clerk auth first
    const clerkUser = await getCurrentUser();
    if (clerkUser) {
      return NextResponse.json({ user: clerkUser });
    }

    // Try JWT auth
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await getUserFromToken(token);
      if (user) {
        return NextResponse.json({ user });
      }
    }

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    let userId: string | null = null;

    // Try Clerk auth first
    const clerkAuth = await auth();
    if (clerkAuth.userId) {
      userId = clerkAuth.userId;
    }

    // Try JWT auth if Clerk failed
    if (!userId) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const user = await getUserFromToken(token);
        if (user) {
          userId = user.id;
        }
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatar } = body;

    const result = await query<User>(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           avatar = COALESCE($2, avatar),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [name, avatar, userId]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user: result[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
