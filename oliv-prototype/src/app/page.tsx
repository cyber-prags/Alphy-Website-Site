"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Inter } from "next/font/google";
import { MarketingNav } from "@/components/MarketingNav";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const VIDEO_SRC =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4";

// ──────────────────────────────────────────────────────────────────────
// FadeIn wrapper
// ──────────────────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  duration = 1000,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{ opacity: visible ? 1 : 0, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// AnimatedHeading — character-by-character staggered entrance
// ──────────────────────────────────────────────────────────────────────
function AnimatedHeading({
  text,
  className = "",
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const charDelay = 30;
  const lines = text.split("\n");

  return (
    <h1 className={className} style={style}>
      {lines.map((line, lineIdx) => {
        const chars = line.split("");
        const lineLength = chars.length;
        return (
          <span key={lineIdx} className="block">
            {chars.map((char, charIdx) => {
              const delay =
                lineIdx * lineLength * charDelay + charIdx * charDelay;
              return (
                <span
                  key={charIdx}
                  className="inline-block"
                  style={{
                    opacity: animated ? 1 : 0,
                    transform: animated
                      ? "translateX(0)"
                      : "translateX(-18px)",
                    transitionProperty: "opacity, transform",
                    transitionDuration: "500ms",
                    transitionDelay: `${delay}ms`,
                  }}
                >
                  {char === " " ? " " : char}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      className={`${inter.className} relative min-h-screen bg-black text-white overflow-hidden`}
      style={{
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      } as React.CSSProperties}
    >
      {/* ── Background video — NO overlay ── */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* ── All content above video ── */}
      <div className="relative z-10 min-h-screen flex flex-col px-6 md:px-12 lg:px-16">

        <MarketingNav />

        {/* Hero content — pushed to bottom */}
        <div className="flex-1 flex flex-col justify-end pb-12 lg:pb-16">
          <div className="lg:grid lg:grid-cols-2 lg:items-end gap-8">

            {/* Left column */}
            <div>
              <AnimatedHeading
                text={"Know every account.\nBefore you're asked."}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-normal mb-4 text-white"
                style={{ letterSpacing: "-0.04em" }}
              />

              <FadeIn delay={800} duration={1000}>
                <p className="text-base md:text-lg text-gray-300 mb-5">
                  Alphy gives revenue teams real-time signals, AI agents, and full account context — so you never miss a renewal or close.
                </p>
              </FadeIn>

              <FadeIn delay={1200} duration={1000} className="flex flex-wrap gap-4">
                <button
                  onClick={() => router.push("/signin")}
                  className="bg-white text-black px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-150"
                >
                  Get Started
                </button>
                <button
                  onClick={() => router.push("/signin")}
                  className="liquid-glass border border-white/20 text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-black transition-colors duration-150"
                >
                  Explore Now
                </button>
              </FadeIn>
            </div>

            {/* Right column — tag pill */}
            <div className="flex items-end justify-start lg:justify-end mt-8 lg:mt-0">
              <FadeIn delay={1400} duration={1000}>
                <div className="liquid-glass border border-white/20 px-6 py-3 rounded-xl">
                  <span className="text-lg md:text-xl lg:text-2xl font-light">
                    Signals. Agents. Revenue.
                  </span>
                </div>
              </FadeIn>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
