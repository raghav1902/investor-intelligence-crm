import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IWorkspace extends Document {
  workspaceId: string;
  scansUsedThisCycle: number;
  scansLimit: number;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema = new Schema(
  {
    workspaceId: { type: String, required: true, unique: true, index: true },
    scansUsedThisCycle: { type: Number, default: 0 },
    scansLimit: { type: Number, default: 5 },
  },
  {
    timestamps: true,
  }
);

const Workspace: Model<IWorkspace> = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

export default Workspace;
