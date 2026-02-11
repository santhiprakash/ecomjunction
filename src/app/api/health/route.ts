// API route for database health check
import { testConnection } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const isConnected = await testConnection();
  
  if (isConnected) {
    return NextResponse.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json(
    { 
      status: 'unhealthy',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    },
    { status: 503 }
  );
}
