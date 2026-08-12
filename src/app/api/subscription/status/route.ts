import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionStatus } from '@/lib/subscription';
import { getAuthorizedWorkspaceId } from '@/lib/auth-workspace';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const workspaceId = await getAuthorizedWorkspaceId(req);
    if (!workspaceId) {
      return NextResponse.json({ error: 'Workspace ID required / Unauthorized' }, { status: 400 });
    }

    const status = await getSubscriptionStatus(workspaceId);
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
