import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini on the server
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully on server");
  } catch (error) {
    console.error("Failed to initialize Gemini on server:", error);
  }
} else {
  console.warn("GEMINI_API_KEY is missing on server.");
}

// API Route for chat proxy
async function generateWithFallbackAndRetry(aiInstance: GoogleGenAI, fullPrompt: string) {
  const models = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.1-flash-lite",
  ];

  let lastError: any = null;

  for (const model of models) {
    try {
      console.log(`[AI Proxy] Attempting generation with model: ${model}`);
      
      const response = await aiInstance.models.generateContent({
        model: model,
        contents: fullPrompt,
      });

      if (response && response.text) {
        console.log(`[AI Proxy] Successfully generated response using model: ${model}`);
        return response;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[AI Proxy] Error with model ${model}:`, err.message || err);
      // Immediately try the next model in the fallback list
    }
  }

  throw lastError || new Error("All fallback models failed due to high demand. Please try again in a moment.");
}

app.post("/api/chat", async (req, res) => {
  const { message, context } = req.body;

  if (!ai) {
    return res.status(503).json({ error: "AI Assistant is not configured on the server." });
  }

  try {
    const fullPrompt = context 
      ? `System: ${context}\n\nUser: ${message}`
      : message;

    const response = await generateWithFallbackAndRetry(ai, fullPrompt);

    res.json({ text: response.text || "I'm sorry, I couldn't generate a response." });
  } catch (error: any) {
    console.error("Gemini API server-side error after fallback attempts:", error);
    res.status(500).json({ error: error.message || "Failed to generate content due to high server load" });
  }
});

// Serve health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
