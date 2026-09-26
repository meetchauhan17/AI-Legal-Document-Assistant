# AI Legal Document Assistant

<div align="center">

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)
![Groq](https://img.shields.io/badge/LLM-Groq%20LLaMA%203.3%2070B-orange)
![Deployed on Vercel](https://img.shields.io/badge/deployed-Vercel-black)

**Intelligent, privacy-first legal document comprehension — built for people who need to understand contracts, not just sign them.**

[Live Demo](https://ai-legal-document-assistant-ebon.vercel.app) · [Report Bug](https://github.com/meetchauhan17/AI-Legal-Document-Assistant/issues) · [API Docs](https://ai-legal-document-assistant-ebon.vercel.app/api/health)

</div>

---

## Overview

Legal agreements — residential leases, employment contracts, NDAs, freelance scopes of work — are intentionally dense. Everyday individuals routinely sign documents containing onerous penalty clauses, unilateral termination rights, and unfair liability transfers they do not understand.

The **AI Legal Document Assistant** closes this access-to-justice gap. It translates complex legal contracts into plain-language summaries, surfaces risk clauses with objective explanations, answers questions strictly grounded in the document text, enables side-by-side contract comparison, and generates structured consultation briefs for attorney discussions.

---

## Features

| Feature | Description |
| :--- | :--- |
| **Document Simplification** | Plain-English translation of legal contracts without losing substantive meaning |
| **Risk Detection** | Clauses categorised as Standard, Attention, or Risk with neutral explanations |
| **Grounded Q&A** | Document question-answering strictly grounded in retrieved clauses — no hallucination |
| **Contract Comparison** | Side-by-side analysis of two contracts with per-clause favorability scoring |
| **Pre-Signing Checklist** | Actionable verification checklist before committing to an agreement |
| **Lawyer-Prep Brief** | Exportable PDF consultation brief with risk items and clarification questions |
| **Multilingual Output** | Responses available in English, Hindi, and Gujarati |

---

## Architecture

```
  Browser Client (Next.js 14 · TypeScript · TailwindCSS · Three.js)
       │
       │  REST / Multipart
       ▼
  Next.js Serverless API Routes  (Vercel Edge Functions)
  ┌──────────────────────────────────────────────────────────────┐
  │  /api/upload         PDF extraction via pdf-parse            │
  │  /api/upload-text    Direct text ingestion                   │
  │  /api/simplify       Plain-language translation              │
  │  /api/analyze-risk   Three-tier clause risk classification   │
  │  /api/ask            Grounded document Q&A                   │
  │  /api/compare        Dual contract comparative analysis      │
  │  /api/checklist      Pre-signing verification checklist      │
  │  /api/health         Runtime health and session diagnostics  │
  └───────────────────────────┬──────────────────────────────────┘
                              │
                              ▼
             Groq Cloud Inference  (llama-3.3-70b-versatile)
             ┌────────────────────────────────────────────┐
             │  Strict JSON schema output                 │
             │  Deterministic temperature (0.1)           │
             │  20-second request timeout                 │
             │  Heuristic fallback parser on API failure  │
             └────────────────────────────────────────────┘
```

### Privacy Design

- All document text and session data are held in volatile in-process memory with LRU eviction (50-session cap).
- No user documents, embeddings, or personal data are written to disk or persisted to external databases.
- Temporary file handles are closed immediately after buffer extraction.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **Styling** | TailwindCSS, Framer Motion, Lucide Icons |
| **3D Graphics** | Three.js, React Three Fiber, React Three Drei |
| **PDF Generation** | jsPDF (client-side, no server round-trip) |
| **LLM Inference** | Groq Cloud — llama-3.3-70b-versatile |
| **API Layer** | Next.js Serverless Functions (Vercel) |
| **Backend (reference)** | FastAPI, Python 3.10+, pdfplumber, ChromaDB, sentence-transformers |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A Groq API key — obtain at [console.groq.com](https://console.groq.com)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/meetchauhan17/AI-Legal-Document-Assistant.git
cd AI-Legal-Document-Assistant/frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
#    Open .env.local and set: GROQ_API_KEY=gsk_...

# 4. Start the development server
npm run dev
```

The application will be available at `http://localhost:3000`.

### Environment Variables

| Variable | Required | Description |
| :--- | :---: | :--- |
| `GROQ_API_KEY` | Yes | Groq Cloud API key for LLM inference |
| `GROQ_MODEL` | No | Override the default model (default: `llama-3.3-70b-versatile`) |
| `NEXT_PUBLIC_API_URL` | No | External backend URL — leave unset to use built-in serverless routes |

See [`frontend/.env.example`](frontend/.env.example) for the complete template.

### Optional: Python Backend

The Python FastAPI backend is retained for local RAG experimentation. It is not required for the deployed Vercel application.

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # macOS / Linux

pip install -r requirements.txt
cp .env.example .env        # add GROQ_API_KEY

uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be available at `http://127.0.0.1:8000/docs`.

---

## Testing

```bash
# Run the full test suite (backend)
python backend/run_all_tests.py

# Run individual suites
python backend/tests/test_analysis.py
python backend/tests/test_qa_compare.py
python backend/tests/test_checklist.py
python backend/tests/test_error_handling.py
```

---

## Deployment

The application is deployed on [Vercel](https://vercel.com) using the built-in CI/CD integration.

Every push to `main` triggers an automatic production deployment. No additional configuration is required beyond setting the `GROQ_API_KEY` environment variable in the Vercel dashboard.

---

## Project Structure

```
AI-Legal-Document-Assistant/
├── frontend/                   Next.js application (deployed to Vercel)
│   ├── app/
│   │   ├── api/                Serverless API routes
│   │   │   ├── upload/
│   │   │   ├── upload-text/
│   │   │   ├── simplify/
│   │   │   ├── analyze-risk/
│   │   │   ├── ask/
│   │   │   ├── compare/
│   │   │   ├── checklist/
│   │   │   └── health/
│   │   ├── analyze/
│   │   ├── ask/
│   │   ├── checklist/
│   │   ├── compare/
│   │   └── lawyer-prep/
│   ├── lib/
│   │   ├── groq.ts             Groq API client and response utilities
│   │   ├── store.ts            In-memory document session store
│   │   └── api.ts              Frontend API client with resilient fetch
│   └── .env.example
└── backend/                    Python FastAPI (reference / local RAG)
    ├── core/
    ├── tests/
    ├── main.py
    ├── app.py
    └── .env.example
```

---

## Design Decisions

**Why Next.js serverless instead of a hosted Python backend?**
Hugging Face Spaces ZeroGPU intercepts POST requests at the proxy layer, causing persistent 405 errors without a paid tier. Next.js serverless functions on Vercel provide equivalent inference capability at zero cost by calling Groq directly from the Edge.

**Why Groq instead of OpenAI?**
Groq's inference speed (>400 tokens/second on LLaMA 3.3 70B) keeps legal document analysis under 10 seconds end-to-end. The free tier is sufficient for hackathon-scale usage.

**Why in-memory storage?**
Legal documents are sensitive. Avoiding any persistence layer eliminates the attack surface for data leakage. The 50-session LRU eviction cap prevents unbounded memory growth on long-running serverless instances.

---

## Assumptions

- Documents are text-based PDFs up to 50 pages. Scanned image PDFs without an embedded text layer will return a prompt to preprocess with OCR.
- The assistant is an informational aid to accelerate comprehension. It does not replace qualified legal counsel.
- Language selection applies to the LLM output. Document input language does not affect processing.

---

## Disclaimer

> This software is an AI-powered informational tool designed to help users read and understand legal documents. It produces summaries, risk highlights, and preparation materials.
>
> **It does not provide legal advice, legal representation, or formal legal opinions.** Use of this application does not create an attorney-client relationship. For specific legal issues, disputes, or binding commitments, consult a qualified attorney licensed in your jurisdiction.

---

## License

Distributed under the MIT License. See `LICENSE` for details.
