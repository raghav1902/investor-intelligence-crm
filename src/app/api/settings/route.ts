import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// In-memory rate limiter for PATCH (password-change) requests.
// Keyed by user ID. Stores { count, windowStart } per user.
// Limit: 5 attempts per 15-minute window.
// ---------------------------------------------------------------------------
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // First request or window has expired — start fresh
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfterMs = RATE_LIMIT_WINDOW_MS - (now - entry.windowStart);
    return { allowed: false, retryAfterMs };
  }

  entry.count += 1;
  return { allowed: true };
}

// ---------------------------------------------------------------------------
// GET /api/settings — Return current user's profile info
// ---------------------------------------------------------------------------
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById((session.user as any).id)
    .select('name email image password createdAt')
    .lean() as any;

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    image: user.image ?? null,
    // Tell the client whether this is an OAuth account (no password = Google/SSO)
    isOAuthAccount: !user.password,
    createdAt: user.createdAt,
  });
}

// ---------------------------------------------------------------------------
// PATCH /api/settings — Update name or change password
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // ── Security: explicitly reject any attempt to change email ──────────────
  if ('email' in body) {
    return NextResponse.json(
      { error: 'Email changes are not supported at this time.' },
      { status: 422 }
    );
  }

  await connectDB();

  const user = await User.findById(userId) as any;
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ── Handle name update ───────────────────────────────────────────────────
  if ('name' in body) {
    const name = String(body.name ?? '').trim();
    if (!name || name.length < 2 || name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters.' },
        { status: 400 }
      );
    }
    user.name = name;
    await user.save();
    return NextResponse.json({ message: 'Name updated successfully.' });
  }

  // ── Handle password change ───────────────────────────────────────────────
  if ('currentPassword' in body || 'newPassword' in body) {
    // Server-side block for OAuth accounts — don't rely on UI hiding this
    if (!user.password) {
      return NextResponse.json(
        {
          error:
            "Password changes aren't available for accounts signed in with Google/SSO.",
        },
        { status: 422 }
      );
    }

    // Rate-limit password-change attempts per user
    const { allowed, retryAfterMs } = checkRateLimit(userId);
    if (!allowed) {
      const retryAfterSecs = Math.ceil((retryAfterMs ?? RATE_LIMIT_WINDOW_MS) / 1000);
      return NextResponse.json(
        { error: 'Too many password change attempts. Please try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSecs) },
        }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    };

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Verify current password against bcrypt hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      // Generic message — do not reveal specifics
      return NextResponse.json(
        { error: 'Password update failed. Please check your current password and try again.' },
        { status: 401 }
      );
    }

    // Hash and save the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;

    // Stamp passwordChangedAt — this invalidates all JWTs issued before this moment,
    // forcing all other active sessions to sign in again (requirement 4).
    user.passwordChangedAt = new Date();

    await user.save();

    return NextResponse.json({
      message:
        'Password updated successfully. All other active sessions have been signed out.',
    });
  }

  return NextResponse.json({ error: 'No valid fields to update.' }, { status: 400 });
}
