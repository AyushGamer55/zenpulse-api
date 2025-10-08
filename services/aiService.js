// services/aiService.js - OpenAI + Mistral AI Service for Real Sentiment Analysis
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

// Initialize AI clients
const openaiClient = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Provider availability check
const hasOpenAI = !!openaiClient;
const hasMistral = !!process.env.MISTRAL_API_KEY && process.env.MISTRAL_API_KEY.length > 10;

console.log(`🤖 AI Providers - 🔥 OpenAI: ${hasOpenAI ? '✅ PRIMARY' : '❌'}, 🧠 Mistral: ${hasMistral ? '✅ FREE' : '❌'}`);

// Cache for weekly summary to reduce API calls
let cachedSummary = null;
let cachedSummaryTimestamp = 0;
const SUMMARY_CACHE_DURATION = 1000 * 60 * 10; // 10 minutes

// 🔮 AI Response Cache for Pep Talk Generator
const responseCache = new Map();
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

// 🔮 Universal AI completion function
async function createCompletion(provider, model, messages, options = {}) {
  try {
    if (provider === 'openai' && openaiClient) {
      return await openaiClient.chat.completions.create({
        model,
        messages,
        ...options,
      });
    } else if (provider === 'mistral' && hasMistral) {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(`Mistral AI API error: ${response.status}`);
      }

      const result = await response.json();

      // Validate response format (Mistral uses OpenAI-compatible format)
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Invalid Mistral AI response format');
      }

      return result;
    }

    throw new Error(`Provider ${provider} not available`);
  } catch (error) {
    console.error(`❌ ${provider.toUpperCase()} API Error:`, error.message);
    throw error;
  }
}

// 🎯 Smart provider selection - OpenAI FIRST, Mistral fallback
async function smartCompletion(primaryProvider, primaryModel, fallbackProvider, fallbackModel, messages, options = {}) {
  // 🔥 PRIORITY: OpenAI first (best AI quality for sentiment analysis)
  if (hasOpenAI) {
    try {
      console.log(`🎯 Using OPENAI (${primaryModel}) - Best AI Quality for Sentiment Analysis`);
      return await createCompletion('openai', primaryModel, messages, options);
    } catch (error) {
      console.warn(`⚠️ OpenAI failed: ${error.message}, trying Mistral...`);
    }
  }

  // 🧠 MISTRAL AI (excellent free alternative)
  if (hasMistral) {
    try {
      console.log(`🧠 Using MISTRAL (${fallbackModel}) - Excellent Free AI`);
      return await createCompletion('mistral', fallbackModel, messages, options);
    } catch (error) {
      console.error(`❌ Mistral failed too. Check your API keys.`);
      throw error;
    }
  }

  throw new Error('No AI providers available. Please add OpenAI or Mistral API keys.');
}

// 🔮 Smart Pep Talk Generator - Context-Aware AI Responses with Caching
export async function generatePepTalk(mood, journal, tone = "supportive") {
  const input = journal || "";
  const inputLength = input.trim().length;

  // Check cache for similar requests
  const cacheKey = `${mood}-${input.substring(0, 50)}-${tone}`;
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`⚡ Using cached response for: ${cacheKey}`);
    return cached.response;
  }

  // Simple greetings and short inputs get brief, natural responses
  const simpleGreetings = ['hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good afternoon', 'good evening'];
  const isSimpleGreeting = simpleGreetings.some(greeting =>
    input.toLowerCase().trim().includes(greeting) && inputLength < 20
  );

  // Very short or empty inputs
  if (!input || inputLength < 5) {
    const shortResponses = [
      "Hey there! 👋 How are you feeling today?",
      "Hi! 😊 What's on your mind?",
      "Hello! How's your day going?",
      "Hey! Ready to share how you're feeling?",
      "Hi there! What's your mood like today?"
    ];
    const response = shortResponses[Math.floor(Math.random() * shortResponses.length)];
    
    // Cache even simple responses
    responseCache.set(cacheKey, {
      response: response,
      timestamp: Date.now()
    });
    
    return response;
  }

  // Simple greetings
  if (isSimpleGreeting) {
    const moodBasedResponses = {
      1: "Hi! I'm here if you want to talk about what's bringing you down.",
      2: "Hey there! Hope things get a bit easier for you today.",
      3: "Hi! Sounds like you're doing okay - that's great!",
      4: "Hey! Glad to hear from you when you're feeling good!",
      5: "Hi! Love that positive energy! 😊"
    };
    const response = moodBasedResponses[mood] || "Hey! Great to hear from you!";
    
    // Cache mood-based responses
    responseCache.set(cacheKey, {
      response: response,
      timestamp: Date.now()
    });
    
    return response;
  }

  // Medium-length inputs (20-100 chars) get AI responses
  if (inputLength < 100) {
    const prompt = `You are ZenPulse AI, a compassionate mental wellness assistant. User shared: "${input}" (they're feeling ${mood}/5 overall).

Respond naturally and supportively (1-2 sentences). Acknowledge their message and offer one small, practical suggestion. Keep it conversational and empathetic. IMPORTANT: Never mention mood levels, ratings, or numbers in your response.`;

    try {
      const completion = await smartCompletion(
        'openai', 'gpt-4o-mini',  // 🔥 OpenAI first
        'mistral', 'mistral-medium', // 🧠 Mistral fallback
        [{ role: "user", content: prompt }],
        { max_tokens: 80, temperature: 0.7 }
      );
      
      const finalResponse = completion.choices[0].message.content.trim();
      
      // Cache the AI response
      responseCache.set(cacheKey, {
        response: finalResponse,
        timestamp: Date.now()
      });
      
      return finalResponse;
    } catch (err) {
      console.error("❌ AI error (medium response):", err);
      const fallbackResponse = "Thanks for sharing that with me. I'm here to listen and support you. 💙";
      
      // Cache fallback too
      responseCache.set(cacheKey, {
        response: fallbackResponse,
        timestamp: Date.now()
      });
      
      return fallbackResponse;
    }
  }

  // Longer, detailed inputs get comprehensive AI responses
  const moodContext = {
    1: "feeling very low and could use some gentle support",
    2: "feeling down but showing resilience",
    3: "feeling balanced and steady",
    4: "feeling good and motivated",
    5: "feeling excellent and energetic"
  };

  const prompt = `You are ZenPulse AI, a compassionate mental wellness assistant. User shared: "${input}" (they're experiencing ${moodContext[mood]}).

Provide a thoughtful, supportive response that:
- Acknowledges what they shared
- Offers 1 practical, specific suggestion
- Uses warm, empathetic language
- Keeps response to 2-3 sentences

Focus on empathy and actionable insights without quantifying their feelings.`;

  try {
    const completion = await smartCompletion(
      'openai', 'gpt-4o-mini',  // 🔥 OpenAI first
      'mistral', 'mistral-medium', // 🧠 Mistral fallback
      [{ role: "user", content: prompt }],
      { max_tokens: 120, temperature: 0.8 }
    );

    const finalResponse = completion.choices[0].message.content.trim();
    
    // Cache the comprehensive AI response
    responseCache.set(cacheKey, {
      response: finalResponse,
      timestamp: Date.now()
    });
    
    return finalResponse;
  } catch (err) {
    console.error("❌ AI error (detailed response):", err);
    const fallbackResponse = "I hear you and appreciate you sharing that. Sometimes just expressing ourselves helps. What's one thing that might make today a bit better?";
    
    // Cache fallback response
    responseCache.set(cacheKey, {
      response: fallbackResponse,
      timestamp: Date.now()
    });
    
    return fallbackResponse;
  }
}

// 🧠 Real AI Sentiment Analysis (OpenAI prioritized, Mistral fallback)
export async function analyzeSentiment(mood, journal) {
  // Try OpenAI first for best sentiment analysis
  if (hasOpenAI) {
    const prompt = `Analyze the sentiment of this message: "${journal || "No message"}".
Return only one word: positive, neutral, or negative.
Consider emotional tone, keywords, and context.`;

    try {
      const res = await createCompletion('openai', 'gpt-4o-mini',
        [{ role: "user", content: prompt }],
        { max_tokens: 5, temperature: 0.1 }
      );

      let sentiment = res.choices[0].message.content.trim().toLowerCase();
      if (sentiment.includes("positive")) sentiment = "positive";
      else if (sentiment.includes("negative")) sentiment = "negative";
      else sentiment = "neutral";

      return sentiment;
    } catch (err) {
      console.error("❌ OpenAI sentiment error:", err);
    }
  }

  // Try Mistral AI as excellent free alternative
  if (hasMistral) {
    try {
      const prompt = `Analyze the sentiment of this message: "${journal || "No message"}".
Return only one word: positive, neutral, or negative.`;

      const res = await createCompletion('mistral', 'mistral-medium',
        [{ role: "user", content: prompt }],
        { max_tokens: 5, temperature: 0.1 }
      );

      let sentiment = res.choices[0].message.content.trim().toLowerCase();
      if (sentiment.includes("positive")) sentiment = "positive";
      else if (sentiment.includes("negative")) sentiment = "negative";
      else sentiment = "neutral";

      return sentiment;
    } catch (err) {
      console.error("❌ Mistral AI sentiment error:", err);
    }
  }

  // Keyword-based fallback (last resort)
  const text = (journal || "").toLowerCase();
  const positiveWords = ['amazing', 'great', 'wonderful', 'excellent', 'fantastic', 'awesome', 'love', 'happy', 'excited', 'good', 'positive'];
  const negativeWords = ['terrible', 'awful', 'horrible', 'bad', 'sucks', 'hate', 'sad', 'depressed', 'angry', 'frustrated', 'negative', 'worst'];

  const hasPositive = positiveWords.some(word => text.includes(word));
  const hasNegative = negativeWords.some(word => text.includes(word));

  if (hasPositive && !hasNegative) return "positive";
  if (hasNegative && !hasPositive) return "negative";

  console.warn("⚠️ Using neutral fallback (no AI providers available for sentiment analysis)");
  return "neutral";
}

// ⚠️ Burnout detection (3+ bad days in a row = risk)
export function detectBurnout(entries) {
  let streak = 0;
  for (const e of entries) {
    if (e.mood <= 2) {
      streak++;
      if (streak >= 3) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

// 📅 Weekly summary with AI analysis (OpenAI prioritized, Mistral fallback)
export async function summarizeEntries(entries) {
  const now = Date.now();
  if (cachedSummary && (now - cachedSummaryTimestamp) < SUMMARY_CACHE_DURATION) {
    return cachedSummary;
  }

  const journals = entries.map(
    e => `(${e.entry_date} | mood ${e.mood}/5): ${e.journal || "No journal"}`
  ).join("\n");

  const prompt = `You are ZenPulse AI, analyzing mood and productivity patterns for the past 7 days.

DATA TO ANALYZE:
${journals}

PROVIDE A COMPREHENSIVE SUMMARY THAT INCLUDES:

1. **Overall Mood Trend**: Describe the general emotional journey
2. **Key Patterns**: Identify any recurring themes or triggers
3. **Strengths Highlighted**: Celebrate consistent positive behaviors
4. **Growth Opportunities**: Suggest 2-3 gentle, actionable improvements
5. **Encouraging Outlook**: End with hopeful, realistic perspective

Write in a warm, professional tone like a thoughtful wellness coach. Keep total length to 150-200 words. Use markdown formatting for readability.

Focus on insights that empower the user rather than judgment.`;

  try {
    const res = await smartCompletion(
      'openai', 'gpt-4o-mini',  // 🔥 OpenAI first
      'mistral', 'mistral-medium', // 🧠 Mistral fallback
      [{ role: "user", content: prompt }],
      { max_tokens: 200, temperature: 0.7 }
    );

    cachedSummary = res.choices[0].message.content.trim();
    cachedSummaryTimestamp = now;
    return cachedSummary;
  } catch (err) {
    console.error("❌ AI error (summary):", err);
    return "This week had ups and downs. Reflect, recharge, and step forward stronger.";
  }
}

// 🚀 Future ML integration helper
export async function processWithMLModel(data, modelType = "sentiment") {
  console.log(`🔬 Processing with ${modelType} model:`, data);
  return { processed: true, model: modelType, result: "placeholder" };
}