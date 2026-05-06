"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlphardLogo } from "./AlphardLogo";
import { MessageCircle } from "lucide-react";

export function MarketingNav({ active }: { active?: string } = {}) {
  void active;
  const router = useRouter();
  return (
    <div className="pt-6">
      <nav
        className="rounded-2xl px-5 py-3 flex items-center justify-between"
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "1px solid rgba(15,18,24,0.08)",
          boxShadow: "0 1px 2px rgba(15,18,24,0.04)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Alphard">
          <AlphardLogo variant="icon" size={22} fill="#0F1218" />
          <span className="text-[18px] font-semibold tracking-tight" style={{ color: "#0F1218" }}>Alphard</span>
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="mailto:pragyan@alphard.global?subject=Alphard%20feedback"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13.5px] font-medium transition-colors"
            style={{
              background: "white",
              border: "1px solid rgba(15,18,24,0.12)",
              color: "#0F1218",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
          >
            <MessageCircle size={13} strokeWidth={2} />
            Send feedback
          </a>
          <button
            onClick={() => router.push("/signin")}
            className="px-5 py-2 rounded-lg text-[13.5px] font-semibold transition-colors duration-150 text-white"
            style={{ background: "#0F1218" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#000")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#0F1218")}
          >
            Launch demo
          </button>
        </div>
      </nav>
    </div>
  );
}
