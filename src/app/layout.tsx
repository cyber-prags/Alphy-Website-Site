import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PersonaProvider } from "@/components/PersonaContext";
import { ClosureProvider } from "@/components/ClosureContext";
import { GoalsProvider } from "@/components/GoalsContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { UserProvider } from "@/components/UserContext";
import { PostHogProvider } from "@/components/PostHogProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alphard — Run Expansion like a pipeline",
    template: "%s · Alphard",
  },
  description:
    "The Expansion OS for Account Managers. Every signal in your book — usage, champion moves, ticket velocity, renewal proximity — fused into one ranked daily list of expansion plays.",
  applicationName: "Alphard",
  keywords: [
    "expansion", "account management", "revenue intelligence",
    "AM platform", "expansion AI", "champion tracking", "expansion playbooks",
  ],
  authors: [{ name: "Alphard" }],
  openGraph: {
    type: "website",
    siteName: "Alphard",
    title: "Alphard — Run Expansion like a pipeline",
    description:
      "The Expansion OS for Account Managers. One ranked daily list of expansion plays from every signal in your book.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alphard — Run Expansion like a pipeline",
    description:
      "The Expansion OS for Account Managers. One ranked daily list of expansion plays from every signal in your book.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <PostHogProvider>
          <ThemeProvider>
            <UserProvider>
              <PersonaProvider>
                <GoalsProvider>
                  <ClosureProvider>{children}</ClosureProvider>
                </GoalsProvider>
              </PersonaProvider>
            </UserProvider>
          </ThemeProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}
