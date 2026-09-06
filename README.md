Live Link - https://investor-intelligence-crm.vercel.app/

# InvestorIQ — CRM Studio

InvestorIQ CRM Studio is an AI-powered investor contact intelligence and deduplication platform tailored for venture capital funds, private equity firms, and investment bank IR teams. It uses Google Gemini Flash Vision OCR and an O(N) Hash-Bucket Deduplication Engine to extract, cross-reference, structure, and clean institutional investor databases from raw PDFs and Excel workbooks.

---

## Features

- **Demo Seeding:** Instantly seed realistic institutional investor records (BlackRock, Vanguard, Citadel, Point72, KKR, Blackstone) with OCR discrepancies and duplicate clusters.
- **OCR Pipeline:** Gemini Vision OCR for multi-page scanned PDFs and client-side Tesseract.js fallback for image cards.
- **Deduplication Engine:** Exact email indexing, name clustering across firms, and fuzzy company similarity using Levenshtein distance.
- **Workspace Security:** Session-based workspace isolation (IDOR/BOLA protection) with UUID validation for guest sessions.
- **Data Sync & Migration:** Automatic guest-to-authenticated account contact migration on login.
- **Excel Export:** Formatted spreadsheet generation via ExcelJS with status highlights and cell comments.
- **Theme Support:** Dark and light mode interface.
- **Rate Limiting:** Distributed rate limiting with Upstash Redis and local fallback.

---

## Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Lucide Icons
- **Database:** MongoDB, Mongoose
- **AI & Processing:** Google Gemini API, Tesseract.js, ExcelJS, pdf-parse

---

## Folder Structure

```text
src/
├── models/       # Mongoose schemas (Contact, User, Workspace, PdfDocument)
├── components/   # UI components
│   ├── modals/   # Modal dialogs (Upload, Review, Dedup, Guide, Upgrade)
│   ├── dashboard/# Dashboard views (Table, Filters, Banners, BulkActions)
│   ├── review/   # Contact review subcomponents
│   ├── settings/ # Settings tabs (Profile, Security, Subscription)
│   └── upload/   # Upload dropzones (Excel, Image, PDF)
├── hooks/        # Client hooks (useDashboardData)
├── app/          # Routes (/dashboard, /login, /pricing, /register, /settings) & API handlers
└── lib/          # Database connection, deduplication matcher, OCR parser
```

---

## Setup & Running Locally

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
```bash
git clone https://github.com/raghav1902/investor-intelligence-crm.git
cd investor-intelligence-crm
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## License
MIT
