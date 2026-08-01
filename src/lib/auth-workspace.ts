import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
  return workspaceHeader || null;
}
