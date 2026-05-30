export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { day, type } = req.body;

  const prompts = {
    daily: `You are a tough but caring 75 Hard challenge coach. Person is on Day ${day} of 75. Tasks: wake up 7am, warm cumin drink, 30 min exercise, work tasks, read 10 pages, 20 min meditation, zero negative self-talk. Write 3-4 sentences of personalized morning motivation. Be direct, warm, specific. No emojis.`,
    tip: `Give ONE very specific practical tip for 75 Hard challenge Day ${day}. Tasks: 7am wake up, warm cumin drink, 30 min exercise, work tasks, 10 pages reading, 20 min meditation, zero negative words. Under 2 sentences. Actionable and specific. No fluff.`,
    complete: `Person just completed ALL tasks on Day ${day} of 75 Hard! Write 2 sentences of genuine celebration. Tell them what Day ${day + 1} will feel like. Be energizing.`,
    missed: `Person missed some tasks on Day ${day} of 75 Hard. Write 2 honest but kind sentences. Acknowledge it, refocus for tomorrow. No guilt-tripping.`,
  };

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [{ role: "user", content: prompts[type] || prompts.daily }]
      })
    });

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) return res.status(500).json({ error: "No response from AI" });

    res.status(200).json({ message: text });
  } catch (err) {
    res.status(500).json({ error: "AI coach unavailable." });
  }
}
