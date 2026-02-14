// Register endpoint for JWT authentication
import { registerUser } from '@/lib/jwt';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(255),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    const result = await registerUser(email, password, name);
    
    if (!result) {
      return NextResponse.json(
        { error: 'User already exists or registration failed' },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: 'User registered successfully',
      user: result.user,
      token: result.token,
    }, { status: 201 });
  } catch (error) {
    console.error('Error in register endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
