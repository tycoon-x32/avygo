# AvyGo AI Backend

This project includes a simple Node.js backend that proxies requests from the AvyGo AI chat interface to the OpenAI API.

## What you need to source from OpenAI

1. OpenAI account
2. Billing enabled on the account
3. An API key from the OpenAI Platform
4. A model to use, usually:
   - `gpt-4o-mini` for low-cost testing and production-friendly usage
   - or a newer model available in your account if you have access
5. Optional: project ID / organization if your OpenAI account is configured with project restrictions

## Setup

1. Copy `.env.example` to `.env`
2. Add your real OpenAI API key:
   ```bash
   OPENAI_API_KEY=your_key_here
   OPENAI_MODEL=gpt-4o-mini
   PORT=8000
   ```
3. Install Node 18 or later
4. Start the server:
   ```bash
   npm start
   ```
5. Open the AI page:
   ```text
   http://localhost:8000/ai.html
   ```

## Security

- Never put the API key in the browser
- Keep it in `.env` only on the backend
- The frontend sends chat text to `/api/chat`, and the backend sends it securely to OpenAI

## Notes

- This setup uses `fetch`, which is built in on modern Node versions
- If your OpenAI account allows it, you can later upgrade the model to a newer GPT choice without changing the app architecture
