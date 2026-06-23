import type { Context } from "@netlify/functions";
import { draw, type DrawRequest } from "./lib/oracle.ts";

// Opus is slow (~25–55s with forced tool-use). Netlify's synchronous proxy times
// out long before that, returning unparseable HTML. So we stream NDJSON: a bare
// newline heartbeat every 3s keeps the connection alive, then a final
// {"result": ...} (or {"error": ...}) line carries the payload. The client reads
// to end-of-stream and parses the last non-empty JSON line.

const jsonError = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return jsonError("POST only", 405);

  let body: DrawRequest;
  try {
    body = (await req.json()) as DrawRequest;
  } catch {
    return jsonError("Invalid JSON", 400);
  }

  if (!body?.disciplineLabel || !body?.disciplineBrief) {
    return jsonError("Discipline manquante.", 400);
  }

  const enc = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* stream already closed */
          }
        }
      }, 3000);

      try {
        const result = await draw({
          disciplineId: body.disciplineId ?? "custom",
          disciplineLabel: body.disciplineLabel,
          disciplineBrief: body.disciplineBrief,
          intensity: body.intensity ?? "standard — a sharp, specific constraint",
          duration: body.duration ?? "one sitting",
          recent: Array.isArray(body.recent) ? body.recent : [],
        });
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message = err instanceof Error ? err.message : "Erreur inconnue";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
