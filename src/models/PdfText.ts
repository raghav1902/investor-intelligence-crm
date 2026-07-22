import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPdfText extends Document {
  workspaceId: string;
  pageNumber: number;
  lineIndex: number;
  rawText: string;
  normalizedText: string;
  createdAt: Date;
}

const PdfTextSchema: Schema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    pageNumber: { type: Number, required: true, index: true },
    lineIndex: { type: Number, required: true },
    rawText: { type: String, required: true },
    normalizedText: { type: String, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

PdfTextSchema.index({ normalizedText: 'text' });

const PdfText: Model<IPdfText> = mongoose.models.PdfText || mongoose.model<IPdfText>('PdfText', PdfTextSchema);

export default PdfText;
