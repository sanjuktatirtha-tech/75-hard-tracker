# 🔥 75 Hard Challenge — AI Automation Tracker

Fully automated AI-powered 75 Hard tracker. Sends automatic emails every morning at **7:00 AM** and every evening at **9:00 PM** Bangladesh time.

**Live demo:** *(add your Vercel link here)*

---

## Environment Variables (add these in Vercel settings)

| Name | Value |
|---|---|
| `GROQ_API_KEY` | your Groq key (free) |
| `RESEND_API_KEY` | your Resend key (free) |
| `USER_EMAIL` | your email address |
| `USER_NAME` | your first name |
| `CRON_SECRET` | any password e.g. `hello123` |
| `CURRENT_DAY` | start with `1` |

---

## Deploy steps
1. Upload all files to GitHub
2. Connect GitHub to Vercel
3. Add environment variables in Vercel settings
4. Redeploy

## Built with
- Groq AI (free) — AI coaching
- Resend (free) — automatic emails
- Vercel (free) — hosting + cron jobs
