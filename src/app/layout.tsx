import type { Metadata } from "next";
//import "./globals.css";

export const metadata: Metadata = {
  title: "إعدادية هيت المهنية - Student Grades Portal",
  description: "Students view grades; admins manage roster via Excel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <header className="text-center py-4 bg-[var(--surface)] border-b border-[var(--border)]">
          <h1 className="text-xl font-bold text-[var(--text)]">إعدادية هيت المهنية</h1>
         
        </header>
        {children}
      </body>
    </html>
  );
}
