// Webhook handler for Clerk events
import { query } from '@/lib/db';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: Request) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const { type, data } = evt;

  try {
    switch (type) {
      case 'user.created': {
        await query(
          `INSERT INTO users (id, email, name, avatar, role)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (id) DO NOTHING`,
          [
            data.id,
            data.email_addresses[0]?.email_address,
            `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email_addresses[0]?.email_address?.split('@')[0],
            data.image_url,
            'customer',
          ]
        );
        console.log('✅ User created in database:', data.id);
        break;
      }

      case 'user.updated': {
        await query(
          `UPDATE users 
           SET email = $1, name = $2, avatar = $3, updated_at = NOW()
           WHERE id = $4`,
          [
            data.email_addresses[0]?.email_address,
            `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email_addresses[0]?.email_address?.split('@')[0],
            data.image_url,
            data.id,
          ]
        );
        console.log('✅ User updated in database:', data.id);
        break;
      }

      case 'user.deleted': {
        await query(
          'DELETE FROM users WHERE id = $1',
          [data.id]
        );
        console.log('✅ User deleted from database:', data.id);
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}