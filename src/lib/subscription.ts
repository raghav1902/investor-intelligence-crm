import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Workspace from '@/models/Workspace';

export async function checkAndIncrementScanLimit(
  workspaceId: string,
  isPremiumFeature: boolean = false
): Promise<{ allowed: boolean; reason?: 'LIMIT_REACHED' | 'PREMIUM_REQUIRED' }> {
  await connectDB();

  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    // Authenticated User
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return { allowed: false, reason: 'LIMIT_REACHED' };
    }

    const isPremium = user.plan === 'premium';

    if (isPremiumFeature && !isPremium) {
      return { allowed: false, reason: 'PREMIUM_REQUIRED' };
    }

    if (!isPremium) {
      if (user.scansUsedThisCycle >= (user.scansLimit || 5)) {
        return { allowed: false, reason: 'LIMIT_REACHED' };
      }
      // Increment
      user.scansUsedThisCycle += 1;
      await user.save();
    }
    
    return { allowed: true };
  } else {
    // Guest User - uses Workspace model
    if (isPremiumFeature) {
      return { allowed: false, reason: 'PREMIUM_REQUIRED' };
    }

    let workspace = await Workspace.findOne({ workspaceId });
    if (!workspace) {
      workspace = await Workspace.create({ workspaceId });
    }

    if (workspace.scansUsedThisCycle >= (workspace.scansLimit || 5)) {
      return { allowed: false, reason: 'LIMIT_REACHED' };
    }

    workspace.scansUsedThisCycle += 1;
    await workspace.save();

    return { allowed: true };
  }
}

export async function getSubscriptionStatus(workspaceId: string) {
  await connectDB();
  const session = await getServerSession(authOptions);

  if (session?.user?.email) {
    const user = await User.findOne({ email: session.user.email });
    if (!user) return getGuestStatus(workspaceId);

    return {
      plan: user.plan || 'free',
      scansUsed: user.scansUsedThisCycle || 0,
      scansLimit: user.plan === 'premium' ? null : (user.scansLimit || 5),
      renewalDate: user.planExpiresAt || null,
      billingCycle: user.billingCycle || null,
    };
  }

  return getGuestStatus(workspaceId);
}

async function getGuestStatus(workspaceId: string) {
  let workspace = await Workspace.findOne({ workspaceId });
  if (!workspace) {
    workspace = await Workspace.create({ workspaceId });
  }

  return {
    plan: 'free',
    scansUsed: workspace.scansUsedThisCycle || 0,
    scansLimit: workspace.scansLimit || 5,
    renewalDate: null,
    billingCycle: null,
  };
}
