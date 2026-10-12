// src/routes/therapyChat.js
const express = require("express");
const router = express.Router();

const API_KEY_FROM_ENV = process.env.PROVIDER_API_KEY || "";
const MODEL = process.env.MODEL || "gemini-2.0-flash"; // v1beta model id

router.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array required" });
    }

    // if client provided API key in header (for quick test), accept it as fallback
    const clientKey = req.header("X-goog-api-key") || req.header("x-goog-api-key");
    const API_KEY = API_KEY_FROM_ENV || clientKey;

    if (!API_KEY) {
      console.warn("No PROVIDER_API_KEY found in env and none provided in X-goog-api-key header.");
      // still attempt, but will likely fail
    }

    // Build prompt text (system + conversation)
    const systemText = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
    const dialog = messages.filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const prompt = `${systemText}\n\n${dialog}\nAssistant:`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

    // v1beta generateContent expects `contents` with parts; avoid unsupported top-level fields
    const body = {
      contents: [
        {
          parts: [ { text: prompt } ]
        }
      ]
    };

    // call provider
    const r = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-goog-api-key": API_KEY } : {})
      },
      body: JSON.stringify(body),
    });

    const j = await r.json().catch(() => null);

    if (!r.ok) {
      console.error("Provider returned error:", r.status, j);
      return res.status(502).json({
        error: "Model provider error",
        status: r.status,
        details: j || String(j)
      });
    }

    // Parse v1beta shape: candidates[].content.parts[].text
    let reply = "";
    if (j?.candidates && Array.isArray(j.candidates) && j.candidates.length > 0) {
      const c = j.candidates[0];
      if (c?.content?.parts && Array.isArray(c.content.parts)) {
        reply = c.content.parts.map(p => (typeof p === "string" ? p : (p.text || ""))).join("\n");
      } else if (c?.output) {
        reply = c.output;
      } else if (typeof c === "string") {
        reply = c;
      } else {
        reply = JSON.stringify(c).slice(0, 1000);
      }
    } else if (j?.output) {
      // other shapes fallback
      reply = Array.isArray(j.output) ? j.output.map(o => o.text || o).join("\n") : String(j.output);
    } else {
      // nothing parsed
      reply = "";
    }

    // if still empty, return raw to help debugging
    if (!reply) {
      return res.json({ reply: "", raw: j, note: "No parsed reply - see raw for details" });
    }

    return res.json({ reply, raw: j });
  } catch (err) {
    console.error("therapyChat error:", err);
    return res.status(500).json({ error: "Internal server error", details: String(err) });
  }
});

module.exports = router;
