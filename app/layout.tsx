import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "F1Pilot — Your next chapter, prepared.",
  description:
    "A private, evidence-backed preparation workspace for your F-1 student journey.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
