# StudySync — AI-Powered Study Platform

**StudySync** is a modern, course-grounded study application designed for university and college students. It transforms passive digital course materials—primarily lecture slides, textbooks, handouts, and PDF notes—into an active, interactive learning workspace.

---

## Purpose & Philosophy

Most students struggle with fragmented study materials and generic AI tools that hallucinate or lack contextual awareness of university syllabi. StudySync addresses this by adhering to a core principle:

> **Grounding Over Generic Generation:** All AI interactions, flashcards, and quizzes are anchored directly in the student's uploaded documents, accompanied by verifiable, page-level citations.

The student workflow follows an active retention loop:

$$\text{Upload} \longrightarrow \text{Understand} \longrightarrow \text{Ask} \longrightarrow \text{Practice} \longrightarrow \text{Review} \longrightarrow \text{Improve}$$

The platform cleanly divides student surfaces by context:
* **Desktop Workspace:** Tailored for creation, document ingestion management, multi-pane exploration, and deep grounded chat.
* **Mobile Surface:** A focused, full-viewport review environment optimized for one-handed flashcard flipping and practice quiz taking on the go.

---

## System Architecture

StudySync uses a decoupled, high-performance architecture split across frontend and backend services:

```text
studysync/
├── frontend/             # Next.js (App Router, Better Auth, Drizzle ORM, Tailwind, shadcn/ui)
├── backend/              # Python FastAPI (PDF ingestion, pgvector embeddings, Gemini RAG)
└── docs/                 # Architecture specifications and implementation plan
```

* **Frontend (`frontend/`):** Built with Next.js 16 (App Router), TypeScript, and React 19. It manages user sessions via Better Auth, enforces course ownership and resource quotas, orchestrates direct uploads to Cloudflare R2, and connects to Neon PostgreSQL using Drizzle ORM.
* **Backend (`backend/`):** A dedicated Python FastAPI microservice responsible for heavy document ingestion, layout-aware PDF text extraction, page-bounded chunking, vector generation via Google `gemini-embedding-2`, and Server-Sent Events (SSE) streaming with Google Gemini 3.x Flash.
* **Storage & Vectors:** Primary relational data and 768-dimensional document vectors reside in a unified **Neon PostgreSQL** database utilizing `pgvector`. Raw PDF files live in **Cloudflare R2** with zero egress fees.

---

## Planned Feature Roadmap

### Current Milestone (v1 MVP)
* **Authentication & Verification Gate:** Secure email/password and Google OAuth managed by Better Auth, with mandatory email verification to safeguard variable-cost AI resources.
* **Course Workspaces:** Dedicated course sandboxes (`/courses/[courseId]`) with isolated document libraries, chat sessions, flashcard decks, and quizzes.
* **Pre-Signed Ingestion Pipeline:** Direct browser-to-R2 upload bypasses server payload limits, feeding an asynchronous processing state machine (`UPLOADING → UPLOADED → PROCESSING → READY/FAILED`) with stale-job auto-recovery.
* **Grounded Multi-Thread Chat:** Topic-scoped chat threads providing streaming answers with inline citation preview chips linking to exact source pages.
* **Persistent Flashcard Engine:** AI-generated decks (5, 10, or 20 cards) with flip animations, 3-tier self-rating (*Hard / Medium / Easy*), and mastery progress tracking.
* **Interactive Practice Quizzes:** 4-option multiple-choice tests with instant rationale, verifiable source references, and unlimited retake attempt tracking.
* **Centralized Quota & Abuse Controls:** Hard caps on active courses, uploaded documents, chat message frequency, and daily generations.

### Planned Enhancements (v2 Roadmap)
* **Monetization & Subscriptions via Polar:** Integration of Polar for billing, checkout, customer portal, and webhook-driven subscription tiers (Free vs. Pro).
* **OCR & Multimodal Document Parsing:** Expansion beyond digital PDFs to support scanned photocopies, handwritten lecture notes, and textbook diagrams using cloud vision OCR.
* **Spaced Repetition System (SRS):** Implementing algorithmic scheduling (SM-2 / FSRS) with retention decay curves, due-date queues, and study reminders.
* **Synchronized Embedded PDF Viewer:** Dual-pane layout featuring an interactive PDF canvas with deep-link jumping and bounding-box quote highlighting upon clicking citations.
* **Collaborative Study & Shared Decks:** Permitting students to share verified flashcard decks or invite classmates to course review sessions.
* **Personalized Weak-Area Diagnostics:** Tracking historical quiz performance and flashcard difficulty to recommend targeted review sessions on difficult concepts.
