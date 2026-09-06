import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Retrieves the authorized workspace ID for the request.
 * If the user is authenticated, it returns their database User ID.
 * If the user is a guest, it returns the workspace ID passed in the headers.
 */
export async function getAuthorizedWorkspaceId(req: Request): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user && (session.user as any).id) {
      return (session.user as any).id;
    }
  } catch (error) {
    console.error('Error fetching session in getAuthorizedWorkspaceId:', error);
  }
  
  // Fallback to header for guest/unauthenticated users
  const workspaceHeader = req.headers.get('x-workspace-id');
  if (!workspaceHeader) return null;

  // Security: check if the client-provided header matches a registered user's ID
  if (mongoose.Types.ObjectId.isValid(workspaceHeader)) {
    try {
      await connectDB();
      const isRegisteredUser = await User.exists({ _id: workspaceHeader });
      if (isRegisteredUser) {
        console.warn(`⚠️ BOLA prevention: Blocked unauthenticated attempt to access registered user workspace: ${workspaceHeader}`);
        return null;
      }
    } catch (err) {
      console.error('Error checking user existence in getAuthorizedWorkspaceId:', err);
      return null;
    }
  } else if (!UUID_REGEX.test(workspaceHeader)) {
    // SECURITY FIX: If it's not a valid ObjectId and not a valid UUID, block it to prevent guessable IDORs.
    console.warn(`⚠️ Invalid workspace ID format: ${workspaceHeader}`);
    return null;
  }

  return workspaceHeader;
}
