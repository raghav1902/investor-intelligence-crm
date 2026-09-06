Live Link - https://investor-intelligence-crm.vercel.app/

# InvestorIQ — CRM Studio

![Next.js](https://img.shields.io/badge/Next.js-16.2_App_Router-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.7-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash_Vision-blue?style=for-the-badge)

**InvestorIQ CRM Studio** is an AI-powered investor contact intelligence and deduplication platform tailored for venture capital funds, private equity firms, and investment bank IR teams. It leverages **Google Gemini 2.0 Flash Vision OCR** and an **O(N) Hash-Bucket Deduplication Engine** to autonomously extract, cross-reference, structure, and clean institutional investor databases from raw PDFs and structured Excel workbooks (supports 10,000+ rows).

---

## Core Features

- **One-Click Demo Seeding:** Click **Demo Data** in the header to instantly seed 16 realistic institutional investor records (BlackRock, Vanguard, Citadel, Point72, KKR, Blackstone) with pre-flagged OCR discrepancies and duplicate clusters for live interview demonstrations.
- **OCR Pipeline:** Supports Premium Gemini 2.0 Flash Vision OCR for high-accuracy indexing of multi-page scanned PDFs, alongside a free client-side fallback using Tesseract.js for single image cards (.png, .jpg, .webp).
- **O(N) Hash-Bucket Deduplication Engine:** 
  - **Exact Email Indexing:** Hash-lookup grouping.
  - **Exact Name Clustering:** Identifies analysts who switched firms (e.g. Citadel -> Point72).
  - **Fuzzy Company and Name Similarity:** Uses Levenshtein distance (`string-similarity`) grouped by firm prefix to prevent quadratic comparisons.
- **Dark Mode and Responsive Design:** Fully responsive layout that adapts to mobile, tablet, and desktop screens with a built-in Dark/Light mode toggle.
- **Session-Based Workspace Isolation (IDOR/BOLA Protection):** Authenticated users' workspaces are locked to their server-side `userId`. Client-sent workspace headers are overridden to prevent unauthorized data reading/deletion. Guest sessions use strict UUID validation.
- **Account Data Sync and Auto-Migration:** Logged-in users' CRM contacts automatically sync across devices. If a guest user adds contacts and subsequently registers/logs in, their guest contacts are automatically migrated and merged into their account.
- **Stripe Subscription and Developer Mock:** Integrated with Stripe Checkout and Webhooks. If Stripe secret keys are not configured in `.env`, it automatically activates a developer mock upgrade, letting you test Premium features (like PDF uploads) instantly for free.
- **Secure Distributed Rate-Limiting:** Incorporates Upstash Redis for serverless-ready rate limiting (protecting your Gemini API quota). Gracefully falls back to local in-memory tracking if Redis credentials are not configured.
- **Real-Time Database Quality Score:** Displays a visual progress bar (`% Verified`) with status classifications (`UNREVIEWED`, `FLAGGED_YELLOW`, `FLAGGED_RED`, `RESOLVED_GREEN`).
- **Bulk Operations and Keyboard Shortcuts:**
  - Multi-select checkboxes with floating bulk action bar (**Mark Verified Green**, **Mark Flagged Yellow**, **Delete**).
  - `Ctrl + K` or `/` focuses the global search bar.
  - `Esc` closes active modals.
- **Native Excel Export with Cell Formatting:** Exports clean workbooks via `ExcelJS` featuring color-coded status highlights, auto-filters, clickable domain links, and reviewer comments.
- **Data Clearing and Workspace Reset:** Click the trash icon in the header navigation to wipe your session's contacts and PDFs, resetting the environment. Workspace data is ephemeral to your browser session.

---

## Code Architecture and Folder Structure (MVC)

The codebase strictly follows enterprise **Model-View-Controller (MVC)** principles and maintains a code quality standard where files are kept in the **200–400 line** range for maximum maintainability:

```text
investor-intelligence-crm/
├── public/                     # Static assets and sample demo spreadsheets
├── scripts/                    # Automation scripts (generate-demo-files, scratch_gemini_test)
├── test/                       # Test suites and sample verification PDFs
└── src/
    ├── models/                 # [M - Model] Mongoose Data Schemas
    │   ├── Contact.ts          # Contact entity with OCR flags and status
    │   ├── User.ts             # Auth accounts and password hashing
    │   ├── Workspace.ts        # Tenant isolation entity
    │   ├── PdfDocument.ts      # Stored source PDF metadata
    │   └── PdfText.ts          # Extracted OCR text blocks
    │
    ├── components/             # [V - View] Presentation Layer
    │   ├── modals/             # Centralized dialogs (Upload, Review, Dedup, Guide, Upgrade)
    │   ├── dashboard/          # ContactsTable, Filters, Banners, BulkActions
    │   ├── review/             # ReviewFormFields, PdfViewer, ActionBar
    │   ├── settings/           # ProfileSection, SecuritySection, SubscriptionSection
    │   ├── upload/             # ExcelUpload, ImageOcr, PdfUpload dropzones
    │   ├── Navbar.tsx          # Global Navigation
    │   ├── Sidebar.tsx         # Left Navigation drawer
    │   ├── StatsBar.tsx        # Top KPI Metrics bar
    │   ├── AuthProvider.tsx    # NextAuth session context
    │   └── ToastProvider.tsx   # Interactive toast notifications
    │
    ├── hooks/                  # [C - Controller] Client ViewModels
    │   └── useDashboardData.ts # Centralized dashboard state, mutations and actions
    │
    ├── app/                    # [V + C] Next.js Route Views and API Endpoints
    │   ├── (routes)/           # Pages: /dashboard, /login, /pricing, /register, /settings
    │   └── api/                # Backend API Controllers (/api/contacts, /api/settings, etc.)
    │
    └── lib/                    # Services and Business Logic Layer
        ├── db.ts               # Database connection singleton
        ├── matcher.ts          # O(N) Hash-bucket deduplication engine
        ├── auth-workspace.ts   # IDOR/BOLA security and workspace isolation
        ├── rate-limiter.ts     # Distributed rate limiting (Upstash Redis fallback)
        ├── excel-parser.ts     # Excel workbook stream parser
        ├── excel-exporter.ts   # Formatted Excel export builder
        ├── pdf-parser.ts       # Gemini AI Vision and PDF extractors
        └── ocr/                # Client-side canvas preprocessing and OCR parsers
```

---

## Quickstart and Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Installation
```bash
git clone https://github.com/raghav1902/investor-intelligence-crm.git
cd investor-intelligence-crm
npm install
```

### 3. Environment Configuration
Create a `.env` file based on `.env.example`:
```env
MONGODB_URI=mongodb://localhost:27017/investoriq
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build Verification
```bash
npm run build
```

---

## How to Demo in 30 Seconds

1. **Instant Seeding:** Click **Demo Data** in the top navbar to seed sample contacts.
2. **Review and Dedup:** Click on any table row to review PDF source snippets, or click **Dedup (1)** to compare duplicate records side-by-side.
3. **Filter and Search:** Use the sector dropdown or type `Ctrl + K` to search by firm or name.
4. **Theme Toggle:** Try the **Light/Dark theme toggle** in the top right to see the responsive layout adapt to your preferences.
5. **Export Clean Excel:** Click **Export Clean .xlsx** to download a formatted spreadsheet.
6. **Reset:** Open the **Settings** modal and click **Clear Local Storage & Data** to securely reset your workspace and remove any stored API keys.

---

## License
MIT License.
