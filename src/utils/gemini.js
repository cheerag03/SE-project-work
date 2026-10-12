// src/utils/gemini.js
const API_KEY = process.env.PROVIDER_API_KEY || "";
const MODEL = process.env.MODEL || "gemini-2.0-flash";

/**
 * Generates a reply from Gemini API using conversation history.
 * @param {Array<{role: string, content: string}>} messages
 * @returns {Promise<{reply: string, raw: Object}>}
 */
async function generateReply(messages) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  
  const systemText = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
  const dialog = messages.filter(m => m.role !== "system")
    .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

  const prompt = systemText 
    ? `${systemText}\n\n${dialog}\nAssistant:`
    : `${dialog}\nAssistant:`;

  const body = {
    contents: [
      {
        parts: [ { text: prompt } ]
      }
    ]
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(API_KEY ? { "X-goog-api-key": API_KEY } : {})
    },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(data)}`);
  }

  let reply = "";
  if (data?.candidates && data.candidates.length > 0) {
    const c = data.candidates[0];
    if (c?.content?.parts && Array.isArray(c.content.parts)) {
      reply = c.content.parts.map(p => (typeof p === "string" ? p : (p.text || ""))).join("\n");
    } else if (c?.output) {
      reply = c.output;
    }
  }

  return { reply, raw: data };
}

module.exports = { generateReply };
