# AI Legal Document Assistant — 2-Minute Demo Script

> **Demo Objective**: Walk through the end-to-end user journey across all 6 pages in exactly 2 minutes, highlighting plain-language simplification, balanced risk classification, grounded Q&A, side-by-side contract comparison, interactive checklist tracking, and attorney consultation brief export.

---

## ⏱️ Video / Live Demonstration Walkthrough (0:00 – 2:00)

```
0:00 ── [1. Home Hero & 3D Visuals]
0:20 ── [2. Analyze: Upload, Staged Loading & Risk Matrix]
0:45 ── [3. Grounded Q&A Chat & Confidence Badges]
1:10 ── [4. Dual Contract Comparison & Favorability]
1:35 ── [5. Interactive Pre-Signing Checklist]
1:50 ── [6. Lawyer-Prep Brief & Instant PDF Export]
2:00 ── [Conclusion]
```

---

### Phase 1: Home Page — Hero & Features (0:00 – 0:20)
* **Action**: Start at `http://localhost:3000/`.
* **Visuals**:
  * Point out the clean light theme (`#FAFAF9` canvas, `#1E3A8A` primary blue, `#D97706` amber accents).
  * Show the ambient 3D geometric background floating smoothly behind the hero.
  * Hover over the feature cards to demonstrate the interactive 3D tilt-on-hover effect.
* **Narration**:
  > *"Welcome to the AI Legal Document Assistant. Legal contracts are notoriously dense, technical, and intimidating. Our privacy-first platform transforms complex legal agreements into plain language, analyzes hidden risks, conducts side-by-side comparisons, and generates attorney consultation briefs without ever storing your private data."*
* **Action**: Click the primary CTA button **"Analyze a Document"**.

---

### Phase 2: Analyze Page — Simplification & Risk Matrix (0:20 – 0:45)
* **Action**: Land on `/analyze`.
* **Interaction**: Click **"Load Sample Agreement"** (Standard Residential Lease) to immediately populate the input, then click **"Analyze Document"**.
* **Visuals**:
  * Show the 3-stage animated progress sequence (*Reading document...* &rarr; *Simplifying language...* &rarr; *Scanning for risks...*).
  * Observe the results fade and slide into view:
    1. **Document Type Badge**: *"Residential Lease Agreement"*.
    2. **Plain Language Summary**: Key financial terms, deposit requirements, and lease duration.
    3. **Key Points Breakdown**: 5 digestible bullets.
    4. **Clause Risk Classification**: Highlight the color-coded badges:
       - 🟢 **Standard Clause**: Rent payment schedule.
       - 🟡 **Attention Required**: Tenant HVAC maintenance cap.
       - 🔴 **Potential Risk**: Unilateral 3-day termination clause.
* **Narration**:
  > *"Within seconds, the assistant classifies the document and highlights high-stakes clauses. Notice our non-alarmist phrasing: rather than declaring legal invalidity, it objectively explains why a 3-day notice window shifts unreasonable liability to the tenant."*
* **Action**: Click **"Ask Questions"** on the floating action bar.

---

### Phase 3: Grounded Q&A Page — Semantic Chat & Excerpts (0:45 – 1:10)
* **Action**: Arrive on `/ask`. Notice the persistent header confirming the loaded lease.
* **Interaction 1 (In-Scope Question)**:
  * Type: *"What are my responsibilities for heating and repairs?"*
  * Click **Send**.
  * **Result**: Returns an instant grounded answer with a **High Confidence** badge.
  * Click **"Show Source Excerpt"** to expand the exact contract text retrieved via in-memory ChromaDB vector search.
* **Interaction 2 (Out-of-Scope / Negative Question)**:
  * Type: *"Does this lease allow dogs or cats?"*
  * Click **Send**.
  * **Result**: Because the agreement contains no pet clause, the system reports: *"This document does not appear to address pets or animal policies."*
* **Narration**:
  > *"Our Q&A engine is strictly grounded in retrieved document chunks. When a user asks about something omitted from the contract, our similarity threshold prevents hallucinations and alerts the user immediately."*
* **Action**: Click **"Compare"** in the top navigation bar.

---

### Phase 4: Compare Page — Side-by-Side Evaluation (1:10 – 1:35)
* **Action**: Land on `/compare`.
* **Interaction**: Click **"Load Sample Comparison (Contract A vs Contract B)"**.
* **Visuals**:
  * Show the dual dropzones with the central 3D orbital **VS** badge.
  * Click **"Compare Documents"**.
  * View the **Executive Summary** contrasting Contract A (higher rent, non-refundable deposit) vs Contract B (lower rent, 30-day refund window).
  * Review the **Comparison Table**: Point out the emerald green **"More Favorable"** badges dynamically identifying Contract B's superior deposit and maintenance terms.
* **Narration**:
  > *"When choosing between competing offers or reviewing a revised agreement, the Compare engine highlights key financial, penalty, and renewal differences, providing clear favorability indicators for each clause."*
* **Action**: Click **"Checklist"** in the top navigation.

---

### Phase 5: Checklist Page — Interactive Pre-Signing Verification (1:35 – 1:50)
* **Action**: Arrive on `/checklist`.
* **Interaction**:
  * Click several custom animated checkboxes to mark actionable items (e.g., *"Confirm security deposit escrow account with landlord"*).
  * Watch the animated progress bar update in real-time (*"3 of 7 items verified — 43%"*).
  * Review the **"Questions to Ask the Other Party"** section tailored specifically to the uploaded lease.
* **Narration**:
  > *"The Pre-Signing Checklist generates a concrete, contract-specific action list to ensure you never sign before verifying critical timelines and deposit refund conditions."*
* **Action**: Click **"Generate Lawyer-Prep Brief &rarr;"**.

---

### Phase 6: Lawyer-Prep Page — Client-Side PDF Export (1:50 – 2:00)
* **Action**: Arrive on `/lawyer-prep`.
* **Visuals**:
  * View the 3D paperwork stack illustration and the clean on-screen print preview document.
  * Click **"Download PDF Brief"**.
  * Watch the animated green success notification appear as the formatted PDF is generated client-side via `jspdf`.
* **Narration**:
  > *"Finally, the Lawyer-Prep engine formats all findings, risk clauses, and clarification questions into a clean consultation brief with proper legal disclaimers, ready to hand directly to your attorney. Empowering, privacy-first legal clarity in under two minutes."*

---

## 🎯 Quick Verification Checklist for Evaluators

- [x] **Light Theme & Visual Consistency**: Seamless slate/blue/amber design system across all 6 pages.
- [x] **Full 6-Page Journey**: `/` &rarr; `/analyze` &rarr; `/ask` &rarr; `/compare` &rarr; `/checklist` &rarr; `/lawyer-prep`.
- [x] **3D Elements**: React Three Fiber background, 3D tilt cards, 3D VS badge, 3D paper stack.
- [x] **Multilingual Support**: English, Hindi, and Gujarati options.
- [x] **Zero Disk Persistence**: 100% in-memory vector indexing and automatic LRU eviction.
- [x] **Repository Compliance**: Single `main` branch, under 10MB total footprint, zero hardcoded secrets.
