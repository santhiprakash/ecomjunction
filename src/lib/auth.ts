import { clerkClient, currentUser } from '@clerk/nextjs/server';
import { query } from '@/lib/db';
import { User } from '@/types';

/**
 * Syncs a Clerk user with our database
 * Creates or updates the user record in NeonDB
 */
export async function syncUserWithDatabase(clerkUserId: string): Promise<User | null> {
  try {
    // Get user from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);
    
    if (!clerkUser) {
      console.error('Clerk user not found:', clerkUserId);
      return null;
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;
    const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email?.split('@')[0];
    const avatar = clerkUser.imageUrl;

    // Check if user exists in our database
    const existingUser = await query<User>(
      'SELECT * FROM users WHERE id = $1',
      [clerkUserId]
    );

    if (existingUser.length > 0) {
      // Update existing user
      const updated = await query<User>(
        `UPDATE users 
         SET email = $1, name = $2, avatar = $3, updated_at = NOW()
         WHERE id = $4
         RETURNING *`,
        [email, name, avatar, clerkUserId]
      );
      return updated[0];
    } else {
      // Create new user
      const created = await query<User>(
        `INSERT INTO users (id, email, name, avatar, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [clerkUserId, email, name, avatar, 'customer']
      );
      return created[0];
    }
  } catch (error) {
    console.error('Error syncing user with database:', error);
    return null;
  }
}

/**
 * Gets the current authenticated user from the database
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Sync with database to ensure user exists
    const dbUser = await syncUserWithDatabase(user.id);
    return dbUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Checks if the current user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const result = await query<{ role: string }>(
      'SELECT role FROM users WHERE id = $1',
      [userId]
    );
    return result[0]?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Checks if user owns a store
 */
export async function isStoreOwner(userId: string, storeId: string): Promise<boolean> {
  try {
    const result = await query<{ owner_id: string }>(
      'SELECT owner_id FROM stores WHERE id = $1',
      [storeId]
    );
    return result[0]?.owner_id === userId;
  } catch (error) {
    console.error('Error checking store ownership:', error);
    return false;
  }
}