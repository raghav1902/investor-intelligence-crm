'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, Sparkles, ChevronRight } from 'lucide-react';
import { Section } from './SettingsSection';

export interface SubscriptionStatus {
  plan: 'free' | 'premium';
  scansUsed: number;
  scansLimit: number | null;
  renewalDate: string | null;
  billingCycle: 'monthly' | 'yearly' | null;
}

interface SubscriptionSectionProps {
  subStatus: SubscriptionStatus | null;
}

export default function SubscriptionSection({ subStatus }: SubscriptionSectionProps) {
  return (
    <Section
      icon={CreditCard}
      title="Plan & Subscription"
      description="Your current plan and billing options."
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-content-primary capitalize">
              {subStatus?.plan || 'Free'} Plan
            </p>
            <p className="text-xs text-content-muted mt-0.5">
              {subStatus?.plan === 'premium'
                ? 'Unlimited PDF and image scans.'
                : '5 free image scans limit.'}
            </p>
          </div>
        </div>

        {subStatus?.plan === 'premium' ? (
          <button
            id="settings-manage-billing-btn"
            className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-surface-200 px-3.5 py-1.5 text-xs font-medium text-content-primary hover:bg-surface-300 transition-colors"
            onClick={() => alert('Manage Billing placeholder')}
          >
            Manage Billing
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        ) : (
          <Link
            href="/pricing"
            id="settings-upgrade-btn"
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#010102] hover:bg-emerald-400 transition-colors shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          >
            Upgrade to Premium
          </Link>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-hairline bg-surface-base px-4 py-3">
          <p className="text-[11px] text-content-muted uppercase tracking-widest">Scans Used</p>
          <p className="text-sm font-medium text-content-primary mt-1">
            {subStatus?.plan === 'premium'
              ? 'Unlimited'
              : `${subStatus?.scansUsed || 0} / ${subStatus?.scansLimit || 5}`}
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-surface-base px-4 py-3">
          <p className="text-[11px] text-content-muted uppercase tracking-widest">Billing Cycle</p>
          <p className="text-sm font-medium text-content-primary mt-1 capitalize">
            {subStatus?.billingCycle || 'N/A'}
          </p>
        </div>
        <div className="rounded-lg border border-hairline bg-surface-base px-4 py-3">
          <p className="text-[11px] text-content-muted uppercase tracking-widest">Renewal Date</p>
          <p className="text-sm font-medium text-content-primary mt-1">
            {subStatus?.renewalDate
              ? new Date(subStatus.renewalDate).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
      </div>
    </Section>
  );
}
