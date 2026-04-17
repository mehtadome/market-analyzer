import { google } from "googleapis";
import { gmail_v1 } from "googleapis";

const BODY_CHAR_LIMIT = 8000;

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: "v1", auth: oauth2Client });

export interface EmailSummary {
  id: string;
  subject: string;
  sender: string;
}

export interface EmailContent {
  id: string;
  subject: string;
  sender: string;
  body: string;
}

/**
 * Search Gmail for emails matching a query string.
 * Returns lightweight stubs (id, subject, sender) — no body.
 */
export async function searchEmails(
  query: string,
  maxResults: number = 1
): Promise<EmailSummary[]> {
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults,
  });

  const stubs = listRes.data.messages ?? [];
  const results: EmailSummary[] = [];

  for (const stub of stubs) {
    if (!stub.id) continue;
    const msg = await gmail.users.messages.get({
      userId: "me",
      id: stub.id,
      format: "metadata",
      metadataHeaders: ["Subject", "From"],
    });
    const headers = indexHeaders(msg.data.payload?.headers ?? []);
    results.push({
      id: stub.id,
      subject: headers["subject"] ?? "(no subject)",
      sender: headers["from"] ?? "",
    });
  }

  return results;
}

/**
 * Fetch the full plain-text body of an email by message ID.
 */
export async function getEmail(messageId: string): Promise<EmailContent> {
  const msg = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  const headers = indexHeaders(msg.data.payload?.headers ?? []);
  const body = extractBody(msg.data.payload ?? {});

  return {
    id: messageId,
    subject: headers["subject"] ?? "(no subject)",
    sender: headers["from"] ?? "",
    body: (body || msg.data.snippet || "").slice(0, BODY_CHAR_LIMIT),
  };
}

// --- helpers ---

function indexHeaders(
  headers: gmail_v1.Schema$MessagePartHeader[]
): Record<string, string> {
  return Object.fromEntries(
    headers.map((h) => [h.name?.toLowerCase() ?? "", h.value ?? ""])
  );
}

function extractBody(payload: gmail_v1.Schema$MessagePart): string {
  const mime = payload.mimeType ?? "";

  if (mime === "text/plain") {
    const data = payload.body?.data;
    if (data) return Buffer.from(data, "base64").toString("utf-8");
  }

  for (const part of payload.parts ?? []) {
    const result = extractBody(part);
    if (result) return result;
  }

  return "";
}
