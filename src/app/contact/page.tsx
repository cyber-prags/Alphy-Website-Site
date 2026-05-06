"use client";

import { useState } from "react";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Rocket,
  User,
  MessageCircle,
} from "lucide-react";
import { AlphardLogo } from "@/components/AlphardLogo";
import { MarketingNav } from "@/components/MarketingNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const ACCENT = "#266DF0";

export default function ContactPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  const handleSubmit = async () => {
    if (!firstName || !email || !company) return;
    setStatus("loading");
    try {
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  return (
    <div
      className={`${inter.className} min-h-screen`}
      style={{ background: "#FAFAFB", WebkitFontSmoothing: "antialiased" }}
    >
      <div className="px-6 md:px-10 lg:px-12 max-w-[1320px] mx-auto">
        {/* Nav */}
        <MarketingNav active="Contact" />

        {/* Form */}
        <div className="max-w-2xl mx-auto mt-12 flex flex-col justify-center px-12 py-16 lg:pl-14 bg-white">
          {status === "done" ? (
            <div className="text-center py-10">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "rgba(15,194,123,0.12)" }}
              >
                <Check size={24} style={{ color: "#0FC27B" }} />
              </div>
              <h3
                className="text-[20px] font-semibold mb-2"
                style={{ letterSpacing: "-0.02em", color: "#0F1218" }}
              >
                Message sent!
              </h3>
              <p
                className="text-[13.5px] leading-relaxed"
                style={{ color: "rgba(15,18,24,0.55)" }}
              >
                We'll be in touch within a few hours.
                <br />
                Keep an eye on your inbox.
              </p>
            </div>
          ) : (
            <>
              <h2
                className="text-[22px] font-semibold mb-1.5"
                style={{ letterSpacing: "-0.025em", color: "#0F1218" }}
              >
                Get in touch
              </h2>
              <p
                className="text-[13.5px] mb-7 leading-relaxed"
                style={{ color: "rgba(15,18,24,0.55)" }}
              >
                Tell us a bit about your team and we'll reach out to set up a
                call.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  {
                    label: "First name",
                    val: firstName,
                    set: setFirstName,
                    placeholder: "Alex",
                    type: "text",
                  },
                  {
                    label: "Last name",
                    val: lastName,
                    set: setLastName,
                    placeholder: "Johnson",
                    type: "text",
                  },
                ].map((f) => (
                  <Field
                    key={f.label}
                    label={f.label}
                    type={f.type}
                    value={f.val}
                    onChange={f.set}
                    placeholder={f.placeholder}
                  />
                ))}
              </div>

              <div className="space-y-4 mb-4">
                <Field
                  label="Work email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="alex@company.com"
                />
                <Field
                  label="Company"
                  type="text"
                  value={company}
                  onChange={setCompany}
                  placeholder="Acme Inc."
                />
                <div>
                  <label
                    className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-1.5"
                    style={{ color: "rgba(15,18,24,0.50)" }}
                  >
                    Tell us about your situation
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Team size, current tools, what you're trying to solve..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl text-[14px] resize-none"
                    style={{
                      border: "1px solid rgba(15,18,24,0.13)",
                      outline: "none",
                      background: "#FAFAFB",
                      color: "#0F1218",
                      fontFamily: "inherit",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={
                  status === "loading" || !firstName || !email || !company
                }
                className="w-full py-3.5 rounded-xl text-[14.5px] font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                style={{ background: "#0F1218", color: "white" }}
              >
                {status === "loading" ? (
                  "Sending…"
                ) : (
                  <>
                    <span>Send message</span>
                    <ArrowRight size={15} strokeWidth={2.4} />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label
        className="block text-[11.5px] font-semibold uppercase tracking-[0.12em] mb-1.5"
        style={{ color: "rgba(15,18,24,0.50)" }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-[14px]"
        style={{
          border: "1px solid rgba(15,18,24,0.13)",
          outline: "none",
          background: "#FAFAFB",
          color: "#0F1218",
        }}
      />
    </div>
  );
}
