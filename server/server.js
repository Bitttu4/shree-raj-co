const fs = require("fs/promises");
const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const OWNER_EMAIL = process.env.OWNER_EMAIL || process.env.EMAIL_USER || "shreerajco@yahoo.com";
const SERVICE_VALUES = [
  "Income Tax / ITR Filing",
  "GST Filing & Compliance",
  "Business Registration",
  "Tax Notice / Scrutiny",
  "Accounting Support",
  "Other"
];

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(express.urlencoded({ extended: false, limit: "32kb" }));
app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  next();
});

const allowedOrigins = (process.env.ALLOWED_ORIGINS || process.env.ALLOWED_ORIGIN || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 204
}));

const contactLimiter = rateLimit({
  windowMs: Number(process.env.CONTACT_RATE_LIMIT_WINDOW_MS) || 60 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT_MAX) || 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions. Please try again later." }
});

function parseServiceAccount() {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    return null;
  }

  try {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.warn("FIREBASE_SERVICE_ACCOUNT is not valid JSON. Firestore storage is disabled.");
    return null;
  }
}

function initializeFirestore() {
  const serviceAccount = parseServiceAccount();

  if (!serviceAccount) {
    return null;
  }

  try {
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }

    return admin.firestore();
  } catch (error) {
    console.warn("Firebase Admin could not be initialized. Firestore storage is disabled.");
    return null;
  }
}

function createTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !OWNER_EMAIL) {
    return null;
  }

  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const db = initializeFirestore();
const transporter = createTransporter();

function normalizePhone(value) {
  if (!value) {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");
  return digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(value) {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}

function safeSubject(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ").slice(0, 120);
}

async function saveSubmission(record) {
  const storage = { firestore: false, file: false };

  if (db) {
    await db.collection("contact_submissions").add({
      ...record,
      submittedAt: admin.firestore.Timestamp.fromDate(new Date(record.submittedAt))
    });
    storage.firestore = true;
  }

  if (process.env.DISABLE_FILE_STORAGE !== "true") {
    const dataDir = path.resolve(__dirname, process.env.DATA_DIR || "data");
    const filePath = path.join(dataDir, "contact-submissions.jsonl");
    await fs.mkdir(dataDir, { recursive: true });
    await fs.appendFile(filePath, `${JSON.stringify(record)}\n`, "utf8");
    storage.file = true;
  }

  return storage;
}

async function sendNotifications(record) {
  if (!transporter) {
    return { enabled: false, owner: false, customer: false };
  }

  const rows = [
    ["Name", record.name],
    ["Email", record.email],
    ["Phone", record.phone || "Not shared"],
    ["Service", record.service],
    ["Message", record.message],
    ["Time", new Date(record.submittedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })]
  ].map(([label, value]) => `
      <tr>
        <td style="padding:10px 0;color:#60737b;width:96px;vertical-align:top">${escapeHtml(label)}</td>
        <td style="padding:10px 0;color:#21343c;font-weight:600">${textToHtml(value)}</td>
      </tr>
    `).join("");

  await transporter.sendMail({
    from: `"Shree Raj & Co. Website" <${process.env.EMAIL_USER}>`,
    to: OWNER_EMAIL,
    subject: `New website enquiry: ${safeSubject(record.name)}`,
    replyTo: record.email,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;border:1px solid #d8e6e2;border-radius:8px;overflow:hidden">
        <div style="background:#1f4659;color:#fff;padding:24px">
          <h2 style="margin:0;font-size:20px">New Contact Form Submission</h2>
          <p style="margin:6px 0 0;color:#dff3ed;font-size:13px">Shree Raj & Co. website enquiry</p>
        </div>
        <div style="padding:24px;background:#fbfdfb">
          <table style="width:100%;border-collapse:collapse">${rows}</table>
        </div>
      </div>
    `
  });

  await transporter.sendMail({
    from: `"Shree Raj & Co." <${process.env.EMAIL_USER}>`,
    to: record.email,
    subject: "We received your enquiry | Shree Raj & Co.",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#21343c">
        <h2 style="color:#1f4659">Thank you, ${escapeHtml(record.name)}.</h2>
        <p>We received your enquiry and will contact you shortly.</p>
        <p style="color:#60737b;font-size:14px"><strong>Service:</strong> ${escapeHtml(record.service)}</p>
        <p style="color:#60737b;font-size:14px"><strong>Your message:</strong><br>${textToHtml(record.message)}</p>
        <hr style="border:none;border-top:1px solid #d8e6e2;margin:24px 0">
        <p style="font-size:13px;color:#60737b">Shree Raj & Co. | Tax Consultants, Vadodara<br>+91 94265 36855</p>
      </div>
    `
  });

  return { enabled: true, owner: true, customer: true };
}

const validateContact = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("Enter a valid full name."),
  body("email")
    .trim()
    .isEmail().withMessage("Enter a valid email address.")
    .normalizeEmail(),
  body("phone")
    .optional({ checkFalsy: true })
    .customSanitizer(normalizePhone)
    .matches(/^[6-9]\d{9}$/).withMessage("Enter a valid 10-digit Indian mobile number."),
  body("service")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(SERVICE_VALUES).withMessage("Choose a valid service."),
  body("message")
    .trim()
    .isLength({ min: 10, max: 1200 }).withMessage("Message must be 10 to 1200 characters."),
  body("website")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (value) {
        throw new Error("Spam detected.");
      }

      return true;
    })
];

app.get(["/health", "/api/health"], (_, res) => {
  res.json({
    status: "ok",
    service: "shree-raj-co-api",
    storage: {
      firestore: Boolean(db),
      localFile: process.env.DISABLE_FILE_STORAGE !== "true"
    },
    email: Boolean(transporter),
    allowedOrigins
  });
});

app.get("/api/services", (_, res) => {
  res.json({
    success: true,
    services: SERVICE_VALUES.map((name) => ({ name }))
  });
});

app.post(["/contact", "/api/contact"], contactLimiter, validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const record = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone || "",
    service: req.body.service || "General enquiry",
    message: req.body.message,
    submittedAt: new Date().toISOString(),
    ip: req.ip,
    userAgent: req.get("user-agent") || ""
  };

  try {
    const storage = await saveSubmission(record);
    const notifications = await sendNotifications(record);

    if (!storage.firestore && !storage.file && !notifications.owner) {
      throw new Error("No storage or notification channel is configured.");
    }

    res.status(201).json({
      success: true,
      message: "Enquiry received.",
      storage,
      notifications
    });
  } catch (error) {
    console.error("Contact submission error:", error);
    res.status(502).json({
      success: false,
      error: "The enquiry could not be processed. Please call or WhatsApp us directly."
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

app.use((error, req, res, next) => {
  if (error.message === "Origin not allowed by CORS") {
    res.status(403).json({ success: false, error: "Origin not allowed." });
    return;
  }

  next(error);
});

app.use((error, req, res, next) => {
  console.error("Unhandled server error:", error);
  res.status(500).json({ success: false, error: "Server error." });
});

app.listen(PORT, () => {
  console.log(`Shree Raj & Co. API listening on port ${PORT}`);
  console.log(`Storage: firestore=${Boolean(db)} localFile=${process.env.DISABLE_FILE_STORAGE !== "true"}`);
  console.log(`Email notifications: ${Boolean(transporter)}`);
});
