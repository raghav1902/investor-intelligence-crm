'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getWorkspaceId } from '@/lib/workspace';
import { useToast } from '@/components/ToastProvider';
import Tesseract from 'tesseract.js';
import UpgradeModal from './UpgradeModal';
import ExcelUploadSection from '@/components/upload/ExcelUploadSection';
import ImageUploadSection from '@/components/upload/ImageUploadSection';
import PdfUploadSection from '@/components/upload/PdfUploadSection';
import { preprocessImage, parseContactsFromOcr } from '@/lib/ocr/imageOcrParser';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const { toast } = useToast();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [subStatus, setSubStatus] = useState<{
    plan: string;
    scansUsed: number;
    scansLimit: number | null;
  }>({ plan: 'free', scansUsed: 0, scansLimit: 5 });
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<
    'limit_reached' | 'premium_feature' | 'export_nudge'
  >('limit_reached');

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      fetch('/api/subscription/status', {
        headers: { 'x-workspace-id': getWorkspaceId() },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.plan) {
            setSubStatus(data);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUploadExcel = async () => {
    if (!excelFile) return;
    setLoading(true);
    setStatusMsg('Parsing and importing Excel workbook (10,000+ rows)...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', excelFile);

      const res = await fetch('/api/upload/excel', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload Excel');
      setStatusMsg(`✅ ${data.message}`);
      toast('success', 'Excel Imported!', data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImageFreeOcr = async () => {
    if (!imageFile) return;

    if (
      subStatus.plan === 'free' &&
      subStatus.scansLimit &&
      subStatus.scansUsed >= subStatus.scansLimit
    ) {
      setUpgradeTrigger('limit_reached');
      setUpgradeModalOpen(true);
      return;
    }

    setLoading(true);
    setStatusMsg('1/3 Preprocessing image (2x High-DPI Upscale)...');
    setErrorMsg(null);

    try {
      const processedImageUrl = await preprocessImage(imageFile);
      setStatusMsg('2/3 Running Tesseract OCR engine...');

      const result = await Tesseract.recognize(processedImageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setStatusMsg(`Scanning image with Tesseract.js: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      setStatusMsg('3/3 Parsing contacts & extracting tables...');
      const rawText = result.data.text || '';
      const words: any[] = (result.data as any).words || [];
      const parsedContacts = parseContactsFromOcr(rawText, words);

      if (parsedContacts.length === 0) {
        throw new Error(
          'No contact emails found in the image. Please make sure the image contains a table or list with valid email addresses.'
        );
      }

      const res = await fetch('/api/contacts/import-ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-workspace-id': getWorkspaceId(),
        },
        body: JSON.stringify({ contacts: parsedContacts }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save scanned contacts.');

      fetch('/api/subscription/status', {
        headers: { 'x-workspace-id': getWorkspaceId() },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d && d.plan) setSubStatus(d);
        })
        .catch(console.error);

      setStatusMsg(`✅ ${data.message}`);
      toast('success', 'Free Image OCR Complete', data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Client-side OCR processing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPdf = async () => {
    if (!pdfFile) return;

    if (subStatus.plan === 'free') {
      setUpgradeTrigger('premium_feature');
      setUpgradeModalOpen(true);
      return;
    }
    setLoading(true);
    setStatusMsg('Storing source PDF for Gemini Vision OCR...');
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', pdfFile);

      const res = await fetch('/api/upload/pdf', {
        method: 'POST',
        headers: { 'x-workspace-id': getWorkspaceId() },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to upload PDF');
      setStatusMsg(`✅ ${data.message}`);
      toast('success', 'PDF Stored & OCR Complete', data.message);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        triggerType={upgradeTrigger}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="w-full max-w-xl rounded-2xl border border-hairline bg-surface-100 p-6 shadow-2xl transition-colors max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <h2 className="text-lg font-bold text-content-primary flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-500" />
              Upload Sources &amp; OCR Engine
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-content-secondary hover:bg-surface-200 hover:text-content-primary transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 space-y-5">
            <ExcelUploadSection
              excelFile={excelFile}
              setExcelFile={setExcelFile}
              loading={loading}
              subPlan={subStatus.plan}
              onUpload={handleUploadExcel}
            />

            <ImageUploadSection
              imageFile={imageFile}
              setImageFile={setImageFile}
              loading={loading}
              subStatus={subStatus}
              onScan={handleUploadImageFreeOcr}
            />

            <PdfUploadSection
              pdfFile={pdfFile}
              setPdfFile={setPdfFile}
              loading={loading}
              subPlan={subStatus.plan}
              onUpload={handleUploadPdf}
            />

            {loading && (
              <div className="flex items-center gap-3 rounded-lg bg-surface-200 p-3 text-xs text-content-primary border border-hairline">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500 shrink-0" />
                <span className="font-medium">{statusMsg || 'Processing...'}</span>
              </div>
            )}

            {statusMsg && !loading && !errorMsg && (
              <div className="flex items-center gap-3 rounded-lg bg-emerald-900/20 p-3 text-xs text-emerald-300 border border-emerald-800/50">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-medium">{statusMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-3 rounded-lg bg-rose-900/20 p-3 text-xs text-rose-300 border border-rose-800/50">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span className="font-medium">{errorMsg}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end border-t border-hairline pt-4">
            <button
              onClick={onClose}
              className="rounded-lg bg-surface-200 px-4 py-2 text-sm font-semibold text-content-primary hover:bg-surface-300 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
