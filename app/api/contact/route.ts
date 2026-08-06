const TO_EMAIL = "info@expresscustomsconsulting.com";
const SMTP_HOST = "smtppro.zoho.eu";
const SMTP_PORT = 465;
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

function isRunningOnCloudflareWorkers(): boolean {
  return typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers";
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

  const username = process.env.ZOHO_SMTP_USER;
  const password = process.env.ZOHO_SMTP_PASSWORD;
  if (!username || !password) {
    console.error("ZOHO_SMTP_USER / ZOHO_SMTP_PASSWORD are not configured");
    return Response.json({ error: "Email service not configured" }, { status: 500 });
  }

  const subject = `New consultation request from ${fullName} (${companyName})`;
  const text = [
    `Full Name: ${fullName}`,
    `Company Name: ${companyName}`,
    `Email: ${email}`,
    `Contact No.: ${phone}`,
    "",
    "Description of Requirements:",
    description,
  ].join("\n");
  const html = `
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
    if (isRunningOnCloudflareWorkers()) {
      const { WorkerMailer } = await import("worker-mailer");
      await WorkerMailer.send(
        {
          host: SMTP_HOST,
          port: SMTP_PORT,
          secure: true,
          credentials: { username, password },
          authType: "plain",
        },
        {
          from: { name: "Express Customs Consulting Website", email: username },
          to: { email: TO_EMAIL },
          reply: { email },
          subject,
          text,
          html,
        }
      );
    } else {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: true,
        auth: { user: username, pass: password },
      });
      await transporter.sendMail({
        from: `"Express Customs Consulting Website" <${username}>`,
        to: TO_EMAIL,
        replyTo: email,
        subject,
        text,
        html,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("Contact form SMTP send failed:", err);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}
