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

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">

    <div style="text-align:center;margin-bottom:28px;">
      <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#ef9f27;margin:0 0 8px;">Evening Check-in</p>
      <h1 style="font-size:28px;font-weight:800;color:#f0ede8;margin:0;">Hey ${userName},<br>Day ${day} is almost over ⚠️</h1>
    </div>

    <div style="background:#111;border:0.5px solid rgba(239,159,39,0.3);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
      <p style="font-size:15px;color:#f0ede8;line-height:1.75;margin:0;">
        It's 9 PM. You still have <strong style="color:#ef9f27;">2 hours left</strong> to complete today's tasks before midnight.
        <br><br>
        Do NOT let Day ${day} slip away. Open the tracker and tick off whatever is remaining. Every unchecked box is a reason to restart from Day 1.
      </p>
    </div>

    <div style="background:#111;border:0.5px solid rgba(255,255,255,0.07);border-radius:14px;padding:16px 20px;margin-bottom:20px;">
      <p style="font-size:13px;color:#7a7670;margin:0 0 12px;font-weight:500;text-transform:uppercase;letter-spacing:0.08em;">Quick checklist</p>
      ${["🌅 Woke up at 7AM", "🌿 Warm cumin drink", "💪 30 min exercise", "📋 Work tasks done", "📖 Read 10 pages", "🧘 20 min meditation", "💛 Zero negative words"]
        .map(
          (t) => `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:0.5px solid rgba(255,255,255,0.05);">
          <div style="width:16px;height:16px;border-radius:50%;border:1.5px solid #333;flex-shrink:0;"></div>
          <span style="font-size:14px;color:#f0ede8;">${t}</span>
        </div>`
        )
        .join("")}
    </div>

    <div style="background:rgba(239,159,39,0.08);border:0.5px solid rgba(239,159,39,0.25);border-radius:10px;padding:14px 18px;margin-bottom:24px;">
      <p style="font-size:13px;color:#ef9f27;margin:0;text-align:center;">
        ⏰ You have until <strong>midnight</strong> to complete Day ${day}. Don't restart.
      </p>
    </div>

    <p style="font-size:12px;color:#444;text-align:center;margin:0;">75 Hard Challenge Tracker &nbsp;·&nbsp; Automated by Claude AI</p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: "75 Hard Coach <onboarding@resend.dev>",
      to: userEmail,
      subject: `⚠️ Day ${day} — 2 hours left! Have you finished your tasks?`,
      html,
    });

    res.status(200).json({ success: true, message: "Evening reminder sent!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
