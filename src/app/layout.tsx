import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { OutboxWidget } from "@/components/Outbox";
import { TourProvider } from "@/components/Tour";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VIBGYOR Alumni Platform",
  description: "Prototype of the VIBGYOR Alumni Association platform: safe mentoring, verified alumni and campus communications.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d17" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('vaa-theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${jakarta.variable} antialiased`}>
        <StoreProvider>
          <TourProvider>
            {children}
            <OutboxWidget />
          </TourProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
