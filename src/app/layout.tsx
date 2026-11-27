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

/* After a redeploy, a tab that was already open may try a full reload of the next page.
   Next.js (static export) then opens the page's data file (…/index.txt?_rsc=…) instead of the page.
   Catch that navigation and load the real page instead. */
const staleTabGuard = `try{if(window.navigation){navigation.addEventListener('navigate',function(e){try{var u=new URL(e.destination.url);if(u.origin===location.origin&&/\\/index\\.txt$/.test(u.pathname)&&e.cancelable){e.preventDefault();location.assign(u.pathname.replace(/index\\.txt$/,'')+u.hash)}}catch(_){}})}}catch(_){}`;

const themeScript = `try{var t=localStorage.getItem('vaa-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: staleTabGuard }} />
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
