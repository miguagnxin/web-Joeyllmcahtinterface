// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Joey API (confirmed from your friend)
const JOEY_URL = "https://api.joeyllm.ai/v1/chat/completions";

// Helper to make sure we always return the same shape to the client
function ok(content: string) {
  return NextResponse.json({ content }); // always 200, same JSON shape
}

export async function POST(request: NextRequest) {
  // 1) Parse & validate
  let body: any;
  try {
    body = await request.json();
  } catch {
    return ok("⚠️ Invalid JSON in request.");
  }

  const msgs = body?.messages;
  if (!Array.isArray(msgs)) {
    return ok("⚠️ Invalid payload: 'messages' must be an array.");
  }
  // Optional: ensure each item has role/content strings
  const cleanMessages = msgs
    .filter(
      (m: any) =>
        m &&
        (m.role === "user" || m.role === "assistant" || m.role === "system") &&
        typeof m.content === "string"
    )
    .map((m: any) => ({ role: m.role, content: m.content }));

  if (cleanMessages.length === 0) {
    return ok("⚠️ No valid messages to send.");
  }

  // 2) Call Joey API with timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000); // 30s timeout

  try {
    const resp = await fetch(JOEY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: cleanMessages }),
      signal: controller.signal,
    });

    let data: any = null;
    try {
      data = await resp.json();
    } catch {
      // If it's not JSON, we still want to return a friendly message
      if (!resp.ok) {
        console.error("Joey API non-JSON error:", resp.status, resp.statusText);
        return ok(`⚠️ Joey API error: ${resp.status} ${resp.statusText}`);
      }
      return ok("⚠️ Unexpected non-JSON response from Joey API.");
    }

    if (!resp.ok) {
      console.error("Joey API error:", resp.status, resp.statusText, data);
      // Prefer upstream-provided error message if available
      const upstreamMsg =
        data?.error?.message ||
        data?.message ||
        `Joey API error: ${resp.status} ${resp.statusText}`;
      return ok(`⚠️ ${upstreamMsg}`);
    }

    // 3) Extract assistant message in a tolerant way
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.content ??
      "Sorry, I cannot generate a response.";

    return ok(content);
  } catch (err: any) {
    if (err?.name === "AbortError") {
      console.error("Joey API request timed out");
      return ok("⚠️ Joey API request timed out. Please try again.");
    }
    console.error("Chat API error:", err);
    return ok("⚠️ Network error calling Joey API. Please try again.");
  } finally {
    clearTimeout(timeout);
  }
}
