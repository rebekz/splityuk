// TEMPORARILY DISABLED AUTH FOR TESTING
// TODO: Re-enable after configuring OAuth

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/dashboard" className="font-bold text-xl">
            SplitYuk
          </a>
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm hover:underline">
              Dashboard
            </a>
            <a href="/profil" className="text-sm hover:underline">
              Profile
            </a>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
