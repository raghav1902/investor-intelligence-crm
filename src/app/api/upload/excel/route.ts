import { NextRequest, NextResponse } from 'next/server';
import { parseAndImportExcel } from '@/lib/excel-parser';
import { runFuzzyMatchAndDedup } from '@/lib/matcher';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';
import { getAuthorizedWorkspaceId } from '@/lib/auth-workspace';

// Large Excel files can take >30s to parse and insert 10k rows
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  // ✅ Rate limit: 5 Excel uploads per IP per minute (heavy DB operation)
  const ip = getClientIp(req);
  const { allowed: rateAllowed, resetAt } = await rateLimit(ip, 'upload-excel', 5, 60_000);
  if (!rateAllowed) {
    return NextResponse.json(
      { error: 'Too many uploads. Please wait a minute before uploading again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const workspaceId = await getAuthorizedWorkspaceId(req);
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    const { checkAndIncrementScanLimit } = require('@/lib/subscription');
    // For Excel uploads, we aren't enforcing a strict premium requirement just to upload,
    // but we use the flag to determine if custom fields should be parsed.
    // However, wait, the API was already blocking Free users if they exhausted limit.
    const { allowed: limitAllowed, reason } = await checkAndIncrementScanLimit(workspaceId, false);
    if (!limitAllowed) {
      return NextResponse.json(
        { error: reason === 'PREMIUM_REQUIRED' ? 'This is a premium feature.' : 'Usage limit reached. Upgrade to Premium for unlimited scans.' },
        { status: 403 }
      );
    }
    
    // Check if the user is actually premium to pass the flag
    const { getSubscriptionStatus } = require('@/lib/subscription');
    const subStatus = await getSubscriptionStatus(workspaceId);
    const isPremium = subStatus.plan === 'premium';

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await parseAndImportExcel(buffer, workspaceId, file.name, isPremium);
    
    return NextResponse.json({
      success: true,
      message: `Successfully imported ${result.imported} contacts out of ${result.total} rows.`,
      ...result,
    });
  } catch (error: any) {
    console.error('Excel upload error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process Excel file' }, { status: 500 });
  }
}
