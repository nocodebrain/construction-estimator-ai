import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Construction Estimator",
  description: "Transform construction estimating from days to minutes using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
