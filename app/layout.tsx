import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TomTom of Gala — The Royal Affairs",
  description: "An evening of heritage, honour and royal celebration. Reserve your place at the TomTom of Gala, 26 December 2026 in Ijaiye, Lagos.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
