'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import StatsBar from '@/components/StatsBar';
import { useDashboardData } from '@/hooks/useDashboardData';

// Sub-components
import DemoBanner from '@/components/dashboard/DemoBanner';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import BulkActionsBar from '@/components/dashboard/BulkActionsBar';
import ContactsTable from '@/components/dashboard/ContactsTable';
import DashboardModals from '@/components/dashboard/DashboardModals';

function DashboardContent() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Layout & Modal UI state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [selectedDedup, setSelectedDedup] = useState<any | null>(null);
  const [showDemoBanner, setShowDemoBanner] = useState(false);

  // Dashboard Data Hook
  const {
    session,
    searchParams,
    contacts,
    setContacts,
    stats,
    setStats,
    pagination,
    setPagination,
    activeFilter,
    setActiveFilter,
    sectorFilter,
    setSectorFilter,
    searchQuery,
    setSearchQuery,
    isDuplicateFilter,
    setIsDuplicateFilter,
    loading,
    setLoading,
    isMatching,
    isExtracting,
    setIsExtracting,
    subStatus,
    sortBy,
    sortOrder,
    handleSort,
    upgradeModalOpen,
    setUpgradeModalOpen,
    upgradeTrigger,
    selectedIds,
    setSelectedIds,
    fetchContacts,
    handleUpdateContact,
    handleLoadDemoData,
    handleClearData,
    handleExport,
    executeExport,
    toggleSelectAll,
    toggleSelectOne,
    handleBulkStatusUpdate,
    handleBulkDelete,
    handleRunMatch,
    reloadContactsWithDefaults,
    toast,
    confirm,
  } = useDashboardData();

  // Demo Banner visibility
  useEffect(() => {
    if (!session && (searchParams?.get('demo') === 'true' || stats.total === 16)) {
      if (!sessionStorage.getItem('demoBannerDismissed')) {
        setShowDemoBanner(true);
      }
    } else if (session) {
      setShowDemoBanner(false);
    }
  }, [searchParams, stats.total, session]);

  // Keyboard Shortcuts: Ctrl+K or '/' focuses search; Esc closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && e.key === 'k') ||
        (e.key === '/' &&
          document.activeElement !== searchInputRef.current &&
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsUploadOpen(false);
        setIsGuideOpen(false);
        setSelectedContact(null);
        setSelectedDedup(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-surface-base text-content-primary font-sans antialiased flex flex-col md:flex-row">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenSources={() => setIsSourcesOpen(true)}
        onLoadDemoData={handleLoadDemoData}
        onClearData={handleClearData}
        totalContacts={stats.total}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onRefresh={fetchContacts}
          onRunMatch={handleRunMatch}
          isRefreshing={loading}
          isMatching={isMatching}
          onExport={handleExport}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <DemoBanner
            showDemoBanner={showDemoBanner}
            setShowDemoBanner={setShowDemoBanner}
          />

          <StatsBar
            stats={stats}
            activeFilter={activeFilter}
            onSelectFilter={(status) => {
              setIsDuplicateFilter(false);
              setActiveFilter(status);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            onSelectDuplicates={() => {
              setIsDuplicateFilter((prev) => !prev);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            isDuplicateFilter={isDuplicateFilter}
          />

          <DashboardFilters
            searchInputRef={searchInputRef}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sectorFilter={sectorFilter}
            setSectorFilter={setSectorFilter}
            setPagination={setPagination}
          />

          <ContactsTable
            contacts={contacts}
            loading={loading}
            selectedIds={selectedIds}
            toggleSelectAll={toggleSelectAll}
            toggleSelectOne={toggleSelectOne}
            setSelectedContact={setSelectedContact}
            setSelectedDedup={setSelectedDedup}
            handleLoadDemoData={handleLoadDemoData}
            setIsUploadOpen={setIsUploadOpen}
            pagination={pagination}
            setPagination={setPagination}
            subPlan={subStatus.plan}
            sortBy={sortBy}
            sortOrder={sortOrder}
            handleSort={handleSort}
          />
        </main>

        <BulkActionsBar
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          handleBulkStatusUpdate={handleBulkStatusUpdate}
          handleBulkDelete={handleBulkDelete}
        />

        <DashboardModals
          upgradeModalOpen={upgradeModalOpen}
          setUpgradeModalOpen={setUpgradeModalOpen}
          upgradeTrigger={upgradeTrigger}
          onUpgradeContinue={() => {
            setUpgradeModalOpen(false);
            executeExport();
          }}
          isUploadOpen={isUploadOpen}
          setIsUploadOpen={setIsUploadOpen}
          onUploadSuccess={async () => {
            setIsUploadOpen(false);
            await reloadContactsWithDefaults();
          }}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          onUpdateContact={handleUpdateContact}
          selectedDedup={selectedDedup}
          setSelectedDedup={setSelectedDedup}
          onDedupUpdate={async () => {
            await reloadContactsWithDefaults();
          }}
          isGuideOpen={isGuideOpen}
          setIsGuideOpen={setIsGuideOpen}
          isSourcesOpen={isSourcesOpen}
          setIsSourcesOpen={setIsSourcesOpen}
          onRefreshContacts={fetchContacts}
        />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-surface-base text-content-muted">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
