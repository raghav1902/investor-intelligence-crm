'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/ToastProvider';
import { ArrowLeft, Loader2 } from 'lucide-react';

import ProfileSection, { UserProfile } from '@/components/settings/ProfileSection';
import SecuritySection from '@/components/settings/SecuritySection';
import SubscriptionSection, { SubscriptionStatus } from '@/components/settings/SubscriptionSection';

function SettingsContent() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subStatus, setSubStatus] = useState<SubscriptionStatus | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Success Redirect Param Check (Stripe Callback)
  useEffect(() => {
    if (searchParams?.get('upgrade') === 'success') {
      toast('success', 'Plan Upgraded!', 'Congratulations! Your Premium subscription is now active.');
      router.replace('/settings');
    }
  }, [searchParams, toast, router]);

  // Authentication Protection Redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Concurrently fetch profile and subscription state
  useEffect(() => {
    if (status !== 'authenticated') return;
    setProfileLoading(true);

    const activeWorkspace = localStorage.getItem('workspaceId') || '';

    Promise.all([
      fetch('/api/settings').then((r) => r.json()),
      fetch('/api/subscription/status', {
        headers: { 'x-workspace-id': activeWorkspace },
      }).then((r) => r.json()),
    ])
      .then(([profileData, subData]) => {
        setProfile(profileData);
        if (subData?.plan) setSubStatus(subData);
      })
      .catch((err) => {
        console.error('Failed to load settings data:', err);
      })
      .finally(() => setProfileLoading(false));
  }, [status, session]);

  const handleUpdateName = async (name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update name.' };
      }
      if (profile) setProfile({ ...profile, name });
      await update({ name });
      return { success: true };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const handleUpdatePassword = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password.' };
      }
      return { success: true, message: data.message };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  if (status === 'loading' || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (status === 'unauthenticated') return null;

  return (
    <div className="min-h-screen bg-surface-base text-content-primary">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-hairline bg-surface-base">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-content-muted hover:text-content-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <span className="text-[#23252a]">/</span>
            <span className="text-xs font-medium text-content-primary">Settings</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500">
              <span className="text-[10px] font-bold text-[#010102]">IQ</span>
            </div>
            <span className="text-sm font-medium text-content-primary hidden sm:inline">InvestorIQ</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-6">
        <div className="mb-2">
          <h1 className="text-lg font-medium text-content-primary tracking-tight">Account Settings</h1>
          <p className="text-sm text-content-muted mt-0.5">Manage your profile, security, and subscription.</p>
        </div>

        <ProfileSection
          profile={profile}
          userEmail={session?.user?.email}
          onUpdateName={handleUpdateName}
        />

        <SecuritySection
          isOAuthAccount={profile?.isOAuthAccount}
          onUpdatePassword={handleUpdatePassword}
        />

        <SubscriptionSection subStatus={subStatus} />

        {profile?.createdAt && (
          <p className="text-center text-[11px] text-content-muted">
            Member since{' '}
            {new Date(profile.createdAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        )}
      </main>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-base">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
