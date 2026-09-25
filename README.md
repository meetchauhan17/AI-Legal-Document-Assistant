# AI Legal Document Assistant

> **Intelligent, privacy-first legal document simplification, risk detection, grounded Q&A, and contract comparison.**
> 
> *Making legal agreements transparent, accessible, and actionable for everyone.*

---

## 1. Chosen Vertical: AI for Legal Assistance & Access

Legal agreements—whether residential leases, employment contracts, freelance scopes of work, or non-disclosure agreements—are intentionally dense, lengthy, and riddled with archaic jargon. Everyday individuals and small business owners routinely sign these documents without understanding onerous penalty clauses, unilateral termination rights, or unfair liability transfers.

The **AI Legal Document Assistant** bridges this access-to-justice gap by translating complex legal contracts into plain, crystal-clear summaries, highlighting potential risk clauses with non-alarmist objective explanations, facilitating grounded document question-and-answering, conducting side-by-side contract comparisons, and generating structured consultation briefs for attorney discussions.

---

## 2. Problem Approach

Our solution tackles legal document opacity through five foundational principles:

1. **Accessibility First**: Plain-language translation without losing substantive legal meaning, supporting English, Hindi (हिन्दी), and Gujarati (ગુજરાતી).
2. **Objective, Balanced Risk Classification**: Categorizing clauses into `standard` (green), `attention` (amber), and `risk` (red) with neutral, non-verdict phrasing (*"This clause gives the landlord unilateral termination rights with 3 days notice, which is shorter than standard 30-day statutory notice"* rather than declaring *"This is illegal"*).
3. **Strict Grounding & Hallucination Prevention**: Document Q&A is strictly grounded in retrieved document excerpts. If a concept (e.g., "pet policy" or "severance pay") is missing from the contract, the assistant explicitly states: *"This document does not appear to address that."*
4. **Side-by-Side Bargaining Power Comparison**: Enabling users to compare two contract versions or competing lease proposals to pinpoint exact differences and favorability advantages.
5. **Zero-Persistence Privacy by Design**: All embeddings, chunks, and session data reside in volatile memory with automated LRU eviction. No user documents or sensitive contract data are ever stored to disk or external databases.

---

## 3. Logic & Architecture

```
                                  ┌──────────────────────────────────────────────┐
                                  │           Next.js 14 Web Frontend           │
                                  │ (App Router · TailwindCSS · Framer Motion    │
                                  │  React Three Fiber 3D · jsPDF Client Export) │
                                  └──────────────────────┬───────────────────────┘
                                                         │ REST JSON & Multipart
                                                         ▼
                                  ┌──────────────────────────────────────────────┐
                                  │          FastAPI Backend Application         │
                                  │   (Python 3.10+ · Uvicorn · Structured JSON) │
                                  └──────────┬───────────────────────┬───────────┘
                                             │                       │
                       ┌─────────────────────┴──────┐     ┌──────────┴──────────────────┐
                       │   Local In-Memory RAG Engine│     │      Groq LLaMA 3.3 70B     │
                       │ ───────────────────────────│     │ ─────────────────────────── │
                       │ • pdfplumber text extract  │     │ • 20-second request timeout │
                       │ • Chunking (800 char / 100)│     │ • Multilingual JSON schema  │
                       │ • sentence-transformers    │     │ • Deterministic temperature │
                       │   (all-MiniLM-L6-v2)       │     │ • Fallback parsing recovery │
                       │ • In-Memory ChromaDB Client│     └─────────────────────────────┘
                       │ • 20-session LRU Eviction  │
                       └────────────────────────────┘
```

### In-Memory Design & Privacy Guarantee
- **PDF Extraction**: Extracted using `pdfplumber`. Temporary files are unlinked immediately after memory extraction.
- **Embeddings & Vector Search**: Generated locally using `sentence-transformers/all-MiniLM-L6-v2` and indexed into an in-memory `chromadb.Client()`.
- **Session Management**: Session store maintains an LRU cache limited to 20 concurrent documents. Older document embeddings and texts are automatically purged from memory.
- **Data Persistence**: **Zero disk persistence.** No SQLite files, ChromaDB directories, or uploads folders are written to permanent storage.

---

## 4. How the Solution Works: 6-Page User Flow

### 1. Home Page (`/`)
- **Visuals**: Modern hero section with an ambient, interactive 3D geometric background powered by React Three Fiber and Three.js.
- **Features**: Interactive 3D tilt-on-hover capability cards highlighting Simplification, Risk Detection, Q&A, Contract Comparison, Pre-Signing Checklist, and Lawyer-Prep briefs.
- **CTAs**: Instant navigation to *"Analyze a Document"* or *"Compare Two Contracts"*.

### 2. Analyze Page (`/analyze`)
- **Input**: Drag-and-drop PDF upload zone (up to 5MB) or instant paste-text area, with a 1-click sample Lease Agreement loader for rapid testing.
- **Staged Execution**: Animated 3-stage progress loader (*"Reading document..."* &rarr; *"Simplifying language..."* &rarr; *"Scanning for risks..."*).
- **Results**:
  - Document Type Badge (e.g., *Residential Lease Agreement*)
  - Plain Language Summary Card
  - Key Points Bulleted Breakdown
  - Clause Risk Matrix: Collapsible clauses classified as **Standard** (Green), **Attention** (Amber), or **Risk** (Red) with practical explanations and actionable recommendations.
  - Seamless navigation to Q&A Chat, Pre-Signing Checklist, or Comparison.

### 3. Grounded Q&A Page (`/ask`)
- **Context Bar**: Persistent indicator confirming the active document and language.
- **Chat Interface**: Fast, conversational Q&A grounded strictly in vector search chunks.
- **Source Inspection**: Expandable source excerpts showing the exact clause text used to formulate the answer.
- **Confidence Badges**: Semantic similarity scores mapped to `High`, `Medium`, or `Low` confidence.
- **Similarity Threshold**: If cosine distance exceeds threshold (or information is absent), answers gracefully: *"This document does not appear to address that."*

### 4. Compare Page (`/compare`)
- **Dual Dropzones**: Side-by-side inputs for **Document A** and **Document B** with a central 3D orbital "VS" badge.
- **Sample Loader**: 1-click button to load competing lease proposals (Contract A vs Contract B).
- **Output**:
  - Executive Comparison Summary highlighting major differences.
  - Detailed Comparison Table evaluating individual aspects (Rent, Security Deposit, Auto-Renewal, Maintenance Liability).
  - Visual Favorability Badges highlighting which document offers more favorable terms per clause.

### 5. Pre-Signing Checklist Page (`/checklist`)
- **Interactive Checkboxes**: Custom animated checkboxes with SVG draw-in checkmark animations for client-side tracking.
- **Progress Tracking**: Dynamic progress bar updating live (*"X of Y items verified"*).
- **Questions for Counterparty/Lawyer**: Tailored questions referencing specific clauses found in the document.
- **Direct Bridge**: CTA leading directly into the Lawyer-Prep Summary export.

### 6. Lawyer-Prep Brief Page (`/lawyer-prep`)
- **3D Visual Element**: Layered 3D document stack illustration suggesting paperwork.
- **On-Screen Print Preview**: Structured consultation brief organizing Executive Summary, Critical Risk Items, and Clarification Questions.
- **Client-Side PDF Generation**: One-click PDF download powered by `jspdf` formatted for print or email consultation.
- **Legal Safeguard**: Persistent disclaimer included across screen and generated PDF.

---

## 5. Assumptions Made

1. **Document Scope**: The assistant is optimized for text-based legal contracts up to 50 pages (e.g., Leases, NDAs, Service Agreements, Terms of Service, Employment Contracts). Scanned image PDFs without embedded text layers produce a helpful warning suggesting OCR preprocessing.
2. **AI Model**: Utilizes Groq's high-throughput `llama-3.3-70b-versatile` with strict JSON schema outputs, 20-second network timeouts, and local fallback heuristics.
3. **Legal Nature**: The software is an informational assistive tool to accelerate comprehension and prepare users for legal counsel. It is explicitly not legal advice.

---

## 6. Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Framer Motion, Lucide Icons |
| **3D & Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`) |
| **PDF Generation** | `jspdf` (Client-side vector document construction) |
| **Backend** | FastAPI, Python 3.10+, Uvicorn, Pydantic |
| **RAG & NLP** | ChromaDB (In-Memory), Sentence-Transformers (`all-MiniLM-L6-v2`), PyTorch, `pdfplumber` |
| **LLM Inference** | Groq Cloud SDK (`llama-3.3-70b-versatile`) |

---

## 7. Setup Instructions

### Prerequisites
- Python 3.10 or higher
- Node.js 18.x or higher & npm
- Groq API Key (obtain from [console.groq.com](https://console.groq.com))

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv

# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp ../.env.example .env
# Edit .env and enter your GROQ_API_KEY=gsk_...

# Start the FastAPI server
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend API will be accessible at `http://127.0.0.1:8000` with interactive docs at `http://127.0.0.1:8000/docs`.*

### 2. Frontend Setup

```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
*Frontend application will be accessible at `http://localhost:3000`.*

### 3. Automated Test Suite

```bash
# Run comprehensive backend test suite
cd backend
python -m pytest
# or run individual suites:
python test_analysis.py
python test_qa_compare.py
python test_checklist.py
python test_error_handling.py
```

---

## 8. Disclaimer

> **IMPORTANT DISCLAIMER**
> 
> *The AI Legal Document Assistant is an artificial intelligence-powered tool designed to help users read, understand, and organize legal documents. It generates informational summaries, risk highlights, and preparation questions.*
> 
> ***This tool does not provide legal advice, legal representation, or formal legal opinions.*** *Using this application does not create an attorney-client relationship. For specific legal issues, disputes, or binding commitments, always consult with a qualified attorney licensed in your jurisdiction.*
