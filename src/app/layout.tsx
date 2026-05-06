import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PersonaProvider } from "@/components/PersonaContext";
import { ClosureProvider } from "@/components/ClosureContext";
import { GoalsProvider } from "@/components/GoalsContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { UserProvider } from "@/components/UserContext";

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
  title: "Alphard — Revenue Workspace",
  description: "AI-native revenue orchestration for sales and account teams",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ThemeProvider>
          <UserProvider>
            <PersonaProvider>
              <GoalsProvider>
                <ClosureProvider>{children}</ClosureProvider>
              </GoalsProvider>
            </PersonaProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
