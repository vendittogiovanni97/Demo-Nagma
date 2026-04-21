import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="fixed inset-0 bg-[#0f0f0f] flex flex-col items-center justify-center w-full h-screen overflow-hidden">
      <div className="absolute top-8 left-8">
        <Link href="/" className="text-white/40 hover:text-white/60 transition-colors duration-300">
          <span className="font-outfit font-bold text-lg tracking-widest">NAGMA</span>
        </Link>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/10 font-serif select-none" style={{ fontSize: '25rem', lineHeight: 1, fontWeight: 'bold' }}>
          404
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-6 px-4 max-w-lg text-center">
        <h1 className="text-4xl md:text-5xl font-outfit font-bold text-white">
          Pagina non trovata
        </h1>

        <p className="text-text-secondary text-base md:text-lg">
          La pagina che cerchi non esiste o è stata spostata.
        </p>

        <Link
          href="/"
          className="mt-4 px-8 py-3 rounded-lg border border-[#4ec9e0] text-[#4ec9e0] font-medium hover:bg-[#4ec9e0] hover:text-[#0f0f0f] transition-all duration-300 ease-out"
        >
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
