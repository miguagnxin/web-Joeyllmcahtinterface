# Joey LLM Chat Interface

This repo is for the **Next.js chat interface** that connects to the Joey API.

---

## 🎯 Focus

**Goal:** Build a working chat interface in Next.js 15. 

- Must connect to the Joey API:

`
  base_url = "http://api.joeyllm.ai/v1"
`

- OpenAI-compatible, no API key required.  
- Responses **must stream** — messages should appear progressively as they are generated, not only after completion.  
- You may adapt code from existing Next.js chat repos.  
- The only requirement: **it works**.  

👉 If you get stuck, you can look up public Next.js chat examples. At this point you should know how to build it. Don’t overthink it—the goal is a working interface.

---

## 📦 Deliverable

- A working interface that runs and connects to the Joey API with streaming responses.

---

## 🔜 Coming Next Sprint

- Add **user login** with an auth service.  
- Use **Postgres** to track sign-ins and record chat history.  

⚡ If today’s work finishes early, you may start on this ahead of next week.
