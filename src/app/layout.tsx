import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { OutboxWidget } from "@/components/Outbox";
import { TourProvider } from "@/components/Tour";
import { MotionProvider } from "@/components/motion";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: "VIBGYOR Alumni Platform",
  description: "One VIBGYOR. Every Generation. A Lifetime of Connections. The VIBGYOR Alumni Association platform: safe mentoring, verified alumni and campus communications.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: dark)", color: "#101827" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('vaa-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        <MotionProvider>
        <StoreProvider>
          <TourProvider>
            {children}
            <OutboxWidget />
          </TourProvider>
        </StoreProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
