import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPdfDocument extends Document {
  workspaceId: string;
  filename: string;
  fileData: Buffer;
  createdAt: Date;
}

const PdfDocumentSchema: Schema = new Schema(
  {
    workspaceId: { type: String, required: true, index: true },
    filename: { type: String, required: true },
    fileData: { type: Buffer, required: true },
  },
  {
    timestamps: true,
  }
);

const PdfDocument: Model<IPdfDocument> = mongoose.models.PdfDocument || mongoose.model<IPdfDocument>('PdfDocument', PdfDocumentSchema);

export default PdfDocument;
