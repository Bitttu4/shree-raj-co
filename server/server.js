const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "*" }));

// ── Initialize Firebase Admin (for storing submissions) ──────────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// ── Email transporter (Gmail) ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,    // your Gmail: shreerajco@yahoo.com or Gmail
    pass: process.env.EMAIL_PASS,    // Gmail App Password (not normal password)
  },
});

// ── Rate limiter: max 5 submissions per IP per hour ───────────────────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: "Too many submissions. Please try again after an hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Honeypot + Validation middleware ─────────────────────────────────────────
const validateContact = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ max: 100 }).withMessage("Name too long."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number."),

  body("message")
    .trim()
    .notEmpty().withMessage("Message is required.")
    .isLength({ min: 10, max: 1000 }).withMessage("Message must be 10–1000 characters."),

  // Honeypot: bots fill hidden field "website", humans leave it blank
  body("website")
    .custom((value) => {
      if (value && value.length > 0) throw new Error("Spam detected.");
      return true;
    }),
];

// ── POST /contact ─────────────────────────────────────────────────────────────
app.post("/contact", contactLimiter, validateContact, async (req, res) => {
  // 1. Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, phone, message } = req.body;
  const timestamp = new Date();

  try {
    // 2. Store in Firestore
    await db.collection("contact_submissions").add({
      name,
      email,
      phone: phone || "—",
      message,
      submittedAt: admin.firestore.Timestamp.fromDate(timestamp),
      ip: req.ip,
    });

    // 3. Send email to owner
    await transporter.sendMail({
      from: `"Shree Raj & Co. Website" <${process.env.EMAIL_USER}>`,
      to: process.env.OWNER_EMAIL,  // shreerajco@yahoo.com
      subject: `📨 New Contact: ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
          <div style="background:#0f172a;color:white;padding:24px">
            <h2 style="margin:0;font-size:20px">New Contact Form Submission</h2>
            <p style="margin:4px 0 0;opacity:0.7;font-size:13px">Shree Raj & Co. Website</p>
          </div>
          <div style="padding:24px">
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px 0;color:#64748b;width:80px">Name</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Phone</td><td style="padding:8px 0">${phone || "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b;vertical-align:top">Message</td><td style="padding:8px 0">${message.replace(/\n/g, "<br>")}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Time</td><td style="padding:8px 0;font-size:13px">${timestamp.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST</td></tr>
            </table>
          </div>
          <div style="background:#f8fafc;padding:16px 24px;font-size:12px;color:#94a3b8">
            Reply directly to this email to respond to ${name}.
          </div>
        </div>
      `,
      replyTo: email,
    });

    // 4. Send confirmation to user
    await transporter.sendMail({
      from: `"Shree Raj & Co." <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "We received your message — Shree Raj & Co.",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
          <h2 style="color:#0f172a">Thank you, ${name}!</h2>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p style="color:#64748b;font-size:14px">Your message:<br><em>${message}</em></p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
          <p style="font-size:13px;color:#94a3b8">Shree Raj & Co. | Tax Consultants, Vadodara<br>📞 +91 9426536855</p>
        </div>
      `,
    });

    res.json({ success: true, message: "Message sent! We'll be in touch soon." });

  } catch (err) {
    console.error("Contact submission error:", err);
    res.status(500).json({ error: "Server error. Please try WhatsApp or call us directly." });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
