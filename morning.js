import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const day = parseInt(process.env.CURRENT_DAY || "1");
    const userEmail = process.env.USER_EMAIL;
    const userName = process.env.USER_NAME || "Champion";

    // Get AI morning message from Groq
    const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        max_tokens: 300,
        messages: [{
          role: "user",
          content: `You are a powerful 75 Hard challenge coach. The person's name is ${userName} and they are on Day ${day} of 75. Their daily tasks: wake up 7am, warm cumin drink, 30 min exercise, complete work tasks, read 10 pages, 20 min meditation, zero negative self-talk. Write a SHORT (3-4 sentences) energizing morning message. Be direct, warm, mention their name, reference 1-2 specific tasks. Make them feel unstoppable. No emojis.`
        }]
      })
    });

    const aiData = await aiRes.json();
    const motivationText = aiData.choices?.[0]?.message?.content || 
      `Today is Day ${day}. Wake up, make your cumin drink, move your body. Every task done today is a vote for the person you are becoming.`;

    const tasks = [
      { time: "7:00 AM", icon: "🌅", task: "Wake up" },
      { time: "7:05 AM", icon: "🌿", task: "Warm cumin drink" },
      { time: "7:30 AM", icon: "💪", task: "30 min exercise" },
      { time: "9:00 AM", icon: "📋", task: "Complete work tasks" },
      { time: "6:00 PM", icon: "📖", task: "Read 10 pages" },
      { time: "8:00 PM", icon: "🧘", task: "20 min meditation" },
      { time: "All day", icon: "💛", task: "Zero negative words" },
    ];

    const taskRows = tasks.map(t => `
      <tr>
        <td style="padding:10px 12px;font-size:15px;">${t.icon}</td>
        <td style="padding:10px 12px;color:#f0ede8;font-size:14px;font-weight:500;">${t.task}</td>
        <td style="padding:10px 12px;color:#7a7670;font-size:13px;">${t.time}</td>
      </tr>`).join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#c8f07a;margin:0 0 8px;">Day ${day} of 75</p>
      <h1 style="font-size:32px;font-weight:800;color:#f0ede8;margin:0;">Good Morning,<br>${userName} 🔥</h1>
      <p style="font-size:13px;color:#7a7670;margin:8px 0 0;">${new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric", timeZone:"Asia/Dhaka" })}</p>
    </div>
    <div style="background:#111;border:0.5px solid rgba(200,240,122,0.2);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#c8f07a;margin:0 0 10px;">🤖 Your AI Coach Says</p>
      <p style="font-size:15px;color:#f0ede8;line-height:1.75;margin:0;">${motivationText}</p>
    </div>
    <div style="background:#111;border:0.5px solid rgba(255,255,255,0.07);border-radius:14px;padding:4px 0;margin-bottom:20px;">
      <p style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#7a7670;margin:16px 16px 8px;">Today's Tasks</p>
      <table style="width:100%;border-collapse:collapse;">${taskRows}</table>
    </div>
    <div style="background:rgba(200,240,122,0.06);border:0.5px solid rgba(200,240,122,0.2);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="font-size:13px;color:#c8f07a;margin:0;text-align:center;">
        <strong>Progress: Day ${day} / 75</strong> &nbsp;·&nbsp; ${Math.round((day/75)*100)}% complete
      </p>
    </div>
    <p style="font-size:12px;color:#444;text-align:center;margin:0;">75 Hard Challenge Tracker · Automated by AI</p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: "75 Hard Coach <onboarding@resend.dev>",
      to: userEmail,
      subject: `🔥 Day ${day} — Good Morning ${userName}! Your tasks are waiting.`,
      html,
    });

    res.status(200).json({ success: true, day, message: "Morning email sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
