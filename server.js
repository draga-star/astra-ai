const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();

// 🔐 IMPORTANT: use environment variable (DO NOT hardcode API key)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.use(cors());
app.use(express.json());

// 📁 Serve frontend (index.html must be inside /public)
app.use(express.static(path.join(__dirname, "public")));

// 🤖 GROQ AI FUNCTION
async function callGroq(userText) {
  return await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You are a mystical astrology AI assistant."
        },
        {
          role: "user",
          content: userText
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
}

// 💬 CHAT ROUTE
app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.json({ reply: "⚠️ No message received" });
    }

    const response = await callGroq(userMessage);

    const reply =
      response.data?.choices?.[0]?.message?.content ||
      "⚠️ No response from AI";

    res.json({ reply });

  } catch (err) {
    console.log("❌ ERROR:", err.response?.data || err.message);

    res.status(500).json({
      reply: "❌ AI error occurred. Check server logs."
    });
  }
});

// 🚀 START SERVER (IMPORTANT FOR DEPLOYMENT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});