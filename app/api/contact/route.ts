export const runtime = "edge";

import { WorkerMailer } from "worker-mailer";

const TO_EMAIL = "info@expresscustomsconsulting.com";
const MAX_FIELD_LENGTH = 2000;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const fullName = String(body.fullName ?? "").trim();
  const companyName = String(body.companyName ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const description = String(body.description ?? "").trim();

  if (!fullName || !companyName || !email || !phone || !description) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "Invalid email address" }, { status: 400 });
  }

  for (const field of [fullName, companyName, email, phone, description]) {
    if (field.length > MAX_FIELD_LENGTH) {
      return Response.json({ error: "Field too long" }, { status: 400 });
    }
  }

  const zohoEmail = process.env.ZOHO_EMAIL;
  const zohoPassword = process.env.ZOHO_APP_PASSWORD;

  if (!zohoEmail || !zohoPassword) {
    console.error("ZOHO_EMAIL or ZOHO_APP_PASSWORD is not configured");
    return Response.json({ error: "Email service not configured" }, { status: 500 });
  }

  const textBody = [
    `Full Name: ${fullName}`,
    `Company Name: ${companyName}`,
    `Email: ${email}`,
    `Contact No.: ${phone}`,
    "",
    "Description of Requirements:",
    description,
  ].join("\n");

  const htmlBody = `
    <div style="font-family: sans-serif; font-size: 15px; color: #1a2535; line-height: 1.6;">
      <h2 style="margin-bottom: 16px;">New Consultation Request</h2>
      <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
      <p><strong>Company Name:</strong> ${escapeHtml(companyName)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Contact No.:</strong> ${escapeHtml(phone)}</p>
      <p><strong>Description of Requirements:</strong></p>
      <p style="white-space: pre-wrap;">${escapeHtml(description)}</p>
    </div>
  `;

  try {
    const mailer = await WorkerMailer.connect({
      credentials: {
        username: zohoEmail,
        password: zohoPassword,
      },
      authType: "login",
      host: "smtp.zoho.eu",
      port: 465,
      secure: true,
    });

    await mailer.send({
      from: { name: "Express Customs Consulting", email: zohoEmail },
      to: { name: "Express Customs Consulting", email: TO_EMAIL },
      reply: { name: fullName, email: email },
      subject: `New consultation request from ${fullName} (${companyName})`,
      text: textBody,
      html: htmlBody,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact form send failed:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}