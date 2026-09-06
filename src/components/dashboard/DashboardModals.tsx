'use client';

import React from 'react';
import {
  UploadModal,
  ReviewModal,
  DedupModal,
  GuideModal,
  SourcesModal,
  UpgradeModal,
} from '@/components/modals';

interface DashboardModalsProps {
  // Upgrade Modal
  upgradeModalOpen: boolean;
  setUpgradeModalOpen: (open: boolean) => void;
  upgradeTrigger: 'limit_reached' | 'premium_feature' | 'export_nudge';
  onUpgradeContinue: () => void;

  // Upload Modal
  isUploadOpen: boolean;
  setIsUploadOpen: (open: boolean) => void;
  onUploadSuccess: () => void;

  // Review Modal
  selectedContact: any | null;
  setSelectedContact: (c: any | null) => void;
  onUpdateContact: (c: any) => void;

  // Dedup Modal
  selectedDedup: any | null;
  setSelectedDedup: (c: any | null) => void;
  onDedupUpdate: () => void;

  // Guide Modal
  isGuideOpen: boolean;
  setIsGuideOpen: (open: boolean) => void;

  // Sources Modal
  isSourcesOpen: boolean;
  setIsSourcesOpen: (open: boolean) => void;
  onRefreshContacts: () => void;
}

export default function DashboardModals({
  upgradeModalOpen,
  setUpgradeModalOpen,
  upgradeTrigger,
  onUpgradeContinue,
  isUploadOpen,
  setIsUploadOpen,
  onUploadSuccess,
  selectedContact,
  setSelectedContact,
  onUpdateContact,
  selectedDedup,
  setSelectedDedup,
  onDedupUpdate,
  isGuideOpen,
  setIsGuideOpen,
  isSourcesOpen,
  setIsSourcesOpen,
  onRefreshContacts,
}: DashboardModalsProps) {
  return (
    <>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onContinue={onUpgradeContinue}
        triggerType={upgradeTrigger}
      />

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={onUploadSuccess}
      />

      <ReviewModal
        contact={selectedContact}
        onClose={() => setSelectedContact(null)}
        onUpdate={onUpdateContact}
      />

      <DedupModal
        primaryContact={selectedDedup}
        onClose={() => setSelectedDedup(null)}
        onUpdate={onDedupUpdate}
      />

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <SourcesModal
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        onRefreshContacts={onRefreshContacts}
      />
    </>
  );
}
