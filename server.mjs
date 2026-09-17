import "dotenv/config";
import express from "express";
import OpenAI from "openai";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { products } from "./src/data/products.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 3000);
const app = express();

app.use(express.json({ limit: "64kb" }));

const catalogContext = products.map((product) => [
  `- ${product.name} (${product.type}, ${product.collection}, ${product.colour})`,
  `  Sizes: ${product.sizes.join(", ")}`,
  ...(product.description ? [`  Details: ${product.description}`] : []),
  `  Link: /#/product/${product.slug}`
].join("\n")).join("\n");

app.get("/api/assistant/status", (_req, res) => res.json({ available: Boolean(process.env.OPENAI_API_KEY) }));

app.post("/api/assistant", async (req, res) => {
  const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const safeMessages = messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .slice(-12)
    .map((message) => ({ role: message.role, content: message.content.slice(0, 1500) }));

  if (!safeMessages.some((message) => message.role === "user")) {
    return res.status(400).json({ error: "Please enter a question first." });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "The assistant is not configured yet. Add OPENAI_API_KEY to .env and restart the app." });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: "gpt-6-astra",
      reasoning: { effort: "low" },
      instructions: `You are Astra, the warm and concise shopping assistant for Elite Kidz, a children's clothing label in Hyderabad.

Use only the catalog below for product facts. Never invent prices, stock, materials, delivery promises, or policies. The catalog currently has no prices. If the customer wants to order, explain that size availability and final details are confirmed on WhatsApp at +91 77024 26007. Recommend one or two relevant pieces and include their product links when useful. Keep replies under 120 words, friendly, and practical.

Catalog:
${catalogContext}`,
      input: safeMessages
    });

    return res.json({ message: response.output_text || "I’m sorry, I couldn’t find an answer just now. Please message us on WhatsApp." });
  } catch (error) {
    console.error("Astra assistant error:", error);
    return res.status(500).json({ error: "The assistant is temporarily unavailable. Please try again or message us on WhatsApp." });
  }
});

if (isProduction) {
  const distPath = path.join(__dirname, "dist");
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api/")) return next();
    return res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  const vite = await createViteServer({ server: { middlewareMode: true, hmr: false }, appType: "spa" });
  app.use(vite.middlewares);
}

app.listen(port, () => {
  console.log(`Elite Kidz is running at http://localhost:${port}`);
  if (!process.env.OPENAI_API_KEY) console.log("Astra is disabled until OPENAI_API_KEY is added to .env.");
});
