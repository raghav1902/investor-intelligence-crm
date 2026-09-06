import { NextRequest, NextResponse } from 'next/server';
import { runFuzzyMatchAndDedup } from '@/lib/matcher';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { getAuthorizedWorkspaceId } from '@/lib/auth-workspace';

// Fuzzy matching + dedup loads all contacts into RAM and does O(N²) work
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const workspaceId = await getAuthorizedWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    const clientIp = getClientIp(req);
    const identifier = `${clientIp}_${workspaceId}`;
    const { allowed, resetAt } = await rateLimit(identifier, 'match-dedup', 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Dedup engine is busy. Please wait before running it again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
      );
    }

    const result = await runFuzzyMatchAndDedup(workspaceId);
    return NextResponse.json({
      success: true,
      message: `Matched ${result.matchedCount} contacts against PDF. Detected ${result.duplicateGroups} duplicate groups.`,
      ...result,
    });
  } catch (error: any) {
    console.error('Fuzzy match trigger error:', error);
    return NextResponse.json({ error: error.message || 'Failed to run fuzzy matching' }, { status: 500 });
  }
}
