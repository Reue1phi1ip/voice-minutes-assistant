import "./globals.css";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen">
            <header className="border-b bg-white/70 backdrop-blur">
              <div className="mx-auto max-w-5xl px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">Voice Minutes Assistant</div>
                    <div className="text-sm text-zinc-600">
                      Record → Upload → Transcript → Minutes → Spoken recap
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Next.js + Convex + OpenAI
                  </div>
                </div>
              </div>
            </header>
            <main className="mx-auto max-w-5xl px-4 py-8">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
