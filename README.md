# 🚀 AI Resume Matcher

An intelligent, full-stack application that evaluates resumes against job descriptions using Natural Language Processing (NLP). Instead of relying on simple keyword matching, this tool uses deep semantic analysis to provide an accurate match score, highlight missing skills, and extract key contextual matches.

## ✨ Features

* **Client-Side PDF Parsing:** Resumes are parsed directly in the browser using `pdfjs-dist`, ensuring zero sensitive file uploads to the server and lightning-fast processing.
* **Deep Semantic Scoring (70%):** Utilizes Gensim's GloVe Word2Vec models to understand the *contextual* similarity between the resume and the job description, not just exact word matches.
* **Keyword Frequency Scoring (30%):** Leverages Scikit-Learn's TF-IDF vectorization to ensure critical job requirements carry the right mathematical weight.
* **Smart Skill Extraction:** Uses NLTK Part-of-Speech (POS) tagging combined with a strict normalization dictionary to perfectly categorize tech stacks (Frontend, Backend, DevOps, etc.) and filter out HR boilerplate.
* **Modern UI/UX:** A responsive, beautiful interface built with Next.js and Tailwind CSS.

## 🛠️ Tech Stack

**Frontend**
* [Next.js](https://nextjs.org/) / React
* [Tailwind CSS](https://tailwindcss.com/)
* [PDF.js](https://mozilla.github.io/pdf.js/) (Mozilla)

**Backend**
* [Python 3](https://www.python.org/) & [Flask](https://flask.palletsprojects.com/)
* [NLTK](https://www.nltk.org/) (Natural Language Toolkit)
* [Scikit-Learn](https://scikit-learn.org/)
* [Gensim](https://radimrehurek.com/gensim/)

---

## ⚙️ How It Works

1. **Upload:** The user uploads a PDF resume and pastes a Job Description.
2. **Local Extraction:** The Next.js frontend extracts raw text from the PDF locally, saving bandwidth and protecting user privacy.
3. **Pre-processing:** The Flask backend cleans the text, removes HTML/stopwords, and normalizes tech variations (e.g., `react.js` -> `react`).
4. **Vector Math:** The backend converts both documents into dense numerical vectors using `glove-wiki-gigaword-50` and calculates the Cosine Similarity.
5. **Skill Mapping:** Nouns are extracted, checked against a curated tech-stack dictionary, and separated into `Resume Skills`, `Job Skills`, and `Missing Skills`.

---

## 🚀 Installation & Setup

### Prerequisites
* Node.js (v18+)
* Python (3.9+)
* Git

### 1. Clone the Repository
```bash
git clone [https://github.com/adarshadv056/resume-matcher.git](https://github.com/adarshadv056/resume-matcher.git)
cd resume-matcher