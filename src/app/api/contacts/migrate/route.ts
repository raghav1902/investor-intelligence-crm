import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/db';
import Contact from '@/models/Contact';
import PdfDocument from '@/models/PdfDocument';
import PdfText from '@/models/PdfText';
import { runFuzzyMatchAndDedup } from '@/lib/matcher';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id as string;
    const body = await req.json();
    const { guestWorkspaceId } = body;

    if (!guestWorkspaceId || guestWorkspaceId === userId) {
      return NextResponse.json({ success: true, message: 'No migration needed.' });
    }

    // SECURITY FIX: Enforce that guest workspaces MUST be UUIDs. 
    // This prevents attackers from guessing short or sequential strings to hijack workspaces.
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!UUID_REGEX.test(guestWorkspaceId)) {
      return NextResponse.json({ error: 'Unauthorized: Invalid guest workspace format.' }, { status: 403 });
    }

    await connectDB();

    // Security check: Verify the source guest workspace is not actually a registered user's workspace
    if (mongoose.Types.ObjectId.isValid(guestWorkspaceId)) {
      const isRegisteredUser = await User.exists({ _id: guestWorkspaceId });
      if (isRegisteredUser) {
        return NextResponse.json({ error: 'Unauthorized: Cannot migrate from a registered user workspace.' }, { status: 403 });
      }
    }

    // Check if the guest workspace actually has contacts to migrate
    const guestContactsCount = await Contact.countDocuments({ workspaceId: guestWorkspaceId });
    if (guestContactsCount === 0) {
      return NextResponse.json({ success: true, message: 'No guest contacts found to migrate.' });
    }

    console.log(`📦 Migrating guest workspace ${guestWorkspaceId} to user workspace ${userId}...`);

    // Migrate Contacts
    await Contact.updateMany({ workspaceId: guestWorkspaceId }, { $set: { workspaceId: userId } });

    // Migrate PdfDocument and PdfText if guest uploaded one
    const guestPdf = await PdfDocument.findOne({ workspaceId: guestWorkspaceId });
    if (guestPdf) {
      // Clear user's existing PDF data so they don't have multiples
      await PdfDocument.deleteMany({ workspaceId: userId });
      await PdfText.deleteMany({ workspaceId: userId });

      // Associate the guest PDF & text to user
      guestPdf.workspaceId = userId;
      await guestPdf.save();
      
      await PdfText.updateMany({ workspaceId: guestWorkspaceId }, { $set: { workspaceId: userId } });
    }

    // Run duplicate detection and matching on the merged workspace
    await runFuzzyMatchAndDedup(userId);

    console.log(`✅ Migration of guest workspace ${guestWorkspaceId} to ${userId} completed successfully.`);

    return NextResponse.json({
      success: true,
      message: `Successfully migrated ${guestContactsCount} contacts to your account.`,
      migratedCount: guestContactsCount
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message || 'Failed to migrate contacts' }, { status: 500 });
  }
}
