# Avinya Code | The Persistent Cognitive Mentor 🧠

**Avinya Code** is an advanced AI-powered mentorship platform designed to eliminate the "Goldfish Memory" problem in modern AI tutoring. While standard LLMs reset every session, Avinya maintains a persistent **Cognitive Trace** of a student's technical struggles, preferences, and project contexts.

Built for the **Devnovate Hackathon**, Avinya uses the **Hindsight 2026 SDK** to provide mentorship that actually grows with the developer.

---

## 🚀 The Problem & Solution

### The Problem: Goldfish Memory
Most AI tutors treat every interaction as the first. They don't remember that you struggled with `asyncio` yesterday, or that you prefer `Tailwind` over `Vanilla CSS`. This leads to repetitive advice and a lack of true pedagogical growth.

### The Solution: Persistent Mentorship
Avinya Code acts as a Senior Peer Mentor. It recalls past mistakes, acknowledges ongoing personal projects (like Scandine or the Ice Factory), and tracks technical friction over time. It doesn't just give answers; it bridges new concepts with your unique history.

---

## ✨ Key Features

- **Cognitive Trace**: A live-updating log of student progress and past technical hurdles, powered by Hindsight's semantic memory.
- **Skill Radar**: Real-time visualization of competency across Architecture, Async Logic, and Project Context.
- **Performance Analytics**: Dynamic tracking of Logic Consistency and Technical Depth.
- **Recurring Friction Tracking**: Automatically identifies patterns in coding errors (e.g., "Syntax Errors in Async") to provide targeted interventions.
- **Supportive Peer Persona**: A mentor that prioritizes empathy and curiosity over rigid instruction.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python 3.12)
- **Memory Engine**: [Hindsight 2026 SDK](https://hindsight.ai)
- **Inference**: Groq (Llama 3.1 8B Instant)
- **Frontend**: React + Vite
- **Styling**: Tailwind CSS + Lucide Icons

---

## 🏗️ Getting Started

### 1. Prerequisites
- Node.js 18+
- Python 3.10+
- Groq & Hindsight API Keys

### 2. Configuration
Create a `.env` file in the root:
```env
GROQ_API_KEY=your_key
HINDSIGHT_API_KEY=your_key
HINDSIGHT_BANK_ID=your_bank_id
```

### 3. Execution
**Start Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 📜 Credits & Acknowledgments

- **Developer**: [Harshal Ghadge](https://github.com/NoScopeDev02)
- **Technology**: Powered by the **Hindsight 2026 SDK**.
- **Hackathon**: Built with ⚡ for the **Devnovate Hackathon**.

---

*Avinya Code: Because your mentor should remember your growth as clearly as you do.*
