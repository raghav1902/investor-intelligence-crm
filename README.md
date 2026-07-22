# Investor Intelligence CRM

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.2-blue?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.0_Flash-blue?style=for-the-badge)

**Investor Intelligence CRM** is an AI-driven Customer Relationship Management tool tailored for venture capital, private equity, and startup founders. It utilizes advanced LLM capabilities (Google Gemini 2.0 Flash) and Optical Character Recognition (OCR) to autonomously extract, structure, and deduplicate investor contact data from raw PDFs and Excel sheets.

## ✨ Key Features

- **🤖 AI-Powered Document Parsing:** Upload PDFs containing raw investor lists. The app converts pages into images and leverages Gemini 2.0 Vision and OCR (`tesseract.js`) to intelligently extract structured contact details (Name, Email, Phone, Company, etc.).
- **📊 Spreadsheet Support:** Seamlessly import and map hundreds of rows from Excel (`.xlsx`) documents using `exceljs`.
- **🔍 Smart Deduplication:** Automatically identify duplicate records across your entire database using Levenshtein distance (`fast-levenshtein`) and string similarity algorithms.
- **🚥 Lead Classification:** Manually review AI extractions and classify leads into actionable categories (Green / Yellow / Red).
- **💾 Export Capabilities:** Export your cleaned and deduplicated CRM database back into a formatted `.xlsx` file for external outreach campaigns.
- **🚀 Local-First Database:** Utilizes `mongodb-memory-server` to automatically spin up a local MongoDB instance during development—no external database credentials required!

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB (Mongoose)
- **AI & Processing:** `@google/generative-ai`, `openai`, `@napi-rs/canvas`, `pdf-parse`

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18+) and **npm** installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/raghav1902/investor-intelligence-crm.git
   cd investor-intelligence-crm
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Rename `.env.example` to `.env` (if provided) or create a new `.env` file in the root.
   - Add your Google Gemini API key:
     ```env
     GEMINI_API_KEY=your_google_gemini_api_key_here
     ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📂 Project Structure

```text
src/
├── app/              # Next.js 16 App Router (Frontend Pages & Layouts)
│   ├── api/          # Backend API Routes (Uploads, Matching, Exports)
├── components/       # Reusable React UI Components (Modals, Navbar, StatsBar)
├── lib/              # Core Logic (AI Parsing, PDF/Excel Extraction, Deduplication)
└── models/           # Mongoose Database Schemas (Contacts)
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/raghav1902/investor-intelligence-crm/issues).

## 📝 License

This project is licensed under the MIT License.
