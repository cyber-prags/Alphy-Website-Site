"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { label: "Product",   href: "/product"   },
  { label: "Customers", href: "/customers" },
  { label: "Pricing",   href: "/pricing"   },
  { label: "Docs",      href: "/docs"      },
];

export function MarketingNav({ active }: { active?: string }) {
  const router = useRouter();
  return (
    <div className="pt-6">
      <nav className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-tight text-white">
          Alphy
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          {NAV_LINKS.map((link) => {
            const isActive = active === link.label;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`transition-colors duration-150 ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
                style={isActive ? { fontWeight: 500 } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <button
          onClick={() => router.push("/signin")}
          className="bg-white text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-150"
        >
          Sign In
        </button>
      </nav>
    </div>
  );
}
