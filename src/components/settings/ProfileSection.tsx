'use client';

import React, { useState } from 'react';
import { User, ShieldCheck, Loader2 } from 'lucide-react';
import { Section, Feedback, inputCls } from './SettingsSection';

export interface UserProfile {
  name: string;
  email: string;
  image: string | null;
  isOAuthAccount: boolean;
  createdAt: string;
}

interface ProfileSectionProps {
  profile: UserProfile | null;
  userEmail?: string | null;
  onUpdateName: (newName: string) => Promise<{ success: boolean; error?: string }>;
}

export default function ProfileSection({
  profile,
  userEmail,
  onUpdateName,
}: ProfileSectionProps) {
  const [nameValue, setNameValue] = useState(profile?.name ?? '');
  const [nameLoading, setNameLoading] = useState(false);
  const [nameFeedback, setNameFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Sync if profile changes
  React.useEffect(() => {
    if (profile?.name) setNameValue(profile.name);
  }, [profile?.name]);

  const handleSave = async () => {
    setNameFeedback(null);
    setNameLoading(true);
    const result = await onUpdateName(nameValue);
    setNameLoading(false);
    if (result.success) {
      setNameFeedback({ type: 'success', msg: 'Name updated successfully.' });
    } else {
      setNameFeedback({ type: 'error', msg: result.error || 'Failed to update name.' });
    }
  };

  return (
    <Section icon={User} title="Profile" description="Your display name and account email.">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-content-secondary mb-1.5">Full name</label>
          <div className="flex gap-2">
            <input
              id="settings-name"
              type="text"
              value={nameValue}
              onChange={(e) => {
                setNameValue(e.target.value);
                setNameFeedback(null);
              }}
              placeholder="Your name"
              className={inputCls}
            />
            <button
              id="settings-name-save"
              onClick={handleSave}
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
            value={profile?.email ?? userEmail ?? ''}
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
  );
}
