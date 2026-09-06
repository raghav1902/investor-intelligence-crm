'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

export interface ReviewFormData {
  firstName: string;
  lastName: string;
  fullName: string;
  title: string;
  sectorCoverage: string;
  company: string;
  email: string;
  reviewerComment: string;
}

interface ReviewFormFieldsProps {
  formData: ReviewFormData;
  setFormData: React.Dispatch<React.SetStateAction<ReviewFormData>>;
}

export default function ReviewFormFields({ formData, setFormData }: ReviewFormFieldsProps) {
  return (
    <div className="space-y-4 rounded-xl border border-hairline bg-surface-200 p-5 shadow-xs transition-colors">
      <h3 className="text-sm font-bold text-content-primary flex items-center gap-2 border-b border-hairline pb-3">
        <Sparkles className="h-4 w-4" />
        1. Excel Record Data (Editable)
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-content-muted mb-1">First Name</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData((prev) => ({ ...prev, firstName: e.target.value }))}
            className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-content-muted mb-1">Last Name</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData((prev) => ({ ...prev, lastName: e.target.value }))}
            className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">Full Name</label>
        <input
          type="text"
          value={formData.fullName}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
          className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm font-medium text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">Company / Asset Manager</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
          className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm font-bold text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">
          Email Address (Check OCR artifacts like &apos;1&apos; vs &apos;_&apos;)
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm font-mono font-semibold text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-content-muted mb-1">Verified Title / Role</label>
          <input
            type="text"
            value={formData.title}
            placeholder="e.g. Portfolio Manager"
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-content-muted mb-1">Sector Coverage</label>
          <select
            value={formData.sectorCoverage}
            onChange={(e) => setFormData((prev) => ({ ...prev, sectorCoverage: e.target.value }))}
            className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-sm text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs font-medium"
          >
            <option value="UNCONFIRMED">⏳ Unconfirmed / Pending</option>
            <option value="ENERGY">⚡ Energy</option>
            <option value="POWER">🔋 Power</option>
            <option value="RENEWABLES">🌱 Renewables</option>
            <option value="INDUSTRIALS">🏭 Industrials</option>
            <option value="OTHER">🚫 Other (Not Target)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-content-muted mb-1">
          Reviewer Note (Will export as native Excel cell comment)
        </label>
        <textarea
          rows={2}
          value={formData.reviewerComment}
          placeholder="Add notes on career moves, missing emails, or sector confirmation..."
          onChange={(e) => setFormData((prev) => ({ ...prev, reviewerComment: e.target.value }))}
          className="w-full rounded-lg border border-hairline bg-surface-100 px-3 py-2 text-xs text-content-primary focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs"
        />
      </div>
    </div>
  );
}
