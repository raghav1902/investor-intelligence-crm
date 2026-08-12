import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

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
  }

  return workspaceHeader;
}
