'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ToastProvider';
import { getWorkspaceId } from '@/lib/workspace';

export function useDashboardData() {
  const { data: session, status } = useSession();
  const { toast, confirm } = useToast();
  const searchParams = useSearchParams();

  const [contacts, setContacts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unreviewed: 0,
    yellow: 0,
    red: 0,
    green: 0,
    duplicates: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  // Filter States
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDuplicateFilter, setIsDuplicateFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Subscription Status
  const [subStatus, setSubStatus] = useState<{
    plan: string;
    scansUsed: number;
    scansLimit: number | null;
  }>({ plan: 'free', scansUsed: 0, scansLimit: 5 });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<
    'limit_reached' | 'premium_feature' | 'export_nudge'
  >('export_nudge');

  // Bulk Actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchSubscriptionStatus = useCallback(() => {
    fetch('/api/subscription/status', {
      headers: { 'x-workspace-id': getWorkspaceId() },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.plan) setSubStatus(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus, status]);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: activeFilter,
        sector: sectorFilter,
        search: debouncedSearch,
      });

      if (isDuplicateFilter) {
        params.set('isDuplicate', 'true');
      }

      const res = await fetch(`/api/contacts?${params.toString()}`, {
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();

      if (res.ok) {
        setContacts(data.contacts || []);
        setStats(data.stats || stats);
        setPagination(data.pagination || pagination);
        setSelectedIds(new Set());
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, activeFilter, sectorFilter, debouncedSearch, isDuplicateFilter]);

  // Sync guest contacts to user account on login
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const userId = (session.user as any).id;
      const currentWorkspaceId = localStorage.getItem('workspaceId');

      if (currentWorkspaceId && currentWorkspaceId !== userId && currentWorkspaceId.length > 24) {
        fetch('/api/contacts/migrate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ guestWorkspaceId: currentWorkspaceId }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.migratedCount > 0) {
              toast('success', 'Contacts Synced!', `${data.message} Your data is now saved to your account.`);
            }
            localStorage.setItem('workspaceId', userId);
            fetchContacts();
            fetchSubscriptionStatus();
          })
          .catch((err) => {
            console.error('Failed to migrate contacts:', err);
            localStorage.setItem('workspaceId', userId);
          });
      } else {
        localStorage.setItem('workspaceId', userId);
      }
    }
  }, [status, session, fetchContacts, fetchSubscriptionStatus, toast]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination((p) => ({ ...p, page: 1 }));
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleUpdateContact = (updated: any) => {
    setContacts((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
    fetchContacts();
  };

  const handleLoadDemoData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/demo-data', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();
      if (res.ok) {
        toast('success', 'Demo Data Loaded!', data.message);
        setActiveFilter('ALL');
        setSectorFilter('ALL');
        setSearchQuery('');
        setIsDuplicateFilter(false);

        const fetchRes = await fetch('/api/contacts?page=1&limit=50&status=ALL&sector=ALL', {
          headers: { 'x-workspace-id': getWorkspaceId() },
        });
        const fetchData = await fetchRes.json();
        if (fetchRes.ok) {
          setContacts(fetchData.contacts || []);
          setStats(fetchData.stats || stats);
          setPagination(fetchData.pagination || pagination);
        }
      } else {
        toast('error', 'Failed to Load Demo Data', data.error);
      }
    } catch (err: any) {
      toast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    confirm('Clear all contacts and PDF data for this workspace? This action will reset the app to zero records.', async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/contacts', {
          method: 'DELETE',
          headers: { 'x-workspace-id': getWorkspaceId() },
        });
        const data = await res.json();
        if (res.ok) {
          toast('success', 'Workspace Cleared', data.message);
          setContacts([]);
          setStats({ total: 0, unreviewed: 0, yellow: 0, red: 0, green: 0, duplicates: 0 });
          setPagination({ page: 1, limit: 50, total: 0, totalPages: 1 });
          setSelectedIds(new Set());
        } else {
          toast('error', 'Clear Failed', data.error);
        }
      } catch (err: any) {
        toast('error', 'Error', err.message);
      } finally {
        setLoading(false);
      }
    });
  };

  const executeExport = () => {
    const workspaceId = getWorkspaceId();
    if (!workspaceId) {
      alert('No workspace found. Please refresh the page and try again.');
      return;
    }
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 3000);
    window.location.href = `/api/export?workspaceId=${encodeURIComponent(workspaceId)}`;
  };

  const handleExport = () => {
    if (stats.total === 0) {
      toast('error', 'Workspace Empty', 'There is no data to export.');
      return;
    }
    if (subStatus.plan === 'free') {
      setUpgradeTrigger('export_nudge');
      setUpgradeModalOpen(true);
    } else {
      executeExport();
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === contacts.length && contacts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(contacts.map((c) => c._id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    try {
      const promises = Array.from(selectedIds).map((id) =>
        fetch(`/api/contacts/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-workspace-id': getWorkspaceId(),
          },
          body: JSON.stringify({ status, reviewerComment: `Bulk verified as ${status}` }),
        })
      );
      await Promise.all(promises);
      toast('success', `Updated ${selectedIds.size} Records`, `Marked contacts as ${status.replace('FLAGGED_', '').replace('RESOLVED_', '')}.`);
      fetchContacts();
    } catch (err: any) {
      toast('error', 'Bulk Update Failed', err.message);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    confirm(`Delete ${selectedIds.size} selected contacts? This action cannot be undone.`, async () => {
      try {
        const promises = Array.from(selectedIds).map((id) =>
          fetch(`/api/contacts/${id}`, {
            method: 'DELETE',
            headers: { 'x-workspace-id': getWorkspaceId() },
          })
        );
        await Promise.all(promises);
        toast('success', `Deleted ${selectedIds.size} Records`, 'Selected contacts removed.');
        fetchContacts();
      } catch (err: any) {
        toast('error', 'Bulk Delete Failed', err.message);
      }
    });
  };

  const handleRunMatch = async () => {
    if (stats.total === 0) {
      toast('error', 'Workspace Empty', 'There is no data to deduplicate.');
      return;
    }
    setIsMatching(true);
    try {
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to run deduplication');
      toast('success', 'Dedup Engine Complete', data.message);
      fetchContacts();
    } catch (err: any) {
      toast('error', 'Dedup Engine Failed', err.message);
    } finally {
      setIsMatching(false);
    }
  };

  const reloadContactsWithDefaults = async () => {
    setActiveFilter('ALL');
    setSectorFilter('ALL');
    setSearchQuery('');
    setIsDuplicateFilter(false);
    const fetchRes = await fetch('/api/contacts?page=1&limit=50&status=ALL&sector=ALL', {
      headers: { 'x-workspace-id': getWorkspaceId() },
    });
    const fetchData = await fetchRes.json();
    if (fetchRes.ok) {
      setContacts(fetchData.contacts || []);
      setStats(fetchData.stats || stats);
      setPagination(fetchData.pagination || pagination);
    }
  };

  return {
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
    isExporting,
    subStatus,
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
  };
}
