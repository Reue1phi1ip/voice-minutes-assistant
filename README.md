# Voice Minutes Assistant (Next.js App Router + Convex + OpenAI)

A take-home project that records audio in the browser, uploads it to Convex storage, then generates:
- Transcript (speech-to-text)
- Structured minutes (Title, Key Points, Action Items, Names/Companies, Tags)
- Spoken summary (text-to-speech)
- Persistent history with statuses: Uploaded / Processing / Ready / Failed

## Tech
- Next.js (App Router) + TypeScript + Tailwind
- Convex (DB + file storage + actions)
- OpenAI (Audio Transcription + Text Summary + TTS)

## 1) Setup

### Prereqs
- Node 18+ recommended
- A Convex account (Convex CLI will guide you)

### Install
```bash
npm install
```

### Start Convex (generates convex/_generated/*)
```bash
npx convex dev
```

This will output a `NEXT_PUBLIC_CONVEX_URL`. Copy it.

### Configure Next.js env
Create `.env.local`:
```bash
NEXT_PUBLIC_CONVEX_URL=YOUR_CONVEX_URL
```

### Configure Convex env for OpenAI
Convex actions run in Convex, so set the API key in Convex env (not in Next.js):

```bash
npx convex env set OPENAI_API_KEY YOUR_OPENAI_KEY
```

### Run the web app
In another terminal:
```bash
npm run dev
```

Open http://localhost:3000

## 2) How it works (high level)
1. Browser records audio using MediaRecorder.
2. Audio uploads to Convex file storage via a generated upload URL.
3. A Note record is created in Convex DB with status `Uploaded`.
4. A Convex Node action runs:
   - Reads the audio Blob from storage
   - Transcribes via OpenAI speech-to-text
   - Summarizes into strict JSON minutes via OpenAI
   - Generates a short spoken recap via OpenAI text-to-speech and stores it back to Convex storage
5. Note status becomes `Ready`, and UI updates reactively.

## 3) Optional: Retry
If a note fails, open it and click **Retry processing**.

---

If you get stuck, share the error + which step you’re on and I’ll help you fix it fast.
