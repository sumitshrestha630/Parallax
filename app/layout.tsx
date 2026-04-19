import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rooted — Build Your Future",
  description: "A gamified skill-building platform for college students.",
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
