import type { Metadata } from "next";
import { Noto_Nastaliq_Urdu, Outfit } from "next/font/google";
import { Particles } from "@/components/layout/Particles";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-nastaliq",
});

export const metadata: Metadata = {
  title: "IQRA AOE · Academy of Excellence",
  description: "Premium academy for English, Hindi, Urdu, and Maharashtra State Board mathematics from Class 1 to 10.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${nastaliq.variable} font-sans antialiased`}>
        <Particles />
        <AppProviders>
          <div className="relative z-10">{children}</div>
        </AppProviders>
      </body>
    </html>
  );
}
