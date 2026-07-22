# InvestorIQ — CRM Studio

![Next.js](https://img.shields.io/badge/Next.js-16.2_App_Router-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.7-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash_Vision-blue?style=for-the-badge)

**InvestorIQ CRM Studio** is an AI-powered investor contact intelligence and deduplication platform tailored for venture capital funds, private equity firms, and investment bank IR teams. It leverages **Google Gemini 2.0 Flash Vision OCR** and a **Hash-Bucket Deduplication Engine** to autonomously extract, cross-reference, structure, and clean institutional investor databases from raw PDFs and structured Excel workbooks (supports 10,000+ rows).

---

## 🌟 Core Features

- **⚡ One-Click Demo Seeding:** Click **`Demo Data`** in the header to instantly seed 16 realistic institutional investor records (BlackRock, Vanguard, Citadel, Point72, KKR, Blackstone) with pre-flagged OCR discrepancies and duplicate clusters for live interview demonstrations.
- **🤖 OCR Pipeline:** Supports Premium Gemini 2.0 Flash Vision OCR for high-accuracy indexing of multi-page scanned PDFs, alongside a free client-side fallback using Tesseract.js for single image cards (.png, .jpg, .webp).
- **🔍 O(N) Hash-Bucket Deduplication Engine:** 
  - **Exact Email Indexing:** Instant hash-lookup grouping.
  - **Exact Name Clustering:** Identifies analysts who switched firms (e.g. Citadel → Point72).
  - **Fuzzy Company & Name Similarity:** Uses Levenshtein distance (`string-similarity`) grouped by firm prefix to prevent quadratic comparisons.
- **🌑 Dark Mode & Responsive Design:** Fully responsive layout that adapts to mobile, tablet, and desktop screens with a built-in Dark/Light mode toggle (powered by Tailwind CSS v4 `@custom-variant dark`).
- **🔒 Multi-Tenant Workspace Isolation:** Every session generates a unique client-side `x-workspace-id` header to partition MongoDB documents cleanly without cross-tenant data leakage.
- **📊 Real-Time Database Quality Score:** Displays a visual progress bar (`% Verified`) with status classifications (`UNREVIEWED`, `FLAGGED_YELLOW`, `FLAGGED_RED`, `RESOLVED_GREEN`).
- **⚔️ Bulk Operations & Keyboard Shortcuts:**
  - Multi-select checkboxes with floating bulk action bar (**Mark Verified Green**, **Mark Flagged Yellow**, **Delete**).
  - `Ctrl + K` or `/` focuses the global search bar.
  - `Esc` closes active modals.
- **📁 Native Excel Export with Cell Formatting:** Exports clean workbooks via `ExcelJS` featuring color-coded status highlights, auto-filters, clickable domain links, and reviewer comments.
- **🗑️ Data Clearing & Workspace Reset:** Click the trash icon in the header navigation to wipe your session's contacts and PDFs, resetting the environment. Workspace data is ephemeral to your browser session.

---

## 🛠️ Architecture & Tech Stack

```text
                               ┌─────────────────────────┐
                               │  Next.js 16 App Router  │
                               │  (React 19 + Tailwind)  │
                               └────────────┬────────────┘
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
        ┌─────────────────────────┐                   ┌─────────────────────────┐
        │   REST API Route Layer  │                   │  Client Workspace State │
        │ (/api/contacts, upload) │                   │  (x-workspace-id BYOK)  │
        └────────────┬────────────┘                   └─────────────────────────┘
                     │
     ┌───────────────┼─────────────────────────┐
     ▼               ▼                         ▼
┌──────────┐ ┌───────────────┐ ┌────────────────────────────────┐
│  MongoDB │ │ Gemini 2.0 AI │ │ Hash-Bucket Deduplication      │
│ (Pooled) │ │ (Vision OCR)  │ │ (Levenshtein + Hash Maps)      │
└──────────┘ └───────────────┘ └────────────────────────────────┘
```

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons
- **Backend:** Next.js Serverless API Routes (`maxDuration = 120`), Node.js
- **Database:** MongoDB (Mongoose 9.7 singleton pattern with `MongoMemoryServer` fixed port fallback)
- **AI & Processing:** `@google/generative-ai` (Gemini 2.0 Flash), `exceljs`, `pdf-parse`, `string-similarity`, `@napi-rs/canvas`

---

## 🚀 Quickstart & Setup

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Installation
```bash
git clone https://github.com/raghav1902/investor-intelligence-crm.git
cd investor-intelligence-crm
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📖 How to Demo in 30 Seconds

1. **Instant Seeding:** Click **`Demo Data`** in the top navbar to seed sample contacts.
2. **Review & Dedup:** Click on any table row to review PDF source snippets, or click **`Dedup (1)`** to compare duplicate records side-by-side.
3. **Filter & Search:** Use the sector dropdown or type `Ctrl + K` to search by firm or name.
4. **Theme Toggle:** Try the **Light/Dark theme toggle** in the top right to see the responsive layout adapt to your preferences.
5. **Export Clean Excel:** Click **`Export Clean .xlsx`** to download a formatted spreadsheet.
6. **Reset:** Open the **Settings ⚙️** modal and click **Clear Local Storage & Data** to securely reset your workspace and remove any stored API keys.

---

## 🧹 Project Maintenance & Outdated Files
- **How it works:** All data is tied to a unique `workspace-id` generated on your device. You are completely isolated from other users. 
- **Outdated Files:** If you are running into issues, ensure you aren't using an outdated Node.js version. If old cache data is causing problems, simply use the **Clear Local Storage & Data** button inside the Settings menu to wipe outdated persistent state.

## 📝 License
MIT License.
