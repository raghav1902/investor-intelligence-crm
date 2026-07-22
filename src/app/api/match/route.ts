import { NextRequest, NextResponse } from 'next/server';
import { runFuzzyMatchAndDedup } from '@/lib/matcher';

export async function POST(req: NextRequest) {
  try {
    const result = await runFuzzyMatchAndDedup();
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
