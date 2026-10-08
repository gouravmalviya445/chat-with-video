export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center bg-background p-4 relative overflow-hidden">
      {/* Background paper accents */}
      <div className="absolute top-10 left-10 text-neutral-300 font-handwritten text-4xl select-none -rotate-12 pointer-events-none hidden md:block">
        ★ chat with video RAG
      </div>
      <div className="absolute bottom-10 right-10 text-neutral-300 font-handwritten text-4xl select-none rotate-12 pointer-events-none hidden md:block">
        ✎ ask questions
      </div>
      
      {children}
    </main>
  )
}