'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Lock,
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  isOAuthAccount: boolean;
  createdAt: string;
}

// Reusable input styling
const inputCls =
  'w-full rounded-lg border border-hairline bg-surface-base px-3 py-2.5 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

// Section card wrapper
function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-hairline flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
          <Icon className="h-4 w-4 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-sm font-medium text-content-primary">{title}</h2>
          <p className="text-xs text-content-muted mt-0.5">{description}</p>
        </div>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

// Small inline feedback message
function Feedback({ type, message }: { type: 'success' | 'error'; message: string }) {
  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg text-xs mt-3 ${type === 'success'
          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
          : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}
    >
      {type === 'success' ? (
        <Check className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
      )}
      <span>{message}</span>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Profile form
  const [nameValue, setNameValue] = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load profile from API
  useEffect(() => {
    if (status !== 'authenticated') return;
    setProfileLoading(true);
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setNameValue(data.name ?? '');
      })
      .catch(() => {
        // silently fail — show whatever session has
        setNameValue(session?.user?.name ?? '');
      })
      .finally(() => setProfileLoading(false));
  }, [status, session]);

  const handleNameSave = async () => {
    setNameFeedback(null);
    setNameLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameFeedback({ type: 'error', msg: data.error || 'Failed to update name.' });
      } else {
        setNameFeedback({ type: 'success', msg: 'Name updated successfully.' });
      }
    } catch {
      setNameFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setNameLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordFeedback({ type: 'error', msg: data.error || 'Failed to update password.' });
      } else {
        setPasswordFeedback({ type: 'success', msg: data.message });
        // Clear fields on success
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPasswordFeedback({ type: 'error', msg: 'Network error. Please try again.' });
    } finally {
      setPasswordLoading(false);
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
      {/* Sticky header */}
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

        {/* ── PROFILE ─────────────────────────────────────────────────────── */}
        <Section icon={User} title="Profile" description="Your display name and account email.">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">Full name</label>
              <div className="flex gap-2">
                <input
                  id="settings-name"
                  type="text"
                  value={nameValue}
                  onChange={(e) => { setNameValue(e.target.value); setNameFeedback(null); }}
                  placeholder="Your name"
                  className={inputCls}
                />
                <button
                  id="settings-name-save"
                  onClick={handleNameSave}
                  disabled={nameLoading || !nameValue.trim() || nameValue.trim() === profile?.name}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-[#010102] hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                >
                  {nameLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save'}
                </button>
              </div>
              {nameFeedback && <Feedback type={nameFeedback.type} message={nameFeedback.msg} />}
            </div>

            <div>
              <label className="block text-xs font-medium text-content-secondary mb-1.5">
                Email address
                <span className="ml-2 text-content-muted font-normal">(read-only)</span>
              </label>
              <input
                type="email"
                value={profile?.email ?? session?.user?.email ?? ''}
                disabled
                className={inputCls}
              />
              <p className="text-[11px] text-content-muted mt-1.5">
                Email changes are not supported. Contact support if you need to update your email.
              </p>
            </div>

            {profile?.isOAuthAccount && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-surface-200 border border-hairline">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                <p className="text-xs text-content-secondary">
                  Signed in with Google — your identity is managed by Google.
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* ── SECURITY ────────────────────────────────────────────────────── */}
        <Section
          icon={Lock}
          title="Security"
          description="Change your password. Only available for email/password accounts."
        >
          {profile?.isOAuthAccount ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-surface-200 border border-hairline">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-content-primary">Managed by Google</p>
                <p className="text-xs text-content-muted mt-0.5">
                  Password management is handled through your Google account. Visit{' '}
                  <a
                    href="https://myaccount.google.com/security"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    Google Account Security
                  </a>{' '}
                  to manage your password.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Current password
                </label>
                <input
                  id="settings-current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  New password
                </label>
                <input
                  id="settings-new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-content-secondary mb-1.5">
                  Confirm new password
                </label>
                <input
                  id="settings-confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className={inputCls}
                />
              </div>

              {passwordFeedback && (
                <Feedback type={passwordFeedback.type} message={passwordFeedback.msg} />
              )}

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-content-muted">
                  Changing your password will sign out all other active sessions.
                </p>
                <button
                  id="settings-password-save"
                  type="submit"
                  disabled={passwordLoading}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-[#010102] hover:bg-emerald-400 disabled:opacity-50 transition-colors ml-4"
                >
                  {passwordLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    'Update password'
                  )}
                </button>
              </div>
            </form>
          )}
        </Section>

        {/* ── PLAN / SUBSCRIPTION ─────────────────────────────────────────── */}
        <Section
          icon={CreditCard}
          title="Plan & Subscription"
          description="Your current plan and billing options."
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-200 border border-hairline">
                <Sparkles className="h-4 w-4 text-content-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-content-primary">Free — Demo</p>
                <p className="text-xs text-content-muted mt-0.5">
                  Full feature access · No credit card required
                </p>
              </div>
            </div>

            <button
              id="settings-upgrade-btn"
              disabled
              title="Billing coming soon"
              className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-200 px-3.5 py-1.5 text-xs font-medium text-content-muted cursor-not-allowed opacity-60"
            >
              Upgrade Plan
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: 'Contacts', value: 'Unlimited' },
              { label: 'AI Dedup Runs', value: 'Unlimited' },
              { label: 'Team Members', value: '1 (you)' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-hairline bg-surface-base px-4 py-3"
              >
                <p className="text-[11px] text-content-muted uppercase tracking-widest">{item.label}</p>
                <p className="text-sm font-medium text-content-primary mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Member since */}
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
