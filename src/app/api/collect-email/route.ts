import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Lazy-instantiate so a missing key only fails at request time, not at build time.
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Split a free-form name into a best-effort {first, last}.
function splitName(full: string | undefined): { first: string; last: string } {
  if (!full) return { first: "", last: "" };
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", last: "" };
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email: string | undefined = body?.email;
    const source: string | undefined = body?.source;
    const name: string | undefined = body?.name;
    const company: string | undefined = body?.company;
    const role: string | undefined = body?.role;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const resend = getResend();
    if (!resend) {
      return NextResponse.json({ error: "Email collection not configured" }, { status: 503 });
    }

    const { first, last } = splitName(name);

    const { data, error } = await resend.contacts.create({
      email,
      firstName: first,
      lastName: last,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID as string,
    });

    if (error) {
      // Resend returns a duplicate-email error when the contact already exists.
      // Treat that as success — the lead is captured, we just don't double-add.
      const msg = (error as any)?.message ?? "";
      if (typeof msg === "string" && /already|exist|duplicate/i.test(msg)) {
        return NextResponse.json({ ok: true, deduped: true, source, role, company });
      }
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data, source, role, company });
  } catch (err) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
