import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Proxy endpoint for Infomaniak AI API
app.post("/api/generate-profile", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ error: "Invalid request: answers array required" });
    }

    const INFOMANIAK_API_TOKEN = process.env.VITE_INFOMANIAK_API_TOKEN;
    const INFOMANIAK_PRODUCT_ID = process.env.VITE_INFOMANIAK_PRODUCT_ID;

    if (!INFOMANIAK_API_TOKEN || !INFOMANIAK_PRODUCT_ID) {
      return res.status(500).json({
        error: "Server configuration error: Missing Infomaniak credentials",
      });
    }

    const INFOMANIAK_API_URL = `https://api.infomaniak.com/2/ai/${INFOMANIAK_PRODUCT_ID}/openai/v1/chat/completions`;

    // Create prompt from answers
    const answerText = answers
      .map((a, i) => `${i + 1}. ${a.question} → ${a.answer.toUpperCase()}`)
      .join("\n");

    const systemPrompt =
      "You are a witty, insightful personality analyst who creates fun, engaging personality profiles. Be creative, humorous, and positive.";

    const userPrompt = `Based on these quiz answers, create a unique and personalized personality profile (2-3 paragraphs):

Quiz Answers:
${answerText}

Create an engaging profile that:
- Starts with a catchy title/archetype with an emoji (like "🌟 The Adventurous Dreamer" or "🎯 The Methodical Visionary")
- Describes their personality traits based on the specific answers
- Includes a "Your Vibe" section with 3 emojis and traits
- Ends with a fun prediction or advice
- Be creative, humorous, and positive
- Make it UNIQUE every time

Format exactly like this:
## [Emoji] [Archetype Title]

[Personality description - 2-3 sentences about who they are based on answers]

Your vibe: [emoji] [trait] • [emoji] [trait] • [emoji] [trait]

**Prediction:** [One fun, specific prediction or advice]`;

    // Call Infomaniak API
    const response = await fetch(INFOMANIAK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INFOMANIAK_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: "qwen3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_completion_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
          `Infomaniak API error: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content generated");
    }

    res.json({ profile: generatedText });
  } catch (error) {
    console.error("Error in generate-profile endpoint:", error);
    res.status(500).json({
      error: "Failed to generate profile",
      message: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate-profile`);
});
