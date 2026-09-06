'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { Section, Feedback, inputCls } from './SettingsSection';

interface SecuritySectionProps {
  isOAuthAccount?: boolean;
  onUpdatePassword: (
    cur: string,
    next: string,
    conf: string
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export default function SecuritySection({
  isOAuthAccount,
  onUpdatePassword,
}: SecuritySectionProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', msg: 'New password and confirmation do not match.' });
      return;
    }

    setPasswordLoading(true);
    const result = await onUpdatePassword(currentPassword, newPassword, confirmPassword);
    setPasswordLoading(false);

    if (result.success) {
      setPasswordFeedback({ type: 'success', msg: result.message || 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordFeedback({ type: 'error', msg: result.error || 'Failed to update password.' });
    }
  };

  return (
    <Section
      icon={Lock}
      title="Security"
      description="Change your password. Only available for email/password accounts."
    >
      {isOAuthAccount ? (
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
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 gap-4">
            <p className="text-[11px] text-content-muted">
              Changing your password will sign out all other active sessions.
            </p>
            <button
              id="settings-password-save"
              type="submit"
              disabled={passwordLoading}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-medium text-[#010102] hover:bg-emerald-400 disabled:opacity-50 transition-colors sm:ml-4"
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
  );
}
