import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Square, Sparkles, Database, FileText, Check, AlertTriangle, AlertCircle, HelpCircle, Copy, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

interface ContactsTableProps {
  contacts: any[];
  loading: boolean;
  selectedIds: Set<string>;
  toggleSelectAll: () => void;
  toggleSelectOne: (id: string, e: React.MouseEvent) => void;
  setSelectedContact: (contact: any) => void;
  setSelectedDedup: (contact: any) => void;
  handleLoadDemoData: () => void;
  setIsUploadOpen: (val: boolean) => void;
  pagination: any;
  setPagination: (updater: (prev: any) => any) => void;
}

export default function ContactsTable({
  contacts,
  loading,
  selectedIds,
  toggleSelectAll,
  toggleSelectOne,
  setSelectedContact,
  setSelectedDedup,
  handleLoadDemoData,
  setIsUploadOpen,
  pagination,
  setPagination,
}: ContactsTableProps) {
  return (
    <div className="rounded-lg border border-hairline bg-surface-100 overflow-hidden transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs whitespace-nowrap min-w-[1000px]">
          <thead className="border-b border-hairline bg-surface-200 tracking-tight text-content-secondary font-medium transition-colors">
            <tr>
              <th className="px-3 py-3.5 w-10 text-center">
                <button onClick={toggleSelectAll} className="text-content-secondary hover:text-content-primary transition">
                  {selectedIds.size > 0 && selectedIds.size === contacts.length ? (
                    <CheckSquare className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3.5 w-16">Row #</th>
              <th className="px-4 py-3.5">First Name</th>
              <th className="px-4 py-3.5">Last Name</th>
              <th className="px-4 py-3.5">Full Name</th>
              <th className="px-4 py-3.5">Company</th>
              <th className="px-4 py-3.5">Email</th>
              <th className="px-4 py-3.5">Email Domain</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Dedup / Notes</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hairline">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-hairline animate-pulse">
                  <td className="px-3 py-4 w-10 text-center">
                    <div className="h-4 w-4 bg-surface-200 rounded mx-auto" />
                  </td>
                  <td className="px-3 py-4 w-16">
                    <div className="h-4 w-8 bg-surface-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-16 bg-surface-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-16 bg-surface-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 bg-surface-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-24 bg-surface-200 rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-36 bg-surface-200 rounded font-mono" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-20 bg-surface-200 rounded font-mono" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-5 w-16 bg-surface-200 rounded-full" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="h-4 w-32 bg-surface-200 rounded" />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="h-7 w-12 bg-surface-200 rounded ml-auto" />
                  </td>
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-0 whitespace-normal">
                  <div className="flex flex-col items-center justify-center py-20 text-center whitespace-normal">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-200 border border-hairline">
                        <Sparkles className="h-6 w-6 text-emerald-500" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium text-content-primary mb-2 tracking-tight">Ready to import your investor list</h3>
                    <p className="text-sm text-content-secondary mb-10 max-w-md">
                      Upload your Excel workbook and source PDF, or load sample demo data for an instant demonstration.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                      <button
                        onClick={handleLoadDemoData}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-medium text-[#010102] hover:bg-emerald-400 transition-colors"
                      >
                        <Database className="h-4 w-4" />
                        Load Sample Demo Data (16 Records)
                      </button>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-transparent px-6 py-2.5 text-xs font-medium text-content-primary border border-hairline hover:bg-surface-200 transition-colors"
                      >
                        <FileText className="h-4 w-4 text-emerald-500" />
                        Upload Your Own Files
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left mt-4">
                      <div className="rounded-lg border border-hairline bg-surface-100 hover:bg-surface-200 p-5 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-300 text-content-primary text-[10px] font-bold">1</span>
                          <span className="text-xs font-medium text-content-primary tracking-tight">Upload Sources</span>
                        </div>
                        <p className="text-xs text-content-secondary leading-relaxed whitespace-normal break-words">Import your contact list (Excel) or scan source files (PDF / Images).</p>
                      </div>
                      <div className="rounded-lg border border-hairline bg-surface-100 hover:bg-surface-200 p-5 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-300 text-content-primary text-[10px] font-bold">2</span>
                          <span className="text-xs font-medium text-content-primary tracking-tight">OCR &amp; AI Match</span>
                        </div>
                        <p className="text-xs text-content-secondary leading-relaxed whitespace-normal break-words">Tesseract (Free Image) or Gemini Vision (Premium PDF) auto-flags duplicate clusters.</p>
                      </div>
                      <div className="rounded-lg border border-hairline bg-surface-100 hover:bg-surface-200 p-5 transition-colors duration-300">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-surface-300 text-content-primary text-[10px] font-bold">3</span>
                          <span className="text-xs font-medium text-content-primary tracking-tight">Review &amp; Export</span>
                        </div>
                        <p className="text-xs text-content-secondary leading-relaxed whitespace-normal break-words">Review flagged contacts and export clean formatted .xlsx workbooks.</p>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => {
                const isChecked = selectedIds.has(contact._id);
                return (
                  <motion.tr
                    key={contact._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={() => setSelectedContact(contact)}
                    className={`cursor-pointer transition-colors duration-200 group border-b border-hairline last:border-0 ${
                      isChecked ? 'bg-surface-300' :
                      'hover:bg-surface-200'
                    }`}
                  >
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={(e) => toggleSelectOne(contact._id, e)}
                        className="text-content-muted hover:text-content-primary transition"
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Square className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                        )}
                      </button>
                    </td>

                    <td className="px-3 py-3 font-mono text-content-muted">
                      #{contact.sourceRowNumber}
                    </td>
                    
                    <td className="px-4 py-3 font-medium text-content-primary">
                      {contact.firstName}
                    </td>

                    <td className="px-4 py-3 font-medium text-content-primary">
                      {contact.lastName}
                    </td>
                    
                    <td className="px-4 py-3 font-medium text-content-primary">
                      {contact.fullName}
                    </td>
                    
                    <td className="px-4 py-3 text-content-primary font-medium">
                      {contact.company}
                    </td>
                    
                    <td className="px-4 py-3 font-medium text-content-secondary">
                      {contact.email || <span className="text-content-muted italic">No email</span>}
                    </td>
                    
                    <td className="px-4 py-3 font-medium text-content-secondary">
                      {contact.emailDomain ? (
                        <a href={`http://${contact.emailDomain}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-content-primary transition-colors">
                          {contact.emailDomain}
                        </a>
                      ) : (
                        <span className="text-content-muted italic">N/A</span>
                      )}
                    </td>
                    
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        contact.status === 'RESOLVED_GREEN' ? 'bg-emerald-500/10 text-emerald-500' :
                        contact.status === 'FLAGGED_YELLOW' ? 'bg-amber-500/10 text-amber-500' :
                        contact.status === 'FLAGGED_RED' ? 'bg-red-500/10 text-red-500' :
                        'bg-surface-200 text-content-secondary'
                      }`}>
                        {contact.status === 'RESOLVED_GREEN' && <Check className="h-3 w-3" />}
                        {contact.status === 'FLAGGED_YELLOW' && <AlertTriangle className="h-3 w-3" />}
                        {contact.status === 'FLAGGED_RED' && <AlertCircle className="h-3 w-3" />}
                        {contact.status === 'UNREVIEWED' && <HelpCircle className="h-3 w-3" />}
                        <span>{contact.status.replace('FLAGGED_', '').replace('RESOLVED_', '')}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 max-w-[180px] truncate text-content-secondary font-normal">
                      {contact.isDuplicateOf && contact.isDuplicateOf.length > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedDedup(contact); }}
                          className="inline-flex items-center gap-1 rounded bg-surface-300 px-2 py-0.5 text-[10px] font-medium text-content-primary border border-hairline mr-2 transition-colors hover:bg-[#23252a]"
                        >
                          <Copy className="h-3 w-3" />
                          <span>Dedup ({contact.isDuplicateOf.length})</span>
                        </button>
                      )}
                      <span className="truncate" title={contact.reviewerComment}>
                        {contact.reviewerComment || contact.originalComments?.join(' ')}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedContact(contact); }}
                        className="inline-flex items-center gap-1 rounded bg-surface-200 px-3 py-1 font-medium text-content-primary hover:bg-surface-300 transition border border-hairline opacity-0 group-hover:opacity-100"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Review</span>
                      </button>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-hairline bg-surface-base px-6 py-4 transition-colors">
        <span className="text-xs text-content-secondary font-medium">
          {loading ? (
            <span className="text-content-muted">Loading...</span>
          ) : pagination.total === 0 ? (
            <span className="text-content-muted">No records</span>
          ) : (
            <>
              Showing{' '}
              <span className="font-medium text-content-primary">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
              to{' '}
              <span className="font-medium text-content-primary">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              of <span className="font-medium text-content-primary">{pagination.total.toLocaleString()}</span> records
            </>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
            disabled={pagination.page <= 1 || loading}
            className="inline-flex items-center gap-1 rounded border border-hairline bg-surface-100 px-3 py-1 text-xs font-medium text-content-primary hover:bg-surface-200 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-content-secondary" />
            <span>Prev</span>
          </button>
          <span className="text-xs font-medium text-content-secondary px-2">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>
          <button
            onClick={() => setPagination((p) => ({ ...p, page: Math.min(p.totalPages, p.page + 1) }))}
            disabled={pagination.page >= pagination.totalPages || loading}
            className="inline-flex items-center gap-1 rounded border border-hairline bg-surface-100 px-3 py-1 text-xs font-medium text-content-primary hover:bg-surface-200 disabled:opacity-50 transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 text-content-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
}
