import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContact extends Document {
  workspaceId: string;
  sourceRowNumber: number;
  firstName: string;
  lastName: string;
  fullName: string;
  company: string;
  email: string;
  emailDomain: string;
  originalComments: string[];
  
  // New Validated Fields
  title: string;
  sectorCoverage: 'ENERGY' | 'POWER' | 'RENEWABLES' | 'INDUSTRIALS' | 'OTHER' | 'UNCONFIRMED';
  
  // Workflow & Tracking Status
  status: 'UNREVIEWED' | 'FLAGGED_YELLOW' | 'FLAGGED_RED' | 'RESOLVED_GREEN';
  reviewerComment?: string;
  
  // Deduplication & OCR Analysis
  isDuplicateOf?: mongoose.Types.ObjectId[];
  ocrSimilarityScore?: number;
  matchedPdfSnippet?: string;
  
  // Metadata & Audit
  sourceFileName?: string;
  originalHighlightColor?: string; // Hex color from original Excel
  lastVerifiedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    sourceRowNumber: { type: Number, required: true, index: true },
    sourceFileName: { type: String, default: 'Manual / Batch Import', index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    fullName: { type: String, default: '', index: true },
    company: { type: String, default: '', index: true },
    email: { type: String, default: '', index: true },
    emailDomain: { type: String, default: '', index: true },
    originalComments: [{ type: String }],
    
    title: { type: String, default: 'Unverified Role' },
    sectorCoverage: {
      type: String,
      enum: ['ENERGY', 'POWER', 'RENEWABLES', 'INDUSTRIALS', 'OTHER', 'UNCONFIRMED'],
      default: 'UNCONFIRMED',
      index: true,
    },
    
    status: {
      type: String,
      enum: ['UNREVIEWED', 'FLAGGED_YELLOW', 'FLAGGED_RED', 'RESOLVED_GREEN'],
      default: 'UNREVIEWED',
      index: true,
    },
    reviewerComment: { type: String, default: '' },
    
    isDuplicateOf: [{ type: Schema.Types.ObjectId, ref: 'Contact', index: true }],
    ocrSimilarityScore: { type: Number, default: 0 },
    matchedPdfSnippet: { type: String, default: '' },
    
    originalHighlightColor: { type: String, default: null },
    lastVerifiedDate: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for the most common query patterns
// These are the difference between a fast CRM and a slow one at 10k+ records
ContactSchema.index({ workspaceId: 1, status: 1 });              // stats bar + filter
ContactSchema.index({ workspaceId: 1, sourceRowNumber: 1 });     // main table sort
ContactSchema.index({ workspaceId: 1, sectorCoverage: 1 });      // sector filter
ContactSchema.index({ workspaceId: 1, isDuplicateOf: 1 });       // duplicate filter
// Full-text search index
ContactSchema.index({ fullName: 'text', company: 'text', email: 'text' });

const Contact: Model<IContact> = mongoose.models.Contact || mongoose.model<IContact>('Contact', ContactSchema);

export default Contact;
