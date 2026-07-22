import { NextRequest, NextResponse } from 'next/server';
import Contact from '@/models/Contact';
import { connectDB } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limiter';

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const { allowed, resetAt } = rateLimit(ip, 'demo-data', 5, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const workspaceId = req.headers.get('x-workspace-id');
    if (!workspaceId) return NextResponse.json({ error: 'Workspace ID required' }, { status: 400 });

    await connectDB();

    // Clear existing contacts for this workspace
    await Contact.deleteMany({ workspaceId });

    // Seed 16 realistic institutional investor contacts with duplicates & OCR flags
    const sampleContacts = [
      {
        workspaceId,
        sourceRowNumber: 1,
        firstName: 'Sarah',
        lastName: 'Jenkins',
        fullName: 'Sarah Jenkins',
        company: 'BlackRock',
        email: 's.jenkins@blackrock.com',
        emailDomain: 'blackrock.com',
        title: 'Managing Director, Energy Transition',
        sectorCoverage: 'RENEWABLES',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 98,
        matchedPdfSnippet: '[Page 4] Jenkins, Sarah - BlackRock (Managing Director) s.jenkins@blackrock.com',
        originalComments: ['Verified via LinkedIn Q2 2026'],
        reviewerComment: 'Confirmed current role leading $2B Renewables Fund.',
      },
      {
        workspaceId,
        sourceRowNumber: 2,
        firstName: 'Marcus',
        lastName: 'Vance',
        fullName: 'Marcus Vance',
        company: 'Citadel',
        email: 'marcus.vance@citadel.com',
        emailDomain: 'citadel.com',
        title: 'Portfolio Manager, Power & Utilities',
        sectorCoverage: 'POWER',
        status: 'FLAGGED_YELLOW',
        ocrSimilarityScore: 72,
        matchedPdfSnippet: '[Page 12] Vance, Marcus - Citadel LLC marcus_vance@citadel.com',
        originalComments: ['OCR Discrepancy: underscore vs dot in email address'],
        reviewerComment: 'Verify email format: OCR showed marcus_vance@citadel.com vs marcus.vance@citadel.com.',
      },
      {
        workspaceId,
        sourceRowNumber: 3,
        firstName: 'Marcus',
        lastName: 'Vance',
        fullName: 'Marcus Vance',
        company: 'Point72 Asset Management',
        email: 'mvance@point72.com',
        emailDomain: 'point72.com',
        title: 'Senior Analyst, Clean Tech',
        sectorCoverage: 'RENEWABLES',
        status: 'FLAGGED_YELLOW',
        ocrSimilarityScore: 85,
        matchedPdfSnippet: '[Page 12] Vance, M. - Point72 Asset Mgmt',
        originalComments: ['Potential Career Move / Firm Switch'],
        reviewerComment: 'Duplicate Name detected across Citadel and Point72. Verify active firm on LinkedIn.',
      },
      {
        workspaceId,
        sourceRowNumber: 4,
        firstName: 'Elena',
        lastName: 'Rostova',
        fullName: 'Elena Rostova',
        company: 'Brookfield Asset Management',
        email: 'elena.rostova@brookfield.com',
        emailDomain: 'brookfield.com',
        title: 'VP Infrastructure Investments',
        sectorCoverage: 'INDUSTRIALS',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 95,
        matchedPdfSnippet: '[Page 8] Rostova, Elena - Brookfield Infrastructure elena.rostova@brookfield.com',
        originalComments: ['Confirmed target coverage'],
        reviewerComment: 'Primary contact for European Industrials portfolio.',
      },
      {
        workspaceId,
        sourceRowNumber: 5,
        firstName: 'David',
        lastName: 'Chen',
        fullName: 'David Chen',
        company: 'Fidelity Investments',
        email: 'david.chen@fidelity.com',
        emailDomain: 'fidelity.com',
        title: 'Research Analyst',
        sectorCoverage: 'ENERGY',
        status: 'UNREVIEWED',
        ocrSimilarityScore: 90,
        matchedPdfSnippet: '[Page 15] Chen, David - Fidelity Energy Fund david.chen@fidelity.com',
        originalComments: [],
        reviewerComment: '',
      },
      {
        workspaceId,
        sourceRowNumber: 6,
        firstName: 'David',
        lastName: 'Chen',
        fullName: 'David Chen',
        company: 'Fidelity Management & Research',
        email: 'david.chen@fidelity.com',
        emailDomain: 'fidelity.com',
        title: 'Senior Sector Specialist',
        sectorCoverage: 'ENERGY',
        status: 'FLAGGED_YELLOW',
        ocrSimilarityScore: 91,
        matchedPdfSnippet: '[Page 15] Chen, David - Fidelity Management',
        originalComments: ['Exact Email Duplicate'],
        reviewerComment: 'Primary record for 1 duplicate with exact email (david.chen@fidelity.com).',
      },
      {
        workspaceId,
        sourceRowNumber: 7,
        firstName: 'Amanda',
        lastName: 'Sloan',
        fullName: 'Amanda Sloan',
        company: 'KKR & Co.',
        email: 'amanda.sloan@kkr.com',
        emailDomain: 'kkr.com',
        title: 'Principal, Climate Strategy',
        sectorCoverage: 'RENEWABLES',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 99,
        matchedPdfSnippet: '[Page 3] Sloan, Amanda - KKR Capstone amanda.sloan@kkr.com',
        originalComments: ['Verified at Energy Summit 2026'],
        reviewerComment: 'Verified active speaker at Infrastructure Conference.',
      },
      {
        workspaceId,
        sourceRowNumber: 8,
        firstName: 'Robert',
        lastName: 'Gallagher',
        fullName: 'Robert Gallagher',
        company: 'Vanguard Group',
        email: '',
        emailDomain: 'vanguard.com',
        title: 'Unverified Role',
        sectorCoverage: 'UNCONFIRMED',
        status: 'FLAGGED_RED',
        ocrSimilarityScore: 40,
        matchedPdfSnippet: '[Page 19] Gallagher, R. - Vanguard Group',
        originalComments: ['Missing Email Address in Source File'],
        reviewerComment: 'Critical issue: Missing direct email address. Locate via Bloomberg directory.',
      },
      {
        workspaceId,
        sourceRowNumber: 9,
        firstName: 'Priya',
        lastName: 'Sharma',
        fullName: 'Priya Sharma',
        company: 'Millennium Management',
        email: 'psharma@mlp.com',
        emailDomain: 'mlp.com',
        title: 'Portfolio Manager, Global Power',
        sectorCoverage: 'POWER',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 96,
        matchedPdfSnippet: '[Page 22] Sharma, Priya - Millennium MLP psharma@mlp.com',
        originalComments: [],
        reviewerComment: 'Confirmed primary coverage for North American Power Grid.',
      },
      {
        workspaceId,
        sourceRowNumber: 10,
        firstName: 'Jonathan',
        lastName: 'Hayes',
        fullName: 'Jonathan Hayes',
        company: 'Blackstone',
        email: 'j.hayes@blackstone.com',
        emailDomain: 'blackstone.com',
        title: 'Director, Energy Transition & Credit',
        sectorCoverage: 'ENERGY',
        status: 'UNREVIEWED',
        ocrSimilarityScore: 88,
        matchedPdfSnippet: '[Page 6] Hayes, Jonathan - Blackstone Credit j.hayes@blackstone.com',
        originalComments: [],
        reviewerComment: '',
      },
      {
        workspaceId,
        sourceRowNumber: 11,
        firstName: 'Samantha',
        lastName: 'Wright',
        fullName: 'Samantha Wright',
        company: 'Apollo Global Management',
        email: 'swright@apollo.com',
        emailDomain: 'apollo.com',
        title: 'Partner, Natural Resources',
        sectorCoverage: 'INDUSTRIALS',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 97,
        matchedPdfSnippet: '[Page 10] Wright, Samantha - Apollo Global swright@apollo.com',
        originalComments: [],
        reviewerComment: 'Confirmed active PM for Industrials fund.',
      },
      {
        workspaceId,
        sourceRowNumber: 12,
        firstName: 'Thomas',
        lastName: 'Kovacs',
        fullName: 'Thomas Kovacs',
        company: 'Wellington Management',
        email: 'tkovacs@wellington.com',
        emailDomain: 'wellington.com',
        title: 'Equity Research Analyst',
        sectorCoverage: 'OTHER',
        status: 'FLAGGED_YELLOW',
        ocrSimilarityScore: 60,
        matchedPdfSnippet: '[Page 28] Kovacs, T. - Wellington Mgmt',
        originalComments: ['Not target audience: Sector coverage is Consumer Retail'],
        reviewerComment: 'Flagged: Contact covers Consumer Retail, outside target Energy/Power mandate.',
      },
      {
        workspaceId,
        sourceRowNumber: 13,
        firstName: 'Rachel',
        lastName: 'Kim',
        fullName: 'Rachel Kim',
        company: 'GIP (Global Infrastructure Partners)',
        email: 'rachel.kim@globalinfra.com',
        emailDomain: 'globalinfra.com',
        title: 'Associate, Energy Storage',
        sectorCoverage: 'POWER',
        status: 'UNREVIEWED',
        ocrSimilarityScore: 92,
        matchedPdfSnippet: '[Page 31] Kim, Rachel - GIP Storage Fund rachel.kim@globalinfra.com',
        originalComments: [],
        reviewerComment: '',
      },
      {
        workspaceId,
        sourceRowNumber: 14,
        firstName: 'Alexander',
        lastName: 'Novak',
        fullName: 'Alexander Novak',
        company: 'Capital Group',
        email: 'a.novak@capgroup.com',
        emailDomain: 'capgroup.com',
        title: 'Vice President, Utilities',
        sectorCoverage: 'POWER',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 94,
        matchedPdfSnippet: '[Page 14] Novak, Alex - Capital Group a.novak@capgroup.com',
        originalComments: [],
        reviewerComment: 'Verified active PM for Capital Group Utilities.',
      },
      {
        workspaceId,
        sourceRowNumber: 15,
        firstName: 'Claire',
        lastName: 'Dupont',
        fullName: 'Claire Dupont',
        company: 'Macquarie Asset Management',
        email: 'claire.dupont@macquarie.com',
        emailDomain: 'macquarie.com',
        title: 'Managing Director, Green Investment Group',
        sectorCoverage: 'RENEWABLES',
        status: 'RESOLVED_GREEN',
        ocrSimilarityScore: 99,
        matchedPdfSnippet: '[Page 2] Dupont, Claire - Macquarie GIG claire.dupont@macquarie.com',
        originalComments: ['Top-tier target lead'],
        reviewerComment: 'Key contact for offshore wind mandate.',
      },
      {
        workspaceId,
        sourceRowNumber: 16,
        firstName: 'Victor',
        lastName: 'Morales',
        fullName: 'Victor Morales',
        company: 'T. Rowe Price',
        email: 'victor.morales@troweprice.com',
        emailDomain: 'troweprice.com',
        title: 'Senior Sector Analyst',
        sectorCoverage: 'ENERGY',
        status: 'UNREVIEWED',
        ocrSimilarityScore: 89,
        matchedPdfSnippet: '[Page 17] Morales, Victor - T. Rowe Price victor.morales@troweprice.com',
        originalComments: [],
        reviewerComment: '',
      },
    ];

    // Link duplicates together
    const createdDocs = await Contact.insertMany(sampleContacts);
    
    // Wire up duplicate references between Marcus Vance (index 1 & 2) and David Chen (index 4 & 5)
    const marcus1 = createdDocs[1];
    const marcus2 = createdDocs[2];
    const david1 = createdDocs[4];
    const david2 = createdDocs[5];

    await Contact.updateOne({ _id: marcus1._id }, { $set: { isDuplicateOf: [marcus2._id] } });
    await Contact.updateOne({ _id: marcus2._id }, { $set: { isDuplicateOf: [marcus1._id] } });
    await Contact.updateOne({ _id: david1._id }, { $set: { isDuplicateOf: [david2._id] } });
    await Contact.updateOne({ _id: david2._id }, { $set: { isDuplicateOf: [david1._id] } });

    return NextResponse.json({
      success: true,
      message: `Loaded ${sampleContacts.length} sample investor records with pre-flagged duplicates & OCR scores.`,
      count: sampleContacts.length,
    });
  } catch (error: any) {
    console.error('Demo data seed error:', error);
    return NextResponse.json({ error: error.message || 'Failed to seed demo data' }, { status: 500 });
  }
}
