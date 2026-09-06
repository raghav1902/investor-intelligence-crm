'use client';

import React, { useRef } from 'react';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface ImageUploadSectionProps {
  imageFile: File | null;
  setImageFile: (f: File | null) => void;
  loading: boolean;
  subStatus: { plan: string; scansUsed: number; scansLimit: number | null };
  onScan: () => void;
}

export default function ImageUploadSection({
  imageFile,
  setImageFile,
  loading,
  subStatus,
  onScan,
}: ImageUploadSectionProps) {
  const { toast } = useToast();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [dragImage, setDragImage] = React.useState(false);

  const isLimitReached =
    subStatus.plan === 'free' &&
    subStatus.scansLimit !== null &&
    subStatus.scansUsed >= subStatus.scansLimit;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragImage(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name))) {
      setImageFile(file);
    } else {
      toast('error', 'Invalid File Type', 'Please upload a valid image file.');
    }
  };

  return (
    <div className="rounded-xl border border-teal-800/60 bg-teal-950/30 p-4 transition-colors">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-teal-900/50 p-2 text-teal-400 border border-teal-800">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-content-primary">Free Tier: Image OCR</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300 uppercase">
                Client-side Tesseract.js
              </span>
            </div>
            <p className="text-xs text-content-secondary">Scan single image cards (.png, .jpg, .webp)</p>
          </div>
        </div>
        <span
          className={`text-xs font-bold px-2 py-1 rounded-md ${
            isLimitReached ? 'bg-rose-900/40 text-rose-300' : 'bg-teal-900/40 text-teal-300'
          }`}
        >
          {subStatus.plan === 'premium' ? 'Unlimited' : `${subStatus.scansUsed}/${subStatus.scansLimit} Used`}
        </span>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => {
          if (!isLimitReached) imageInputRef.current?.click();
        }}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 ${
          isLimitReached
            ? 'opacity-50 cursor-not-allowed border-hairline bg-surface-300'
            : dragImage
            ? 'border-teal-500 bg-teal-500/5 shadow-[0_0_15px_rgba(20,184,166,0.05)]'
            : imageFile
            ? 'border-teal-500 bg-teal-500/5'
            : 'border-hairline bg-surface-100 hover:border-teal-500/20'
        }`}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          disabled={isLimitReached}
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setImageFile(f);
          }}
        />
        <div className="flex flex-col items-center justify-center gap-1">
          <Upload className={`h-6 w-6 mb-1 ${imageFile ? 'text-teal-500' : 'text-content-muted'}`} />
          <p className="text-xs font-semibold text-content-primary">
            {imageFile ? imageFile.name : 'Drag & drop image here, or click to browse'}
          </p>
          <p className="text-[10px] text-content-secondary">
            {imageFile ? `${(imageFile.size / 1024).toFixed(1)} KB` : 'Supports PNG, JPG, WEBP'}
          </p>
        </div>
      </div>

      {imageFile && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={onScan}
            disabled={loading}
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500 disabled:opacity-50 shadow-xs"
          >
            Scan Image
          </button>
        </div>
      )}
    </div>
  );
}
