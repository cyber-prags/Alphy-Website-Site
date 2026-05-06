"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlphardLogo } from "./AlphardLogo";

const NAV_LINKS = [
  { label: "Platform",  href: "/product"   },
  { label: "Customers", href: "/customers" },
  { label: "Pricing",   href: "/pricing"   },
  { label: "Docs",      href: "/docs"      },
];

export function MarketingNav({ active }: { active?: string }) {
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

        <div className="hidden md:flex items-center gap-9 text-[13.5px]">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.label;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="transition-colors duration-150"
                style={{
                  color: isActive ? "#0F1218" : "rgba(15,18,24,0.62)",
                  fontWeight: isActive ? 500 : 400,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = "#0F1218"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "rgba(15,18,24,0.62)"; }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/signin")}
            className="hidden md:inline-flex px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors"
            style={{ color: "rgba(15,18,24,0.65)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#0F1218")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(15,18,24,0.65)")}
          >
            Sign in
          </button>
          <button
            onClick={() => router.push("/home")}
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
