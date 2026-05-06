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
          background: "rgba(20, 22, 26, 0.55)",
          backdropFilter: "blur(20px) saturate(140%)",
          WebkitBackdropFilter: "blur(20px) saturate(140%)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5" aria-label="Alphard">
          <AlphardLogo variant="icon" size={22} fill="#fff" />
          <span className="text-[18px] font-semibold tracking-tight text-white">Alphard</span>
        </Link>

        <div className="hidden md:flex items-center gap-9 text-[13.5px]">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.label;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors duration-150 ${
                  isActive ? "text-white" : "text-white/65 hover:text-white"
                }`}
                style={isActive ? { fontWeight: 500 } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push("/signin")}
            className="hidden md:inline-flex text-white/75 hover:text-white px-3 py-2 rounded-lg text-[13.5px] font-medium transition-colors"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push("/home")}
            className="bg-white text-black px-5 py-2 rounded-lg text-[13.5px] font-semibold hover:bg-white/90 transition-colors duration-150"
          >
            Launch demo
          </button>
        </div>
      </nav>
    </div>
  );
}
