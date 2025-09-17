import "./globals.css";

export const metadata = {
  title: "JoeyLLM — Chat",
  description: "Chat interface for JoeyLLM",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-amber-700 text-slate-100 antialiased">
        <div className="mx-auto max-w-3xl p-4 md:p-6">{children}</div>
      </body>
    </html>
  );
}
