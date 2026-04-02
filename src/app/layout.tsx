import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Student Grades Portal",
  description: "Students view grades; admins manage roster via Excel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
