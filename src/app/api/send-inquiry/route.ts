import { NextResponse } from "next/server";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

/* ---------- ENV ---------- */
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY || "";

const ses = new SESClient({
  region: process.env.AWS_REGION || "ca-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

/* ---------- Types ---------- */
type ArtworkMini = { slug: string; title: string } | null;
type InquiryKind = "artwork" | "exhibition-commission" | "other";

type ECDetails = {
  org?: string | null;
  dates?: string | null;
  location?: string | null;
  site?: string | null; // for exhibition
  size?: string | null; // for commission
  deadline?: string | null;
  budget?: string | null;
  reference?: string | null;
} | null;

/* ---------- Utils ---------- */
function pickClientIP(req: Request) {
  // Do not rely on req.ip; use headers behind proxies
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf;
  const xr = req.headers.get("x-real-ip");
  if (xr) return xr;
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return "";
}

async function verifyTurnstile(token: string, ip: string) {
  if (!TURNSTILE_SECRET) return { ok: false as const, reason: "missing-secret" };
  if (!token) return { ok: false as const, reason: "missing-token" };

  try {
    const resp = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET,
        response: token,
        remoteip: ip || "",
      }),
    });
    const data = (await resp.json()) as { success?: boolean; ["error-codes"]?: string[] };
    if (!data?.success) return { ok: false as const, reason: "failed", codes: data["error-codes"] || [] };
    return { ok: true as const };
  } catch {
    return { ok: false as const, reason: "exception" };
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------- Email bodies (HTML + text) ---------- */
function textArtwork({ name, email, message, artwork }: { name: string; email: string; message: string; artwork: ArtworkMini }) {
  const artLine = artwork ? `Artwork: ${artwork.title}  (/${artwork.slug})` : "Artwork: (none selected)";
  return `New Artwork inquiry from smitsartstudio.com

${artLine}
From: ${name} <${email}>

Message:
${message}

— Sent ${new Date().toLocaleString()}
`;
}

function htmlArtwork({ name, email, message, artwork }: { name: string; email: string; message: string; artwork: ArtworkMini }) {
  const hasArt = Boolean(artwork);
  const artTitle = hasArt ? artwork!.title : "None selected";
  const artUrl = hasArt ? `https://smitsartstudio.com/works/${artwork!.slug}` : null;

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f8faf9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;color:#0c1c17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e6f4ef;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e6f4ef;">
          <div style="font-size:14px;letter-spacing:.08em;color:#0c1c17;opacity:.7;text-transform:uppercase;">Smits Art Studio</div>
          <div style="font-size:20px;font-weight:700;margin-top:4px;">New Artwork inquiry</div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;">From</td>
              <td style="font-size:14px;"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}" style="color:#0c1c17;text-decoration:none;">${escapeHtml(email)}</a>&gt;</td>
            </tr>
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;">Artwork</td>
              <td style="font-size:14px;">
                ${
                  hasArt
                    ? `<strong>${escapeHtml(artTitle)}</strong><div style="margin-top:4px;"><a href="${artUrl}" style="color:#0c1c17;text-decoration:underline;">View artwork page</a></div>`
                    : `<span style="opacity:.7;">None selected</span>`
                }
              </td>
            </tr>
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;vertical-align:top;padding-top:4px;">Message</td>
              <td style="font-size:14px;white-space:pre-wrap;line-height:1.5;">${escapeHtml(message)}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:12px 14px;background:#f3f7f5;border:1px solid #e6f4ef;border-radius:8px;font-size:12px;color:#21332c;">Tip: replying to this email will go to the inquirer’s address.</div>
          <div style="margin-top:16px;font-size:12px;color:#5b6b65;">Sent ${new Date().toLocaleString()}</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function textEC({ subtype, name, email, message, details }: { subtype: "exhibition" | "commission"; name: string; email: string; message: string; details: ECDetails }) {
  return `New ${subtype === "exhibition" ? "Exhibition" : "Commission"} inquiry from smitsartstudio.com

Organization: ${details?.org || "(not provided)"}
Dates / Timeline: ${details?.dates || "(not provided)"}
Location: ${details?.location || "(not provided)"}
${subtype === "exhibition" ? `Site conditions: ${details?.site || "(not provided)"}` : `Size / scope: ${details?.size || "(not provided)"}`}
Deadline: ${details?.deadline || "(not provided)"}
Budget: ${details?.budget || "(not provided)"}
Reference: ${details?.reference || "(not provided)"}

From: ${name} <${email}>

Message:
${message}

— Sent ${new Date().toLocaleString()}
`;
}

function htmlEC({ subtype, name, email, message, details }: { subtype: "exhibition" | "commission"; name: string; email: string; message: string; details: ECDetails }) {
  const title = `New ${subtype === "exhibition" ? "Exhibition" : "Commission"} inquiry`;
  const rows = [
    ["Organization", details?.org || "(not provided)"],
    ["Dates / timeline", details?.dates || "(not provided)"],
    ["Location", details?.location || "(not provided)"],
    [subtype === "exhibition" ? "Site conditions" : "Size / scope", (subtype === "exhibition" ? details?.site : details?.size) || "(not provided)"],
    ["Deadline", details?.deadline || "(not provided)"],
    ["Budget", details?.budget || "(not provided)"],
    ["Reference", details?.reference || "(not provided)"],
  ];

  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f8faf9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;color:#0c1c17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e6f4ef;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e6f4ef;">
          <div style="font-size:14px;letter-spacing:.08em;color:#0c1c17;opacity:.7;text-transform:uppercase;">Smits Art Studio</div>
          <div style="font-size:20px;font-weight:700;margin-top:4px;">${title}</div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;">From</td>
              <td style="font-size:14px;"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}" style="color:#0c1c17;text-decoration:none;">${escapeHtml(email)}</a>&gt;</td>
            </tr>
            ${rows
              .map(
                ([label, value]) => `<tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;">${escapeHtml(label as string)}</td>
              <td style="font-size:14px;">${escapeHtml(String(value))}</td>
            </tr>`
              )
              .join("")}
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;vertical-align:top;padding-top:4px;">Message</td>
              <td style="font-size:14px;white-space:pre-wrap;line-height:1.5;">${escapeHtml(message)}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:12px 14px;background:#f3f7f5;border:1px solid #e6f4ef;border-radius:8px;font-size:12px;color:#21332c;">Tip: replying to this email will go to the inquirer’s address.</div>
          <div style="margin-top:16px;font-size:12px;color:#5b6b65;">Sent ${new Date().toLocaleString()}</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function textOther({ name, email, subject, message }: { name: string; email: string; subject?: string; message: string }) {
  return `New Other inquiry from smitsartstudio.com

Subject: ${subject || "(none)"}
From: ${name} <${email}>

Message:
${message}

— Sent ${new Date().toLocaleString()}
`;
}

function htmlOther({ name, email, subject, message }: { name: string; email: string; subject?: string; message: string }) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f8faf9;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;color:#0c1c17;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e6f4ef;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e6f4ef;">
          <div style="font-size:14px;letter-spacing:.08em;color:#0c1c17;opacity:.7;text-transform:uppercase;">Smits Art Studio</div>
          <div style="font-size:20px;font-weight:700;margin-top:4px;">New Other inquiry</div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 10px;">
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;">From</td>
              <td style="font-size:14px;"><strong>${escapeHtml(name)}</strong> &lt;<a href="mailto:${escapeHtml(email)}" style="color:#0c1c17;text-decoration:none;">${escapeHtml(email)}</a>&gt;</td>
            </tr>
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;">Subject</td>
              <td style="font-size:14px;">${escapeHtml(subject || "(none)")}</td>
            </tr>
            <tr>
              <td style="width:160px;color:#5b6b65;font-size:13px;vertical-align:top;padding-top:4px;">Message</td>
              <td style="font-size:14px;white-space:pre-wrap;line-height:1.5;">${escapeHtml(message)}</td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:12px 14px;background:#f3f7f5;border:1px solid #e6f4ef;border-radius:8px;font-size:12px;color:#21332c;">Tip: replying to this email will go to the inquirer’s address.</div>
          <div style="margin-top:16px;font-size:12px;color:#5b6b65;">Sent ${new Date().toLocaleString()}</div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/* ---------- Handler ---------- */
export async function POST(req: Request) {
  try {
    const ip = pickClientIP(req);
    const body = await req.json();

    const kind = (body?.kind as InquiryKind) || "artwork";
    const subtype = body?.subtype as ("exhibition" | "commission") | undefined;
    const name = String(body?.name || "");
    const email = String(body?.email || "");
    const message = String(body?.message || "");
    const artwork = (body?.artwork as ArtworkMini) ?? null;
    const details: ECDetails = (body?.details as ECDetails) ?? null;
    const otherSubject = body?.subject ? String(body.subject) : undefined;
    const hp = String(body?.hp || "");
    const turnstileToken = String(body?.turnstileToken || "");

    // honeypot: silently succeed
    if (hp) return NextResponse.json({ success: true });

    // basic validation
    if (!name || !email || !message) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    // Turnstile verification
    const ver = await verifyTurnstile(turnstileToken, ip);
    if (!ver.ok) {
      const msg =
        ver.reason === "missing-secret"
          ? "Server missing TURNSTILE_SECRET_KEY"
          : ver.reason === "missing-token"
          ? "Please complete verification"
          : "Verification failed or expired, please refresh page if the issue persists";
      return NextResponse.json({ success: false, error: msg }, { status: ver.reason === "missing-secret" ? 500 : 400 });
    }

    // Build subject + bodies
    let subject = "New Inquiry";
    let html = "";
    let text = "";

    if (kind === "artwork") {
      subject = `New Inquiry • Artwork${artwork?.title ? ` • ${artwork.title}` : ""} • ${name}`;
      html = htmlArtwork({ name, email, message, artwork });
      text = textArtwork({ name, email, message, artwork });
    } else if (kind === "exhibition-commission") {
      const sub = subtype === "commission" ? "Commission" : "Exhibition";
      subject = `New Inquiry • ${sub} • ${details?.org || name}`;
      html = htmlEC({ subtype: subtype === "commission" ? "commission" : "exhibition", name, email, message, details });
      text = textEC({ subtype: subtype === "commission" ? "commission" : "exhibition", name, email, message, details });
    } else {
      subject = `New Inquiry • Other${otherSubject ? ` • ${otherSubject}` : ""} • ${name}`;
      html = htmlOther({ name, email, subject: otherSubject, message });
      text = textOther({ name, email, subject: otherSubject, message });
    }

    // Send via SES (exactly as before)
    const send = new SendEmailCommand({
      Source: process.env.SES_FROM || "no-reply@smitsartstudio.com",
      Destination: { ToAddresses: [process.env.SES_TO || "contact@smitsartstudio.com"] },
      ReplyToAddresses: [email],
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Html: { Data: html, Charset: "UTF-8" },
          Text: { Data: text, Charset: "UTF-8" },
        },
      },
    });

    await ses.send(send);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Send failed" }, { status: 500 });
  }
}